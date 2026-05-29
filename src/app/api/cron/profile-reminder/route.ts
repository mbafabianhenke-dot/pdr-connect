import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getProfileCompletion } from '@/lib/profile-completion';
import { sendProfileCompletionReminderEmail } from '@/lib/resend/emails';

/**
 * GET /api/cron/profile-reminder
 * Called daily by Vercel Cron (vercel.json) at 09:00 UTC.
 * Sends a personalised reminder to every user whose profile is still incomplete,
 * listing exactly which of the 5 mandatory steps are still missing.
 *
 * Protected by CRON_SECRET env var — set this in Vercel dashboard.
 */
export async function GET(req: NextRequest) {
  // Vercel forwards the secret automatically; locally set CRON_SECRET=any-value
  const authHeader = req.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Fetch all non-admin users with the fields needed for completion check
  const { data: users, error: usersError } = await adminClient
    .from('users')
    .select(
      'id, email, full_name, preferred_language, role, ' +
      'company_name, company_street, company_house_number, company_zip, company_country, ' +
      'services, available_countries',
    )
    .eq('is_admin', false)
    .not('email', 'is', null);

  if (usersError) {
    console.error('[cron/profile-reminder] users query failed:', usersError);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const allUsers = (users as unknown as Array<{
    id: string; email: string; full_name: string; preferred_language: string;
    role: string; company_name: string | null; company_street: string | null;
    company_house_number: string | null; company_zip: string | null;
    company_country: string | null; services: string[] | null;
    available_countries: string[] | null;
  }>) ?? [];
  if (allUsers.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: [] });
  }

  // Batch-fetch all COMPANY_DOC and IDENTITY_DOC documents in one query
  const userIds = allUsers.map((u: any) => u.id);
  const { data: allDocs } = await adminClient
    .from('documents')
    .select('user_id, type')
    .in('user_id', userIds)
    .in('type', ['COMPANY_DOC', 'IDENTITY_DOC']);

  // Group by user_id
  const docsByUser: Record<string, { type: string }[]> = {};
  for (const doc of allDocs ?? []) {
    if (!docsByUser[doc.user_id]) docsByUser[doc.user_id] = [];
    docsByUser[doc.user_id].push({ type: doc.type });
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const user of allUsers) {
    // Skip users without a name (bots / partial registrations)
    if (!user.email || !user.full_name) { skipped++; continue; }

    const docs = docsByUser[user.id] ?? [];
    const completion = getProfileCompletion(user, docs);

    if (completion.complete) { skipped++; continue; }

    const missingKeys = completion.steps
      .filter(s => !s.done)
      .map(s => s.key);

    try {
      await sendProfileCompletionReminderEmail(
        user.email,
        user.full_name,
        user.preferred_language,
        missingKeys,
        completion.doneCount,
      );
      sent++;
      // Small delay to stay within Resend rate limits
      await new Promise(r => setTimeout(r, 100));
    } catch (e: any) {
      errors.push(`${user.email}: ${e?.message ?? String(e)}`);
      console.error('[cron/profile-reminder] Failed for', user.email, e);
    }
  }

  console.log(
    `[cron/profile-reminder] Done. sent=${sent} skipped=${skipped} errors=${errors.length}`,
  );
  return NextResponse.json({ sent, skipped, errors });
}
