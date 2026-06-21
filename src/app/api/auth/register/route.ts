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

    // ── Step 1: Create user ───────────────────────────────────────────────────
    let userId: string;

    const { data: userData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name, role, secondary_roles: secondary_roles ?? [] },
      });

    if (createError) {
      const alreadyExists = createError.message.toLowerCase().includes('already');
      if (!alreadyExists) {
        console.error('[register] createUser error:', createError.message);
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // ── Fast lookup: query public.users by email (indexed, O(1)) ────────────
      // Much faster than listUsers({ perPage: 1000 }) which loads ALL users
      const { data: existingProfile } = await adminSupabase
        .from('users')
        .select('id, email_confirmed_at:raw_user_meta_data')
        .eq('email', email)
        .maybeSingle();

      // Fallback to auth.admin if profile not found yet (edge case: profile trigger not run)
      let existingId: string | null = existingProfile?.id ?? null;
      let isConfirmed = false;

      if (!existingId) {
        // Slower fallback — only triggered if the public.users row doesn't exist yet
        const { data: list } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
        const found = list?.users?.find(u => u.email === email);
        if (!found) {
          return NextResponse.json({ error: 'Email already registered. Please sign in.' }, { status: 400 });
        }
        existingId  = found.id;
        isConfirmed = !!found.email_confirmed_at;
      } else {
        // Check confirmation status directly from auth.users via RPC
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(existingId);
        isConfirmed = !!authUser?.user?.email_confirmed_at;
      }

      if (isConfirmed) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in.' },
          { status: 400 },
        );
      }

      // Unconfirmed → update credentials and resend link
      await adminSupabase.auth.admin.updateUserById(existingId!, {
        password,
        user_metadata: { full_name, role, secondary_roles: secondary_roles ?? [] },
      });
      userId = existingId!;
      console.log('[register] resending confirmation to existing unconfirmed user:', userId);
    } else {
      userId = userData!.user!.id;
      console.log('[register] new user created:', userId);
    }

    // ── Step 1b: Save preferred language to user profile ─────────────────────
    // The DB trigger creates the users row but doesn't set preferred_language.
    // We update it here so sign-legal / ContractsModal can read it reliably.
    const validLang = ['en', 'de', 'es', 'el'].includes(lang) ? lang : 'en';
    await adminSupabase
      .from('users')
      .update({ preferred_language: validLang })
      .eq('id', userId);

    // ── Step 2 & 3: Generate link + build clean URL ────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const { data: linkData, error: linkError } =
      await adminSupabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { redirectTo: `${appUrl}/api/auth/callback?source=signup` },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[register] generateLink failed:', linkError?.message);
      return NextResponse.json(
        { error: `Could not generate confirmation link: ${linkError?.message ?? 'empty'}` },
        { status: 500 },
      );
    }

    // Build clean URL on pdrconnect.eu (avoids spam filters blocking supabase.co hashes)
    let confirmationUrl = linkData.properties.action_link;
    try {
      const rawUrl   = new URL(linkData.properties.action_link);
      const tokenHash = rawUrl.searchParams.get('token_hash') ?? rawUrl.searchParams.get('token');
      if (tokenHash) {
        confirmationUrl = `${appUrl}/api/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=signup`;
      }
    } catch {
      console.warn('[register] could not parse action_link, using raw URL as fallback');
    }

    // ── Step 4: Send email via Resend ─────────────────────────────────────────
    const sendResult = await sendEmailConfirmationEmail(email, full_name, confirmationUrl, lang);

    if (sendResult.error) {
      const errStr = JSON.stringify(sendResult.error);
      console.error('[register] resend error:', errStr);

      const isQuotaError = errStr.includes('429') || errStr.includes('quota') || errStr.includes('rate');
      if (isQuotaError) {
        console.log('[register] quota exceeded — auto-confirming:', email);
        await adminSupabase.auth.admin.updateUserById(userId, { email_confirm: true });
        return NextResponse.json({ success: true, emailSent: false, message: 'quota_exceeded' });
      }

      return NextResponse.json({ error: `Email delivery failed: ${errStr}` }, { status: 500 });
    }

    console.log('[register] confirmation email sent to:', email);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[register] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
