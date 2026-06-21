/**
 * Shared PDF header builder for all PDR Connect documents.
 * Loads the real logo image and renders a consistent header on every PDF.
 */
import { jsPDF } from 'jspdf';

// ── Colours (shared across all PDFs) ─────────────────────────────
export const C_BLUE:   [number,number,number] = [30,  64, 175];
export const C_PURPLE: [number,number,number] = [124, 58, 237];
export const C_DARK:   [number,number,number] = [17,  24,  39];
export const C_GRAY:   [number,number,number] = [107, 114, 128];
export const C_LGRAY:  [number,number,number] = [229, 231, 235];
export const C_WHITE:  [number,number,number] = [255, 255, 255];
export const C_GREEN:  [number,number,number] = [22,  163,  74];

/** Load the logo PNG as a base64 data-URL (client-side only). */
export async function loadLogoBase64(): Promise<string | null> {
  try {
    const res  = await fetch('/images/logo-header.png');
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null; // fallback: no logo
  }
}

export interface HeaderOptions {
  /** base64 logo from loadLogoBase64() */
  logoBase64:   string | null;
  /** Main accent colour for the header bar (e.g. C_BLUE) */
  accentColor:  [number,number,number];
  /** Right-side subtitle (document type, badge) */
  rightLabel?:  string;
}

/**
 * Draws the standard PDR Connect header on the current page.
 * Returns the Y position immediately after the header.
 */
export function drawPDFHeader(
  pdf:  jsPDF,
  opts: HeaderOptions,
): number {
  const PW = pdf.internal.pageSize.getWidth();
  const M  = 18;

  const HEADER_H = 28;

  // ── Accent bar ────────────────────────────────────────────────────
  pdf.setFillColor(...opts.accentColor);
  pdf.rect(0, 0, PW, HEADER_H, 'F');

  // ── Logo image (left side) ────────────────────────────────────────
  if (opts.logoBase64) {
    // The logo is a horizontal image (~560×120 px)
    // Fit it to 60 mm wide, proportional height ≈ 13 mm
    const logoW = 62;
    const logoH = 13;
    const logoY = (HEADER_H - logoH) / 2;
    try {
      pdf.addImage(opts.logoBase64, 'PNG', M, logoY, logoW, logoH);
    } catch {
      // If addImage fails (format issue), fall back to text
      drawFallbackLogo(pdf, M, HEADER_H);
    }
  } else {
    drawFallbackLogo(pdf, M, HEADER_H);
  }

  // ── Right-side label ──────────────────────────────────────────────
  if (opts.rightLabel) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(191, 219, 254); // light blue
    pdf.text(opts.rightLabel, PW - M, HEADER_H / 2 + 1, { align: 'right' });
  }

  // ── Thin bottom border ────────────────────────────────────────────
  pdf.setDrawColor(255, 255, 255, 0.3);
  pdf.setLineWidth(0.3);
  // no explicit border line — header bar acts as divider

  pdf.setTextColor(...C_DARK);
  return HEADER_H + 6; // return Y after header
}

/** Fallback text logo if image loading fails */
function drawFallbackLogo(pdf: jsPDF, M: number, headerH: number) {
  const cx = M + 8;
  const cy = headerH / 2;
  pdf.setFillColor(255, 255, 255);
  pdf.circle(cx, cy, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(30, 64, 175);
  pdf.text('PDR', cx, cy + 3, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(255, 255, 255);
  pdf.text('PDR Connect', M + 20, headerH / 2 + 2);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(191, 219, 254);
  pdf.text('by Cybratech Solutions Ltd.', M + 20, headerH / 2 + 7);
}

/** Standard footer for all pages */
export function drawPDFFooter(
  pdf: jsPDF,
  accentColor: [number,number,number],
) {
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const M  = 18;
  const pg = pdf.getCurrentPageInfo().pageNumber;

  pdf.setDrawColor(...C_LGRAY);
  pdf.setLineWidth(0.3);
  pdf.line(M, PH - 13, PW - M, PH - 13);

  // Mini logo dot
  pdf.setFillColor(...accentColor);
  pdf.circle(M + 3, PH - 8, 2.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  pdf.setTextColor(...C_WHITE);
  pdf.text('P', M + 3, PH - 6.5, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...C_GRAY);
  pdf.text(
    'PDR Connect · Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Cyprus · CY60015676H · pdrconnect.eu',
    M + 8, PH - 7.5
  );
  pdf.text(`${pg}`, PW - M, PH - 7.5, { align: 'right' });

  pdf.setTextColor(...C_DARK);
}
