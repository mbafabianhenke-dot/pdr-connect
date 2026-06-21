import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM_EMAIL ?? 'noreply@pdrconnect.eu';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
  return p?.is_admin ? createAdminClient() : null;
}

function buildProfileHtml(profile: Record<string, any>, docs: any[], signedDocs: any[], contracts: any[]): string {
  const docTypeLabel: Record<string, string> = {
    EU_ID:         '🪪 EU-Ausweis / Reisepass',
    A1:            '📄 A1-Bescheinigung',
    TRAVEL_DOC:    '✈️ Reisedokument',
    COMPANY_DOC:   '🏢 Firmenunterlage',
    IDENTITY_DOC:  '🪪 Reisepass / EU-Ausweis',
    GALLERY_IMAGE: '🖼️ Galeriebild',
    AVATAR:        '👤 Profilbild',
  };

  const countries = (profile.available_countries ?? []).join(', ') || '—';
  const services  = (profile.services ?? []).join(', ') || '—';

  const docsHtml = signedDocs.length > 0
    ? signedDocs.map(d => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px">${docTypeLabel[d.type] ?? d.type}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px">
          <span style="background:${d.status === 'verified' ? '#dcfce7' : d.status === 'rejected' ? '#fee2e2' : '#fef3c7'};
            color:${d.status === 'verified' ? '#166534' : d.status === 'rejected' ? '#991b1b' : '#92400e'};
            padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700">
            ${d.status === 'verified' ? '✓ Verifiziert' : d.status === 'rejected' ? '✗ Abgelehnt' : '⏳ Ausstehend'}
          </span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:14px">
          ${d.signed_url
            ? `<a href="${d.signed_url}" target="_blank" style="color:#1d4ed8;text-decoration:none;font-weight:600">
                📎 Dokument öffnen (24h Link)
               </a>`
            : '<span style="color:#9ca3af">Kein Link</span>'
          }
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280">
          ${d.created_at ? new Date(d.created_at).toLocaleDateString('de-DE') : '—'}
        </td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="padding:20px;text-align:center;color:#9ca3af;font-size:14px">Keine Dokumente hochgeladen</td></tr>';

  const galleryHtml = (profile.gallery_urls ?? []).length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px">
        ${(profile.gallery_urls as string[]).map(url =>
          `<a href="${url}" target="_blank">
            <img src="${url}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb" />
           </a>`
        ).join('')}
       </div>`
    : '<p style="color:#9ca3af;font-size:14px;margin:0">Keine Galerie-Bilder</p>';

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>PDR Connect — Profil: ${profile.full_name}</title>
<style>
  body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; color: #111827; }
  .page { max-width: 800px; margin: 0 auto; background: white; }
  @media print {
    body { background: white; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);padding:32px 40px;color:white">
    <div style="display:flex;align-items:center;gap:20px">
      ${profile.avatar_url
        ? `<img src="${profile.avatar_url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3)" />`
        : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:white">${profile.full_name?.charAt(0)?.toUpperCase()}</div>`
      }
      <div>
        <h1 style="margin:0;font-size:28px;font-weight:900">${profile.full_name ?? '—'}</h1>
        <p style="margin:4px 0 0;opacity:0.8;font-size:15px">${profile.role ?? '—'}</p>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          ${profile.is_verified ? '<span style="background:rgba(74,222,128,0.2);border:1px solid rgba(74,222,128,0.4);color:#4ade80;padding:2px 12px;border-radius:20px;font-size:12px;font-weight:700">✓ Verifiziert</span>' : ''}
          ${profile.is_premium  ? '<span style="background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.4);color:#fbbf24;padding:2px 12px;border-radius:20px;font-size:12px;font-weight:700">⭐ Premium</span>' : ''}
        </div>
      </div>
      <div style="margin-left:auto;text-align:right;opacity:0.7;font-size:13px">
        <div>PDR Connect Profil</div>
        <div>Exportiert: ${new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        <div>ID: ${profile.id?.substring(0,8)}...</div>
      </div>
    </div>
  </div>

  <div style="padding:32px 40px;space:y-6">

    <!-- Contact -->
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">📋 Kontaktdaten</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;width:160px">E-Mail</td><td style="padding:8px 12px;font-size:14px"><a href="mailto:${profile.email}" style="color:#1d4ed8">${profile.email ?? '—'}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Telefon</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${profile.phone ?? '—'}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Registriert</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${profile.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : '—'}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Sprache</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${(profile.preferred_language ?? 'en').toUpperCase()}</td></tr>
      </table>
    </div>

    <!-- Company -->
    ${profile.company_name ? `
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">🏢 Firmendaten</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;width:160px">Firma</td><td style="padding:8px 12px;font-size:14px">${profile.company_name}</td></tr>
        ${profile.company_street ? `<tr><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Adresse</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${profile.company_street} ${profile.company_house_number ?? ''}, ${profile.company_zip ?? ''} ${profile.company_country ?? ''}</td></tr>` : ''}
        ${profile.vat_id ? `<tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">USt-ID</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6;font-family:monospace">${profile.vat_id}</td></tr>` : ''}
      </table>
    </div>` : ''}

    <!-- Work Info -->
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">🔧 Berufliche Informationen</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;width:160px">Hauptrolle</td><td style="padding:8px 12px;font-size:14px">${profile.role ?? '—'}</td></tr>
        ${(profile.secondary_roles ?? []).length > 0 ? `<tr><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Weitere Rollen</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${(profile.secondary_roles as string[]).join(', ')}</td></tr>` : ''}
        <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Länder</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${countries}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6">Dienstleistungen</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6">${services}</td></tr>
        ${profile.bio ? `<tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;font-size:13px;color:#6b7280;border-top:1px solid #f3f4f6;vertical-align:top">Bio</td><td style="padding:8px 12px;font-size:14px;border-top:1px solid #f3f4f6;line-height:1.6">${profile.bio}</td></tr>` : ''}
      </table>
    </div>

    <!-- Documents -->
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">📎 Dokumente (${signedDocs.length})</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Typ</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Status</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Download</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Datum</th>
          </tr>
        </thead>
        <tbody>${docsHtml}</tbody>
      </table>
      <p style="font-size:12px;color:#9ca3af;margin-top:8px">⚠️ Download-Links sind 24 Stunden gültig</p>
    </div>

    <!-- Signed Contracts -->
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">📜 Unterzeichnete Verträge / Datenschutz & AGB</h2>
      ${contracts.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Dokument</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Sprache</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Status</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Unterzeichnet am</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Download</th>
          </tr>
        </thead>
        <tbody>
          ${contracts.map(c => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600">
              ${c.version === 'worker'
                ? '📄 AGB & Datenschutz — Techniker'
                : c.version === 'client'
                ? '📄 AGB & Datenschutz — Kunde'
                : `📄 Vertrag v${c.version}`}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px">
              ${c.language === 'de' ? '🇩🇪 Deutsch' : c.language === 'en' ? '🇬🇧 English' : c.language === 'es' ? '🇪🇸 Español' : c.language === 'el' ? '🇬🇷 Ελληνικά' : c.language?.toUpperCase()}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px">
              ${c.signed
                ? '<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700">✓ Unterzeichnet</span>'
                : '<span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700">⏳ Ausstehend</span>'}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#6b7280">
              ${c.signed_at ? new Date(c.signed_at).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-size:14px">
              ${c.pdf_url
                ? `<a href="${c.pdf_url}" target="_blank" style="color:#1d4ed8;text-decoration:none;font-weight:600">📥 PDF herunterladen</a>`
                : '<span style="color:#9ca3af">Kein PDF</span>'}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>` : `
      <div style="padding:20px;text-align:center;background:#f9fafb;border-radius:8px;color:#9ca3af;font-size:14px">
        Keine unterzeichneten Verträge vorhanden
      </div>`}
    </div>

    <!-- Gallery -->
    ${(profile.gallery_urls ?? []).length > 0 ? `
    <div style="margin-bottom:28px">
      <h2 style="font-size:16px;font-weight:700;color:#1e3a5f;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #e5e7eb">🖼️ Galerie</h2>
      ${galleryHtml}
    </div>` : ''}

  </div>

  <!-- Footer -->
  <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:12px;color:#9ca3af">
      PDR Connect · Cybratech Solutions · Efesou 9, 5280 Paralimni, Cyprus<br>
      <a href="${APP_URL}/admin/users/${profile.id}" style="color:#1d4ed8">Profil im Admin-Panel öffnen →</a>
    </p>
  </div>

</div>
</body>
</html>`;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminClient = await requireAdmin();
  if (!adminClient) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url     = new URL(req.url);
  const action  = url.searchParams.get('action') ?? 'download';
  const emailTo = url.searchParams.get('email') ?? '';

  // ── Parse attachment selection ────────────────────────────────────────────
  // Parameters are present when export modal is used.
  // Empty string "" = 0 items selected (include NONE).
  // Absent (null from searchParams) = no filter → include ALL (legacy / direct link).
  const rawDocIds      = url.searchParams.get('doc_ids');
  const rawContractIds = url.searchParams.get('contract_ids');
  const rawGalleryIdx  = url.searchParams.get('gallery_idx');
  const includeAvatar  = url.searchParams.get('avatar') !== '0';

  // IMPORTANT: use !== null to distinguish "empty selection" from "no param"
  const selectedDocIds      = rawDocIds      !== null
    ? new Set(rawDocIds.split(',').filter(Boolean))
    : null;                              // null → no filter → include all
  const selectedContractIds = rawContractIds !== null
    ? new Set(rawContractIds.split(',').filter(Boolean))
    : null;
  const selectedGalleryIdx  = rawGalleryIdx  !== null
    ? new Set(rawGalleryIdx.split(',').filter(Boolean).map(Number))
    : null;

  // ── Load full profile ─────────────────────────────────────────────────────
  const { data: profile } = await adminClient
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  // ── Apply avatar selection ────────────────────────────────────────────────
  const profileForExport = { ...profile };
  if (!includeAvatar) profileForExport.avatar_url = null;

  // ── Apply gallery selection ───────────────────────────────────────────────
  // selectedGalleryIdx === null  → include all (no filter param in URL)
  // selectedGalleryIdx is a Set  → include only those indices (may be empty Set = include none)
  if (selectedGalleryIdx !== null) {
    profileForExport.gallery_urls = (profile.gallery_urls as string[] ?? [])
      .filter((_: string, i: number) => selectedGalleryIdx.has(i));
  }

  // ── Load contracts (filtered) ─────────────────────────────────────────────
  const { data: allContracts } = await adminClient
    .from('contracts')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false });

  const filteredContracts = (allContracts ?? []).filter((c: any) =>
    selectedContractIds === null || selectedContractIds.has(c.id)
  );

  // ── Load documents (filtered) + generate signed URLs ─────────────────────
  const { data: rawDocs } = await adminClient
    .from('documents')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false });

  const filteredRawDocs = (rawDocs ?? []).filter((d: any) =>
    selectedDocIds === null || selectedDocIds.has(d.id)
  );

  const signedDocs = await Promise.all(
    filteredRawDocs.map(async (doc: any) => {
      try {
        const urlParts = doc.file_url?.split('/storage/v1/object/');
        if (!urlParts?.[1]) return { ...doc, signed_url: doc.file_url };
        const storagePath = urlParts[1].split('/').slice(2).join('/');
        const bucket      = urlParts[1].split('/')[1];
        if (bucket === 'avatars') return { ...doc, signed_url: doc.file_url };
        const { data } = await adminClient.storage.from('documents').createSignedUrl(storagePath, 86400);
        return { ...doc, signed_url: data?.signedUrl ?? doc.file_url };
      } catch {
        return { ...doc, signed_url: doc.file_url };
      }
    })
  );

  const html = buildProfileHtml(profileForExport, filteredRawDocs, signedDocs, filteredContracts);

  // ── Send via email ────────────────────────────────────────────────────────
  if (action === 'email' && emailTo) {
    // Resend has a ~10 MB body limit — warn if close
    const htmlBytes = Buffer.byteLength(html, 'utf8');
    if (htmlBytes > 9_000_000) {
      return NextResponse.json(
        { error: `HTML zu groß für E-Mail (${Math.round(htmlBytes / 1024)} KB). Bitte weniger Anhänge auswählen.` },
        { status: 400 }
      );
    }

    const contractCount = filteredContracts.filter((c: any) => c.signed).length;
    const docCount      = signedDocs.length;
    const parts: string[] = [];
    if (docCount > 0)      parts.push(`${docCount} Dokument${docCount !== 1 ? 'e' : ''}`);
    if (contractCount > 0) parts.push(`${contractCount} Vertrag/Verträge`);
    const subjectNote = parts.length > 0 ? ` (inkl. ${parts.join(', ')})` : '';

    try {
      await resend.emails.send({
        from:    `PDR Connect <${FROM}>`,
        to:      emailTo,
        subject: `PDR Connect — Profil: ${profile.full_name}${subjectNote}`,
        html,
      });
      return NextResponse.json({ success: true, sentTo: emailTo });
    } catch (e: any) {
      console.error('[export-profile] resend error:', e.message);
      return NextResponse.json({ error: `E-Mail Fehler: ${e.message}` }, { status: 500 });
    }
  }

  // ── Download as HTML ──────────────────────────────────────────────────────
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="pdrconnect-profile-${profile.full_name?.replace(/\s+/g, '-')}.html"`,
    },
  });
}
