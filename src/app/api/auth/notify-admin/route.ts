import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendNewRegistrationAdminEmail } from '@/lib/resend/emails';

/**
 * POST /api/auth/notify-admin
 *
 * Called by the register page immediately after successful signUp.
 * Looks up the caller's own profile (via their fresh session), then
 * finds all admin emails via the service-role client and dispatches
 * a notification email so admins can approve the new account.
 */
export async function POST() {
  // Verify the caller is authenticated (fresh session from signUp)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Read caller's own profile (users_select_own RLS policy allows this)
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, phone, role, created_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Use service-role client to find admin emails
  // (regular users can't read other users via normal RLS)
  const adminSupabase = createAdminClient();
  const { data: admins } = await adminSupabase
    .from('users')
    .select('email')
    .eq('is_admin', true)
    .eq('is_blocked', false);

  const adminEmails: string[] = admins?.map((a: { email: string }) => a.email) ?? [];

  // Fallback to env var if no admin accounts exist yet
  if (adminEmails.length === 0) {
    const fallback = process.env.ADMIN_EMAIL ?? 'info@cybratech-solutions.com';
    adminEmails.push(fallback);
  }

  // Send notification to every admin (fire-and-forget, non-fatal)
  const results = await Promise.allSettled(
    adminEmails.map(email =>
      sendNewRegistrationAdminEmail(email, {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone ?? undefined,
        role: profile.role,
        created_at: profile.created_at,
      })
    )
  );

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`[notify-admin] ${failures.length} email(s) failed:`, failures);
  }

  return NextResponse.json({ success: true, notified: adminEmails.length });
}
