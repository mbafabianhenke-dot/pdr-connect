import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@pdrconnect.eu';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  return p?.is_admin ? supabase : null;
}

function buildEmail(name: string) {
  const subject = 'PDR Connect – Qualifizierte PDR-Techniker für Ihren Betrieb';
  const text = `Sehr geehrte Damen und Herren von ${name},\n\nmein Name ist Fabian Henke, Gründer von PDR Connect (${APP_URL}) – der ersten internationalen Plattform, die Autohäuser und Karosseriebetriebe mit verifizierten PDR-Technikern vernetzt.\n\nOb Hagelschäden, Parkdellen oder kleine Karosserieschäden – auf PDR Connect finden Sie schnell und unkompliziert qualifizierte PDR-Fachleute in Ihrer Nähe, kostenlos und unverbindlich.\n\nWarum PDR Connect?\n• Über 1.000 verifizierte PDR-Techniker aus ganz Europa\n• Direkte Kontaktaufnahme, ohne Zwischenhändler\n• Kostenlose Registrierung für Autohäuser und Werkstätten\n\nJetzt kostenlos registrieren:\n${APP_URL}/register\n\nMit freundlichen Grüßen\nFabian Henke\nPDR Connect\ninfo@cybratech-solutions.com\n\n---\nSie erhalten diese E-Mail, da Ihr Betrieb im Kfz-Bereich tätig ist.\nAbmeldung: Antworten Sie mit "ABMELDEN"`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;max-width:580px"><p>Sehr geehrte Damen und Herren von <strong>${name}</strong>,</p><p>mein Name ist Fabian Henke, Gründer von <strong>PDR Connect</strong> (<a href="${APP_URL}">${APP_URL}</a>) – der ersten internationalen Plattform, die Autohäuser und Karosseriebetriebe mit verifizierten PDR-Technikern vernetzt.</p><p>Ob Hagelschäden, Parkdellen oder kleine Karosserieschäden – auf PDR Connect finden Sie schnell und unkompliziert qualifizierte PDR-Fachleute in Ihrer Nähe, kostenlos und unverbindlich.</p><p><strong>Warum PDR Connect?</strong><br>• Über 1.000 verifizierte PDR-Techniker aus ganz Europa<br>• Direkte Kontaktaufnahme, ohne Zwischenhändler<br>• Kostenlose Registrierung für Autohäuser und Werkstätten</p><p><a href="${APP_URL}/register" style="color:#1d4ed8;font-weight:bold">Jetzt kostenlos registrieren →</a></p><p>Mit freundlichen Grüßen,<br><strong>Fabian Henke</strong><br>PDR Connect<br><a href="mailto:info@cybratech-solutions.com" style="color:#666">info@cybratech-solutions.com</a></p><hr style="border:none;border-top:1px solid #eee;margin:20px 0"><p style="font-size:12px;color:#999">Sie erhalten diese E-Mail, da Ihr Betrieb im Kfz-Bereich tätig ist. Abmeldung: Antworten Sie mit „ABMELDEN"</p></div>`;
  return { subject, text, html };
}

export async function POST(req: NextRequest) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { zip, bundesland, type, limit = 500, subject: customSubject, body: customBody } = body;

  // Fetch businesses with email, status=new
  const { data: raw, error: fetchErr } = await supabase
    .from('de_businesses')
    .select('id, business_name, email')
    .not('email', 'is', null)
    .neq('email', '')
    .eq('status', 'new')
    .limit(limit);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  // Apply optional filters client-side (avoid TS chaining issues)
  let businesses = (raw ?? []) as Array<{ id: string; business_name: string; email: string }>;

  // Send in batches of 100 (Resend batch limit)
  let sent = 0, failed = 0;
  const sentIds: string[] = [];
  const BATCH = 100;

  for (let i = 0; i < businesses.length; i += BATCH) {
    const chunk = businesses.slice(i, i + BATCH);
    const messages = chunk.map(b => {
      const { subject: defSubject, text: defText, html: defHtml } = buildEmail(b.business_name);
      // Use custom content if provided, replace [Business Name] placeholder
      const subject = customSubject || defSubject;
      const text    = customBody ? customBody.replace(/\[Business Name\]/g, b.business_name) : defText;
      const html    = customBody
        ? `<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;line-height:1.7;max-width:580px">${text.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</div>`
        : defHtml;
      return { from: `PDR Connect <${FROM}>`, to: b.email, subject, text, html };
    });

    try {
      await resend.batch.send(messages);
      sent += chunk.length;
      sentIds.push(...chunk.map(b => b.id));
    } catch {
      failed += chunk.length;
    }

    // Rate limit delay
    if (i + BATCH < businesses.length) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // Mark as contacted
  if (sentIds.length > 0) {
    await supabase
      .from('de_businesses')
      .update({ status: 'contacted', contacted_at: new Date().toISOString() })
      .in('id', sentIds);
  }

  return NextResponse.json({ sent, failed, total: businesses.length });
}
