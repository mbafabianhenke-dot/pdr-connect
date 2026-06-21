/**
 * Client-side PDF generator for AGB and Datenschutz documents.
 * Uses jsPDF + shared pdf-header with the real PDR Connect logo.
 */
import { jsPDF } from 'jspdf';
import AGB_CONTENT from './agb-content';
import PRIVACY_CONTENT from './privacy-content';
import {
  loadLogoBase64, drawPDFHeader, drawPDFFooter,
  C_BLUE, C_PURPLE, C_DARK, C_GRAY, C_LGRAY, C_WHITE, C_GREEN,
} from './pdf-header';

export interface LegalPDFParams {
  type:        'agb' | 'privacy';
  lang:        string;
  signerName:  string;
  signerEmail: string;
  signedAt:    string;
  contractId:  string;
}

export async function generateLegalPDF(params: LegalPDFParams): Promise<Blob> {
  const { type, lang, signerName, signerEmail, signedAt, contractId } = params;

  const l = (['en','de','es','el'].includes(lang) ? lang : 'en') as 'en'|'de'|'es'|'el';

  const content  = type === 'agb'
    ? (AGB_CONTENT[l]       ?? AGB_CONTENT['en'])
    : (PRIVACY_CONTENT[l]   ?? PRIVACY_CONTENT['en']);

  const accentColor: [number,number,number] = type === 'agb' ? C_BLUE : C_PURPLE;
  const bgAccent:    [number,number,number] = type === 'agb' ? [239,246,255] : [245,243,255];

  // Load logo before building PDF
  const logoBase64 = await loadLogoBase64();

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW  = pdf.internal.pageSize.getWidth();
  const PH  = pdf.internal.pageSize.getHeight();
  const M   = 18;
  const CW  = PW - 2 * M;

  const docTypeBadge =
    type === 'agb'
      ? (l === 'de' ? 'Allgemeine Geschäftsbedingungen' : l === 'es' ? 'Términos y Condiciones (AGB)' : l === 'el' ? 'Γενικοί Όροι (ΓΟΣ)' : 'Terms & Conditions (AGB)')
      : (l === 'de' ? 'Datenschutzerklärung (DSGVO)'   : l === 'es' ? 'Política de Privacidad (RGPD)' : l === 'el' ? 'Πολιτική Απορρήτου (ΓΚΠΔ)' : 'Privacy Policy (GDPR)');

  const yRef = { v: 0 };

  // ── Helpers ─────────────────────────────────────────────────────
  const addPageFooter = () => drawPDFFooter(pdf, accentColor);

  const newPage = () => {
    addPageFooter();
    pdf.addPage();
    // Draw header on new pages too (smaller repeat header)
    pdf.setFillColor(...accentColor);
    pdf.rect(0, 0, PW, 8, 'F');
    if (logoBase64) {
      try { pdf.addImage(logoBase64, 'PNG', M, 0.5, 40, 7); } catch { /* skip */ }
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(191, 219, 254);
    pdf.text(docTypeBadge, PW - M, 5.5, { align: 'right' });
    pdf.setTextColor(...C_DARK);
    yRef.v = 14;

    // faint watermark
    pdf.saveGraphicsState();
    pdf.setGState(new (pdf as any).GState({ opacity: 0.03 }));
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.setTextColor(80, 80, 80);
    for (let wy = 60; wy < PH; wy += 80) {
      pdf.text('PDR CONNECT', PW / 2, wy, { align: 'center', angle: 35 });
    }
    pdf.restoreGraphicsState();
  };

  const ensure = (needed: number) => {
    if (yRef.v + needed > PH - 20) newPage();
  };

  const wrapWrite = (
    text: string, fontSize: number,
    fontStyle: 'normal'|'bold'|'italic',
    color: [number,number,number],
    indent = 0,
  ) => {
    pdf.setFont('helvetica', fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lh = fontSize * 0.43;
    for (const para of text.split('\n')) {
      const lines = pdf.splitTextToSize(para, CW - indent);
      for (const line of lines) {
        ensure(lh + 2);
        pdf.text(line, M + indent, yRef.v);
        yRef.v += lh;
      }
    }
  };

  // ── Page 1 watermark ─────────────────────────────────────────────
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.03 }));
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(80, 80, 80);
  for (let wy = 60; wy < PH; wy += 80) {
    pdf.text('PDR CONNECT', PW / 2, wy, { align: 'center', angle: 35 });
  }
  pdf.restoreGraphicsState();

  // ── Header (page 1) ───────────────────────────────────────────────
  yRef.v = drawPDFHeader(pdf, {
    logoBase64,
    accentColor,
    rightLabel: 'pdrconnect.eu · Efesou 9, 5280 Paralimni, Cyprus · CY60015676H',
  });

  // ── Document title + badge ────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(...accentColor);
  pdf.text(content.title, PW / 2, yRef.v, { align: 'center' });
  yRef.v += 7;

  if ('subtitle' in content && (content as any).subtitle) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C_GRAY);
    pdf.text((content as any).subtitle, PW / 2, yRef.v, { align: 'center' });
    yRef.v += 5;
  }

  // Badge pill
  const bw = Math.min(pdf.getTextWidth(docTypeBadge) + 14, 120);
  const bx = PW / 2 - bw / 2;
  pdf.setFillColor(...bgAccent);
  pdf.setDrawColor(...accentColor);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(bx, yRef.v, bw, 7, 3, 3, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...accentColor);
  pdf.text(docTypeBadge, PW / 2, yRef.v + 4.8, { align: 'center' });
  yRef.v += 11;

  // ── Signing certificate box ───────────────────────────────────────
  const certLabel = {
    by:  l === 'de' ? 'Unterzeichnet von' : l === 'es' ? 'Firmado por'   : l === 'el' ? 'Υπογράφηκε από' : 'Signed by',
    on:  l === 'de' ? 'Datum'             : l === 'es' ? 'Fecha'         : l === 'el' ? 'Ημερομηνία'     : 'Date',
    id:  l === 'de' ? 'Dokument-ID'       : l === 'es' ? 'ID Documento'  : l === 'el' ? 'ID Εγγράφου'    : 'Document ID',
    hd:  l === 'de' ? '✓  Digitale Akzeptanzbestätigung'
       : l === 'es' ? '✓  Confirmación de Aceptación Digital'
       : l === 'el' ? '✓  Ψηφιακή Επιβεβαίωση Αποδοχής'
       : '✓  Digital Acceptance Certificate',
  };

  const signedDate = new Date(signedAt).toLocaleString(
    l === 'de' ? 'de-DE' : l === 'es' ? 'es-ES' : l === 'el' ? 'el-GR' : 'en-GB',
    { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }
  );

  const certH = 28;
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(...C_GREEN);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(M, yRef.v, CW, certH, 3, 3, 'FD');

  let cy = yRef.v + 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...C_GREEN);
  pdf.text(certLabel.hd, M + 4, cy);
  cy += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...C_DARK);
  pdf.text(`${certLabel.by}: ${signerName} <${signerEmail}>`, M + 4, cy); cy += 4.5;
  pdf.text(`${certLabel.on}:  ${signedDate}`, M + 4, cy);
  pdf.setFontSize(6.5);
  pdf.setTextColor(...C_GRAY);
  cy += 4.5;
  pdf.text(`${certLabel.id}: ${contractId}`, M + 4, cy);

  yRef.v += certH + 6;

  // Divider
  pdf.setDrawColor(...C_LGRAY);
  pdf.setLineWidth(0.4);
  pdf.line(M, yRef.v, PW - M, yRef.v);
  yRef.v += 5;

  // ── Document sections ─────────────────────────────────────────────
  const sections = content.sections as any[];

  for (const section of sections) {
    ensure(14);

    // Section header pill
    pdf.setFillColor(...bgAccent);
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(M, yRef.v - 4, CW, 8, 2, 2, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(...accentColor);
    pdf.text(section.h, M + 4, yRef.v + 1.5);
    yRef.v += 9;

    if (section.p) { wrapWrite(section.p, 8.5, 'normal', C_DARK, 2); yRef.v += 2; }
    if (section.sub) { wrapWrite(section.sub, 8.5, 'bold', C_DARK, 2); yRef.v += 2; }

    if (section.list) {
      for (const item of section.list) {
        ensure(6);
        pdf.setFillColor(...accentColor);
        pdf.circle(M + 5, yRef.v - 1, 1, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(...C_DARK);
        const lines = pdf.splitTextToSize(item, CW - 12);
        for (let li = 0; li < lines.length; li++) {
          ensure(5);
          pdf.text(lines[li], M + 9, yRef.v);
          yRef.v += li === 0 ? 4.5 : 4;
        }
      }
      yRef.v += 1;
    }

    if (section.p2) { wrapWrite(section.p2, 7.5, 'italic', C_GRAY, 2); yRef.v += 1; }

    if (section.note) {
      ensure(8);
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(134, 239, 172);
      pdf.roundedRect(M + 2, yRef.v - 1, CW - 4, 8, 2, 2, 'FD');
      wrapWrite('ℹ  ' + section.note, 7.5, 'normal', [21, 128, 61] as any, 4);
      yRef.v += 3;
    }

    yRef.v += 4;
  }

  // ── Legal note ────────────────────────────────────────────────────
  ensure(16);
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(...C_LGRAY);
  pdf.roundedRect(M, yRef.v, CW, 14, 2, 2, 'FD');
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C_GRAY);
  const legalNote =
    l === 'de' ? 'Dieses Dokument wurde digital akzeptiert und ist rechtlich bindend gemäß den Bedingungen der Verordnung (EU) 2016/679 (DSGVO) und anwendbarem zypriotischen Recht.'
    : l === 'es' ? 'Este documento fue aceptado digitalmente y es legalmente vinculante conforme al Reglamento (UE) 2016/679 (RGPD) y la legislación chipriota aplicable.'
    : l === 'el' ? 'Αυτό το έγγραφο έγινε αποδεκτό ψηφιακά και είναι νομικά δεσμευτικό σύμφωνα με τον Κανονισμό (ΕΕ) 2016/679 (ΓΚΠΔ) και το εφαρμοστέο κυπριακό δίκαιο.'
    : 'This document was digitally accepted and is legally binding under Regulation (EU) 2016/679 (GDPR) and applicable Cypriot law.';
  const noteLines = pdf.splitTextToSize(legalNote + ' · Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Republic of Cyprus · VAT: CY60015676H', CW - 8);
  pdf.text(noteLines, M + 4, yRef.v + 5);

  addPageFooter();
  return pdf.output('blob');
}
