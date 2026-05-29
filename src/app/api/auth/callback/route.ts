import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code   = searchParams.get('code');
  const next   = searchParams.get('next') ?? '/dashboard';
  const source = searchParams.get('source'); // 'signup' when coming from email confirmation

  if (code) {
    const supabase = await createClient();
    const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // ── Email-confirmation flow ──────────────────────────────────────────────
      // The code was clicked from the registration confirmation email.
      // Supabase has now confirmed the email and issued a session — but we DON'T
      // want to silently log the user in.  Sign them out and send them to the
      // login page with their email pre-filled so they consciously enter their
      // password for the first time.
      if (source === 'signup') {
        const userEmail = exchangeData?.user?.email ?? '';
        await supabase.auth.signOut();
        const loginUrl = new URL(`${origin}/login`);
        if (userEmail) loginUrl.searchParams.set('email', userEmail);
        loginUrl.searchParams.set('confirmed', '1');
        return NextResponse.redirect(loginUrl.toString());
      }

      // ── All other flows (password reset, magic-link, etc.) ───────────────────
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
