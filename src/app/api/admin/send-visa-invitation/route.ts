import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { assertAdmin } from '@/lib/admin-guard';
import { sendWorkVisaInvitationEmail } from '@/lib/resend/emails';

/**
 * POST /api/admin/send-visa-invitation
 * Admin-only: invites ALL non-admin users to download the Australia Subclass 400
 * Work Visa invitation templates from the Documents page and reply with their
 * applicant details. Each email is sent in the user's preferred language.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await assertAdmin(supabase, user);
  if (adminCheck) return adminCheck;

  const adminClient = createAdminClient();

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
      await sendWorkVisaInvitationEmail(u.email, u.full_name, u.preferred_language);
      sent++;
      // Small delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 120));
    } catch (e: any) {
      failed++;
      errors.push(`${u.email}: ${e?.message ?? String(e)}`);
      console.error('[send-visa-invitation] Failed for', u.email, e);
    }
  }

  console.log(`[send-visa-invitation] Admin ${user.id} sent visa invitation. sent=${sent} failed=${failed}`);

  return NextResponse.json({ success: true, sent, failed, errors });
}
