import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';
import { sendProfileReminderEmail } from '@/lib/resend/emails';

/**
 * POST /api/admin/send-reminder-email
 * Admin-only: sends a targeted reminder to ALL non-admin users asking them to
 * add available countries and upload missing documents.
 * Each email is in the user's preferred language (en / de / es / el).
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

  const targets = (users ?? []).filter((u: any) => u.email && u.full_name);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const u of targets) {
    try {
      await sendProfileReminderEmail(u.email, u.full_name, u.preferred_language);
      sent++;
      // Small delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 120));
    } catch (e: any) {
      failed++;
      errors.push(`${u.email}: ${e?.message ?? String(e)}`);
      console.error('[send-reminder-email] Failed for', u.email, e);
    }
  }

  console.log(`[send-reminder-email] Admin ${user.id} sent reminder. sent=${sent} failed=${failed}`);

  return NextResponse.json({ success: true, sent, failed, errors });
}
