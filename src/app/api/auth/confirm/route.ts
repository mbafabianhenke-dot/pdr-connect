import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Clean email-confirmation endpoint.
 *
 * Instead of embedding the raw Supabase auth URL (which contains a long
 * random subdomain like spmbtjynxbqpecgumadv.supabase.co that triggers
 * spam/content filters), we email a clean pdrconnect.eu link like:
 *
 *   https://pdrconnect.eu/api/auth/confirm?token_hash=XXX&type=signup
 *
 * This handler verifies the OTP token with Supabase and then redirects
 * to /login with the email pre-filled (same behaviour as the original flow).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token_hash = searchParams.get('token_hash');
  const type       = (searchParams.get('type') ?? 'signup') as 'signup' | 'magiclink';
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (!token_hash) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_token`);
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (error) {
      console.error('[confirm] verifyOtp error:', error.message);
      return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
    }

    const userEmail = data?.user?.email ?? '';

    // For signup confirmation: sign out and redirect to login with email pre-filled
    await supabase.auth.signOut();
    const loginUrl = new URL(`${appUrl}/login`);
    if (userEmail) loginUrl.searchParams.set('email', userEmail);
    loginUrl.searchParams.set('confirmed', '1');
    return NextResponse.redirect(loginUrl.toString());

  } catch (err) {
    console.error('[confirm] unexpected error:', err);
    return NextResponse.redirect(`${appUrl}/login?error=confirm_failed`);
  }
}
