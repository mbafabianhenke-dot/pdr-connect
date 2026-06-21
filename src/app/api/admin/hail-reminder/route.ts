import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@pdrconnect.eu';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

export async function POST() {
  // Auth guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  if (!p?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminSb = createAdminClient();

  // Get all non-admin, non-blocked users
  const { data: users } = await adminSb
    .from('users')
    .select('id, full_name, email, available_countries, services, company_name, company_street, company_zip, company_country, role')
    .eq('is_admin', false)
    .eq('is_blocked', false);

  // Get verified documents
  const { data: docs } = await adminSb
    .from('documents')
    .select('user_id, type')
    .eq('status', 'verified');

  if (!users?.length) return NextResponse.json({ sent: 0, message: 'No users found' });

  // Filter incomplete profiles
  const incomplete = users.filter(u => {
    const hasCountries = Array.isArray(u.available_countries) && u.available_countries.length > 0;
    const hasServices  = Array.isArray(u.services) && u.services.length > 0;
    const hasCompany   = u.company_name && u.company_street && u.company_zip && u.company_country;
    const userDocs     = (docs ?? []).filter(d => d.user_id === u.id);
    const hasCompDoc   = userDocs.some(d => d.type === 'COMPANY_DOC');
    const hasIdDoc     = userDocs.some(d => d.type === 'IDENTITY_DOC');
    return !(hasCountries && hasServices && hasCompany && hasCompDoc && hasIdDoc);
  });

  if (!incomplete.length) return NextResponse.json({ sent: 0, message: 'All profiles complete' });

  const subject = '⛈️ Hail Season Has Begun - Complete Your PDR Connect Profile';

  let sent = 0, failed = 0;

  for (const u of incomplete) {
    const name = u.full_name ?? 'PDR Professional';

    const text = `Hello ${name},

The hail season in Europe has officially begun.

Every year, thousands of vehicles are damaged by hailstorms -- and Germany and Belgium are already contacting us regarding PDR Technicians and Montage Guys (R&I Guys).

IMPORTANT: Only profiles that are 100% complete appear in search results. Incomplete profiles are NOT shown to potential clients.

To be found during this high-demand season, please complete the following steps on your profile:

- Company information (name, address, country)
- Available countries (min. 1)
- Services / Skills (min. 1)
- Company document
- Passport or EU ID
  -> A1 certificate is mandatory for EU Companies/Technicians

>> Complete My Profile Now: ${APP_URL}/profile <<

Don't wait -- workshops and dealerships are searching for technicians RIGHT NOW. Every day with an incomplete profile is a missed opportunity.

Best regards,
Fabian Henke
PDR Connect
info@cybratech-solutions.com`;

    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;max-width:580px">
<p>Hello <strong>${name}</strong>,</p>
<p>The hail season in Europe has officially begun.</p>
<p>Every year, thousands of vehicles are damaged by hailstorms &mdash; and <strong>Germany and Belgium are already contacting us regarding PDR Technicians and Montage Guys (R&amp;I Guys)</strong>.</p>
<p style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin:16px 0">
  <strong>&#9888;&#65039; Important:</strong> Only profiles that are <strong>100% complete</strong> appear in search results.<br>
  <strong>Incomplete profiles are NOT shown to potential clients.</strong>
</p>
<p>To be found during this high-demand season, please complete the following steps on your profile:</p>
<ul style="line-height:2.2;padding-left:20px">
  <li>&#9989; Company information (name, address, country)</li>
  <li>&#9989; Available countries (min. 1)</li>
  <li>&#9989; Services / Skills (min. 1)</li>
  <li>&#9989; Company document</li>
  <li>&#9989; Passport or EU ID<br>
    <span style="color:#666;font-size:13px">&rarr; A1 certificate is mandatory for EU Companies/Technicians</span>
  </li>
</ul>
<div style="background:#1d4ed8;border-radius:10px;padding:24px;text-align:center;margin:28px 0">
  <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 14px">Don&rsquo;t wait &mdash; workshops are searching RIGHT NOW!</p>
  <a href="${APP_URL}/profile" style="background:#fbbf24;color:#1e3a5f;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
    Complete My Profile Now &rarr;
  </a>
</div>
<p style="color:#555">Every day with an incomplete profile is a missed opportunity. Germany and Belgium are calling &mdash; make sure you are visible.</p>
<p>Best regards,<br>
<strong>Fabian Henke</strong><br>
PDR Connect<br>
<a href="mailto:info@cybratech-solutions.com" style="color:#1d4ed8">info@cybratech-solutions.com</a></p>
</div>`;

    try {
      await resend.emails.send({
        from: `PDR Connect <${FROM}>`,
        to: u.email,
        subject,
        text,
        html,
      });
      sent++;
    } catch {
      failed++;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  return NextResponse.json({ sent, failed, total: incomplete.length });
}
