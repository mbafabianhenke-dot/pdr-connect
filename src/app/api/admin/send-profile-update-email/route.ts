import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';
import { sendProfileUpdateRequestEmail } from '@/lib/resend/emails';

/** POST /api/admin/send-profile-update-email
 *  Admin-only: sends a "please complete your profile" email to all registered users
 *  (excludes admins and the calling admin themselves).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const adminClient = createAdminClient();

  // Fetch all non-admin users that have an email and full_name
  const { data: users, error } = await adminClient
    .from('users')
    .select('id, email, full_name, preferred_language')
    .eq('is_admin', false)
    .not('email', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const targets = (users ?? []).filter(u => u.email && u.full_name);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const u of targets) {
    try {
      await sendProfileUpdateRequestEmail(u.email, u.full_name, u.preferred_language);
      sent++;
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch (e: any) {
      failed++;
      errors.push(`${u.email}: ${e?.message ?? String(e)}`);
      console.error('[send-profile-update-email] Failed for', u.email, e);
    }
  }

  console.log(`[send-profile-update-email] Admin ${user.id} sent bulk email. sent=${sent} failed=${failed}`);

  return NextResponse.json({ success: true, sent, failed, errors });
}
