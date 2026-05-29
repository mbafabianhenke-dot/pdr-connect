import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmailConfirmationEmail } from '@/lib/resend/emails';

export async function POST(req: NextRequest) {
  try {
    const { email, name, lang } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Generate a magic-link for the newly registered (unconfirmed) user.
    // Clicking the link both confirms the email AND signs the user in — identical
    // user experience to a standard email-confirmation flow, and it works regardless
    // of whether Supabase's own "Confirm email" setting is on or off.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${appUrl}/api/auth/callback?next=/dashboard`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('generateLink error:', linkError);
      return NextResponse.json(
        { error: linkError?.message ?? 'Failed to generate confirmation link' },
        { status: 500 },
      );
    }

    const confirmationUrl = linkData.properties.action_link;

    // Send branded confirmation email via Resend
    await sendEmailConfirmationEmail(
      email,
      name ?? email,
      confirmationUrl,
      lang,
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('send-confirmation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
