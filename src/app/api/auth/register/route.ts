import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmailConfirmationEmail } from '@/lib/resend/emails';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, role, secondary_roles, lang } = await req.json();

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // ── Step 1: Create user (or reuse existing unconfirmed account) ──────────
    let userId: string;

    const { data: userData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,          // hard-blocks password login until link clicked
        user_metadata: {
          full_name,
          role,
          secondary_roles: secondary_roles ?? [],
        },
      });

    if (createError) {
      // "User already registered" → only recoverable if the account is still unconfirmed
      if (!createError.message.toLowerCase().includes('already')) {
        console.error('[register] createUser error:', createError.message);
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // Look up the existing user
      const { data: list } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users?.find(u => u.email === email);

      if (!existing) {
        return NextResponse.json({ error: 'Email already registered. Please sign in.' }, { status: 400 });
      }

      if (existing.email_confirmed_at) {
        // Already confirmed → they can just log in
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in.' },
          { status: 400 },
        );
      }

      // Unconfirmed → resend the confirmation link (update metadata + re-issue link)
      console.log('[register] existing unconfirmed user, resending link:', existing.id);
      await adminSupabase.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: { full_name, role, secondary_roles: secondary_roles ?? [] },
      });
      userId = existing.id;
    } else {
      userId = userData!.user!.id;
      console.log('[register] user created:', userId);
    }

    // ── Step 2: Generate a one-time confirmation link ────────────────────────
    // 'signup' is the only type that actually confirms the email address
    // (sets email_confirmed_at). 'recovery' / 'magiclink' only create a session.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    console.log('[register] appUrl:', appUrl);

    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,   // required by the signup type; same password as used at createUser
        options: {
          redirectTo: `${appUrl}/api/auth/callback?source=signup`,
        },
      });

    console.log('[register] generateLink error:', linkError?.message ?? 'none');
    console.log('[register] action_link present:', !!linkData?.properties?.action_link);
    if (linkData?.properties?.action_link) {
      console.log('[register] action_link prefix:', linkData.properties.action_link.substring(0, 60));
    }

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[register] generateLink failed:', linkError?.message);
      return NextResponse.json(
        { error: `Could not generate confirmation link: ${linkError?.message ?? 'empty'}` },
        { status: 500 },
      );
    }

    // ── Step 3: Send branded email via Resend ────────────────────────────────
    const sendResult = await sendEmailConfirmationEmail(
      email,
      full_name,
      linkData.properties.action_link,
      lang,
    );
    console.log('[register] resend result:', JSON.stringify(sendResult));

    if (sendResult.error) {
      console.error('[register] resend error:', JSON.stringify(sendResult.error));
      return NextResponse.json(
        { error: `Email delivery failed: ${JSON.stringify(sendResult.error)}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[register] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
