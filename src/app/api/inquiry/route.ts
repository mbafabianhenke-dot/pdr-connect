import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@pdrconnect.eu';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get customer profile
  const { data: customer } = await supabase
    .from('users')
    .select('full_name, email, phone, company_name, role')
    .eq('id', user.id)
    .single();

  const body = await req.json();
  const { message, selectedTechnicians, location, startDate, budget } = body as {
    message: string;
    location?: string;
    startDate?: string;
    budget?: string;
    selectedTechnicians: Array<{
      id: string;
      full_name: string;
      role: string;
      available_countries: string[];
      services: string[];
      bundesland?: string;
    }>;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  // Get admin email(s)
  const { data: admins } = await supabase
    .from('users')
    .select('email')
    .eq('is_admin', true);

  const adminEmails = (admins ?? []).map(a => a.email).filter(Boolean);
  if (!adminEmails.length) {
    adminEmails.push(process.env.ADMIN_EMAIL ?? 'info@cybratech-solutions.com');
  }

  // Build technicians HTML
  const techsHtml = selectedTechnicians.length > 0
    ? selectedTechnicians.map(t => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:8px">
        <strong style="color:#1e3a5f">${t.full_name}</strong>
        <span style="color:#64748b;font-size:13px;margin-left:8px">${t.role}</span><br>
        <span style="color:#64748b;font-size:12px">
          🌍 ${t.available_countries?.join(', ') || '—'} |
          🔧 ${t.services?.slice(0,3).join(', ') || '—'}
          ${t.bundesland ? ` | 📍 ${t.bundesland}` : ''}
        </span>
        <br><a href="${APP_URL}/admin/users/${t.id}" style="font-size:12px;color:#1d4ed8">→ Profil im Admin öffnen</a>
      </div>
    `).join('')
    : '<p style="color:#94a3b8;font-style:italic">Keine spezifischen Techniker ausgewählt — allgemeine Anfrage</p>';

  const subject = `🔔 Neue Kundenanfrage — ${customer?.company_name ?? customer?.full_name ?? 'Unbekannt'}`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:640px">
  <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);padding:24px;border-radius:12px 12px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">🔔 Neue Kundenanfrage — PDR Connect</h1>
  </div>
  <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:28px">

    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px">
      <strong style="color:#92400e">⚡ Aktion erforderlich:</strong>
      <span style="color:#92400e;font-size:14px"> Ein Kunde möchte einen oder mehrere Techniker kontaktieren. Bitte vermitteln Sie.</span>
    </div>

    <h2 style="color:#1e3a5f;margin-top:0;font-size:16px">👤 Kundendaten</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
      <tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#374151;width:140px">Name</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0">${customer?.full_name ?? '—'}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">E-Mail</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0"><a href="mailto:${customer?.email}" style="color:#1d4ed8">${customer?.email ?? '—'}</a></td></tr>
      ${customer?.phone ? `<tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">Telefon</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0">${customer.phone}</td></tr>` : ''}
      ${customer?.company_name ? `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">Firma</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0">${customer.company_name}</td></tr>` : ''}
      ${location ? `<tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">Ort</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0">${location}</td></tr>` : ''}
      ${startDate ? `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">Wunschtermin</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0">${startDate}</td></tr>` : ''}
      ${budget ? `<tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#374151;border-top:1px solid #e2e8f0">Budget</td><td style="padding:8px 12px;border-left:1px solid #e2e8f0;border-top:1px solid #e2e8f0"><strong>${budget}</strong></td></tr>` : ''}
    </table>

    <h2 style="color:#1e3a5f;font-size:16px">💬 Nachricht des Kunden</h2>
    <div style="background:#f8fafc;border-left:4px solid #1d4ed8;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;font-size:15px;color:#374151;line-height:1.6">
      ${message.replace(/\n/g, '<br>')}
    </div>

    <h2 style="color:#1e3a5f;font-size:16px">🔧 Ausgewählte Techniker (${selectedTechnicians.length})</h2>
    ${techsHtml}

    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e2e8f0">
      <a href="${APP_URL}/admin" style="display:inline-block;background:#1d4ed8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
        → Jetzt im Admin-Panel bearbeiten
      </a>
    </div>

    <p style="color:#94a3b8;font-size:12px;margin-top:24px">PDR Connect · Automatische Benachrichtigung · ${new Date().toLocaleString('de-DE')}</p>
  </div>
</div>`;

  // ── Save inquiry to database (use admin client to bypass RLS) ────
  const adminSb = createAdminClient();
  const { data: saved, error: dbErr } = await adminSb
    .from('customer_inquiries')
    .insert({
      customer_id:      user.id,
      customer_name:    customer?.full_name ?? null,
      customer_email:   customer?.email ?? null,
      customer_company: customer?.company_name ?? null,
      customer_phone:   customer?.phone ?? null,
      message,
      location:         location ?? null,
      start_date:       startDate || null,
      budget:           budget ?? null,
      selected_technicians: selectedTechnicians,
      status: 'new',
    })
    .select('id')
    .single();

  if (dbErr) console.error('[inquiry] db error:', dbErr.message);

  const inquiryId  = saved?.id ?? '';
  const adminLink  = `${APP_URL}/admin?tab=inquiries&id=${inquiryId}`;

  // Update HTML with correct direct link
  const finalHtml = html.replace(
    `${APP_URL}/admin`,
    adminLink
  );

  try {
    await resend.emails.send({
      from: `PDR Connect <${FROM}>`,
      to: adminEmails,
      subject,
      html: finalHtml,
    });
    return NextResponse.json({ success: true, inquiryId });
  } catch (e: any) {
    console.error('[inquiry] send error:', e);
    // Still return success if DB save worked
    if (inquiryId) return NextResponse.json({ success: true, inquiryId });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
