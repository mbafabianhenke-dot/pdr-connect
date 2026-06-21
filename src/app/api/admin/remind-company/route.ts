import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendCompanyInfoReminderEmail } from '@/lib/resend/emails';

export async function POST() {
  // Admin-only check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Find all non-admin users with incomplete company info
  const adminDb = createAdminClient();
  const { data: incompleteUsers, error } = await adminDb
    .from('users')
    .select('id, full_name, email, company_name, company_street, company_zip, company_country, phone')
    .eq('is_admin', false)
    .eq('is_blocked', false)
    .not('email', 'is', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter: missing at least one required company field
  const targets = (incompleteUsers ?? []).filter(u =>
    !u.company_name?.trim() ||
    !u.company_street?.trim() ||
    !u.company_zip?.trim() ||
    !u.company_country ||
    !u.phone?.trim()
  );

  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Alle Nutzer haben vollständige Firmendaten.' });
  }

  // Send emails (rate-limit: 1 per 100ms to avoid Resend throttling)
  let sent = 0;
  const failed: string[] = [];

  for (const u of targets) {
    try {
      await sendCompanyInfoReminderEmail(u.email, u.full_name || 'Nutzer', 'de');
      sent++;
      // Small delay to avoid hitting Resend rate limits
      await new Promise(r => setTimeout(r, 100));
    } catch (e: any) {
      failed.push(`${u.email}: ${e.message}`);
    }
  }

  return NextResponse.json({
    sent,
    total: targets.length,
    failed: failed.length,
    failedList: failed.slice(0, 5), // only show first 5 failures
    message: `${sent} von ${targets.length} E-Mails erfolgreich versendet.`,
  });
}
