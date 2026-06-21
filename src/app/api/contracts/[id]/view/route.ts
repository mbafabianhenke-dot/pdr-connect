import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import AGB_CONTENT from '@/lib/agb-content';
import PRIVACY_CONTENT from '@/lib/privacy-content'; // ← centralized, always up-to-date

function sectionsToHtml(sections: { h: string; p?: string; list?: string[]; p2?: string }[]): string {
  return sections.map(s => `
    <div style="margin-bottom:20px">
      <h3 style="font-size:14px;font-weight:700;color:#1e293b;margin:0 0 6px">${s.h}</h3>
      ${s.p  ? `<p style="font-size:13px;color:#374151;line-height:1.7;margin:0;white-space:pre-line">${s.p}</p>` : ''}
      ${s.list ? `<ul style="margin:6px 0 0 16px;padding:0">${s.list.map(i => `<li style="font-size:13px;color:#374151;line-height:1.7;margin-bottom:2px">${i}</li>`).join('')}</ul>` : ''}
      ${s.p2 ? `<p style="font-size:12px;color:#6b7280;margin:4px 0 0;font-style:italic">${s.p2}</p>` : ''}
    </div>
  `).join('');
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminDb = createAdminClient();

  // Fetch contract
  const { data: contract, error } = await adminDb
    .from('contracts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !contract) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check authorization: owner OR admin
  const { data: profile } = await supabase.from('users').select('is_admin, full_name, email, company_name').eq('id', user.id).single();
  if (contract.user_id !== user.id && !profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch owner profile for the certificate
  const { data: owner } = await adminDb
    .from('users')
    .select('full_name, email, company_name')
    .eq('id', contract.user_id)
    .single();

  const lang = (contract.language ?? 'de') as string;
  const download = req.nextUrl.searchParams.get('download') === '1';
  const signedDate = contract.signed_at
    ? new Date(contract.signed_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date(contract.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Build document content based on version
  let docTitle = '';
  let docSubtitle = '';
  let contentHtml = '';
  let accentColor = '#1d4ed8';

  if (contract.version === 'agb') {
    const agb = AGB_CONTENT[lang] ?? AGB_CONTENT['de'] ?? AGB_CONTENT['en'];
    docTitle = agb.title;
    docSubtitle = agb.subtitle ?? 'PDR Connect · Cybratech-Solutions';
    contentHtml = sectionsToHtml(agb.sections as any[]);
    accentColor = '#1d4ed8';
  } else if (contract.version === 'privacy') {
    // Use the centralized PRIVACY_CONTENT — always the latest version
    const priv = PRIVACY_CONTENT[lang] ?? PRIVACY_CONTENT['de'] ?? PRIVACY_CONTENT['en'];
    docTitle = priv.title;
    docSubtitle = priv.subtitle ?? 'PDR Connect · Cybratech-Solutions';
    contentHtml = sectionsToHtml(priv.sections as any[]);
    accentColor = '#7c3aed';
  } else {
    // For client/worker contracts: generate a fresh signed URL (1h TTL)
    // so it works even if the storage bucket is private.
    if (!contract.pdf_url) {
      return NextResponse.json({ error: 'No document file available for this contract.' }, { status: 404 });
    }

    // Extract the storage object path from the stored URL
    // Stored URL format: .../storage/v1/object/public/documents/<path>
    //                 or .../storage/v1/object/sign/documents/<path>
    const extractPath = (url: string): string | null => {
      try {
        const u = new URL(url);
        const marker = '/storage/v1/object/';
        const idx = u.pathname.indexOf(marker);
        if (idx === -1) return null;
        // parts: ['public'|'sign', 'documents', ...rest]
        const parts = u.pathname.slice(idx + marker.length).split('/');
        // skip 'public'|'sign' and bucket name
        return parts.slice(2).join('/');
      } catch { return null; }
    };

    const storagePath = extractPath(contract.pdf_url);
    if (!storagePath) {
      // Fallback: redirect to the raw URL as-is
      return NextResponse.redirect(contract.pdf_url);
    }

    // Generate a 1-hour signed URL using admin client (bypasses RLS)
    const { data: signedData, error: signErr } = await adminDb.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600);

    if (signErr || !signedData?.signedUrl) {
      // If signed URL fails, try redirecting to the public URL directly
      return NextResponse.redirect(contract.pdf_url);
    }

    if (download) {
      // For download: redirect to signed URL with download param
      const dlUrl = signedData.signedUrl + '&download=';
      return NextResponse.redirect(dlUrl);
    }

    return NextResponse.redirect(signedData.signedUrl);
  }

  const versionLabel = contract.version === 'agb'
    ? (lang === 'de' ? 'AGB — Allgemeine Geschäftsbedingungen' : 'Terms & Conditions (AGB)')
    : (lang === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy');

  const signedLabel      = lang === 'de' ? 'Unterzeichnet am'     : 'Signed on';
  const signedByLabel    = lang === 'de' ? 'Unterzeichnet von'    : 'Signed by';
  const companyLabel     = lang === 'de' ? 'Unternehmen'          : 'Company';
  const docIdLabel       = lang === 'de' ? 'Dokument-ID'          : 'Document ID';
  const platformLabel    = lang === 'de' ? 'Plattform'            : 'Platform';
  const certTitle        = lang === 'de' ? 'Akzeptanzbestätigung' : 'Acceptance Certificate';
  const certNote         = lang === 'de'
    ? 'Der Nutzer hat dieses Dokument vollständig gelesen und digital akzeptiert.'
    : 'The user has read this document in full and accepted it digitally.';
  const printBtn         = lang === 'de' ? 'Drucken / Als PDF speichern' : 'Print / Save as PDF';

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle} — PDR Connect</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; }
    .page { max-width: 800px; margin: 0 auto; padding: 24px; }
    .header { background: ${accentColor}; color: white; padding: 28px 32px; border-radius: 12px 12px 0 0; }
    .header-logo { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; opacity: .8; margin-bottom: 6px; }
    .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: .8; }
    .cert-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 0; padding: 16px 32px; display: flex; align-items: flex-start; gap: 14px; }
    .cert-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
    .cert-title { font-size: 15px; font-weight: 700; color: #15803d; margin-bottom: 4px; }
    .cert-note  { font-size: 13px; color: #166534; line-height: 1.5; }
    .meta-table { background: white; border: 1px solid #e2e8f0; border-top: none; border-bottom: none; }
    .meta-row { display: flex; border-bottom: 1px solid #f1f5f9; }
    .meta-key { width: 160px; flex-shrink: 0; padding: 10px 16px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .04em; background: #f8fafc; }
    .meta-val { padding: 10px 16px; font-size: 13px; color: #1e293b; font-weight: 500; }
    .content { background: white; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; padding: 32px; }
    .content-divider { border: none; border-top: 2px solid #e2e8f0; margin: 20px 0 24px; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: ${accentColor}; color: white; border: none; padding: 12px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2); display: flex; align-items: center; gap: 8px; }
    @media print { .print-btn { display: none; } body { background: white; } .page { padding: 0; } .header { border-radius: 0; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <p class="header-logo">PDR Connect · Cybratech-Solutions</p>
    <h1>${docTitle}</h1>
    <p>${docSubtitle}</p>
  </div>

  <!-- Certificate banner -->
  <div class="cert-box">
    <div class="cert-icon">✅</div>
    <div>
      <p class="cert-title">${certTitle}</p>
      <p class="cert-note">${certNote}</p>
    </div>
  </div>

  <!-- Metadata -->
  <div class="meta-table">
    <div class="meta-row">
      <span class="meta-key">${signedByLabel}</span>
      <span class="meta-val">${owner?.full_name ?? '—'} &lt;${owner?.email ?? '—'}&gt;</span>
    </div>
    ${owner?.company_name ? `
    <div class="meta-row">
      <span class="meta-key">${companyLabel}</span>
      <span class="meta-val">${owner.company_name}</span>
    </div>` : ''}
    <div class="meta-row">
      <span class="meta-key">${signedLabel}</span>
      <span class="meta-val">${signedDate}</span>
    </div>
    <div class="meta-row">
      <span class="meta-key">${platformLabel}</span>
      <span class="meta-val">PDR Connect · pdrconnect.eu</span>
    </div>
    <div class="meta-row">
      <span class="meta-key">${docIdLabel}</span>
      <span class="meta-val" style="font-family:monospace;font-size:11px;color:#64748b">${contract.id}</span>
    </div>
  </div>

  <!-- Document content -->
  <div class="content">
    <hr class="content-divider">
    ${contentHtml}
  </div>
</div>

<button class="print-btn" onclick="window.print()">🖨️ ${printBtn}</button>
</body>
</html>`;

  const filename = `${contract.version === 'agb' ? 'AGB' : 'Datenschutz'}_PDRConnect_${signedDate.replace(/[:.]/g, '-').replace(/\s/g, '_')}.html`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(download ? { 'Content-Disposition': `attachment; filename="${filename}"` } : {}),
    },
  });
}
