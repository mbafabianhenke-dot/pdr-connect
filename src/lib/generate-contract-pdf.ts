/**
 * Client-side PDF generator for signed PDR Connect contracts.
 * Always generates in English (legally binding version) regardless of UI language.
 * Uses jsPDF text rendering — no external image conversion required.
 */
import { jsPDF } from 'jspdf';
import CONTRACTS from './contract-content';
import type { ContractDoc } from './contract-content';

export interface SignedContractParams {
  contractType: 'client' | 'worker';
  signerName: string;
  signerEmail?: string;
  signatureDataUrl: string; // base64 PNG from SignaturePad
}

const BLUE: [number, number, number]    = [30,  64, 175];
const DARK: [number, number, number]    = [17,  24,  39];
const GRAY: [number, number, number]    = [107, 114, 128];
const LGRAY: [number, number, number]   = [229, 231, 235];
const BGBLUE: [number, number, number]  = [239, 246, 255];
const WHITE: [number, number, number]   = [255, 255, 255];
const BGDARK: [number, number, number]  = [249, 250, 251];

export function generateContractPDF(params: SignedContractParams): Blob {
  const { contractType, signerName, signerEmail, signatureDataUrl } = params;

  // Always use English content for the legal PDF
  const set = CONTRACTS['en'];
  const doc: ContractDoc = contractType === 'client' ? set.client : set.worker;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW  = pdf.internal.pageSize.getWidth();   // 210
  const PH  = pdf.internal.pageSize.getHeight();  // 297
  const M   = 18;
  const CW  = PW - 2 * M;
  const yRef = { v: M };

  // ─────────────── helpers ─────────────────────────────────────────────
  const addFooter = () => {
    const pg = pdf.getCurrentPageInfo().pageNumber;
    // Footer separator line
    pdf.setDrawColor(...LGRAY);
    pdf.setLineWidth(0.3);
    pdf.line(M, PH - 14, PW - M, PH - 14);
    pdf.setLineWidth(0.2);
    // Logo circle mini
    pdf.setFillColor(30, 64, 175);
    pdf.circle(M + 3.5, PH - 9, 3, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...WHITE);
    pdf.text('C', M + 3.5, PH - 7.8, { align: 'center' });
    // Footer text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(...GRAY);
    pdf.text('PDR Connect · Cybratech Solutions Ltd. · Efesou 9, 5280 Paralimni, Cyprus · CY60015676H · info@cybratech-solutions.com', M + 9, PH - 8);
    pdf.text(`Page ${pg}`, PW - M, PH - 8, { align: 'right' });
    pdf.setTextColor(...DARK);
  };

  const newPage = () => {
    addFooter();
    pdf.addPage();
    yRef.v = M;
    // subtle watermark
    pdf.saveGraphicsState();
    pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(26);
    pdf.setTextColor(80, 80, 80);
    for (let wy = 60; wy < PH; wy += 80) {
      pdf.text('PDR CONNECT', PW / 2, wy, { align: 'center', angle: 35 });
    }
    pdf.restoreGraphicsState();
  };

  const ensure = (needed: number) => {
    if (yRef.v + needed > PH - 18) newPage();
  };

  const wrapWrite = (
    text: string,
    fontSize: number,
    fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic',
    color: [number, number, number],
    indent = 0,
    lineH?: number
  ) => {
    pdf.setFont('helvetica', fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    const lh = lineH ?? fontSize * 0.42;
    // Split by explicit \n first, then by width
    const paras = text.split('\n');
    for (const para of paras) {
      const lines = pdf.splitTextToSize(para, CW - indent);
      for (const line of lines) {
        ensure(lh + 2);
        pdf.text(line, M + indent, yRef.v);
        yRef.v += lh;
      }
    }
  };

  // ─────────────── PAGE 1 watermark ────────────────────────────────────
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.04 }));
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(80, 80, 80);
  for (let wy = 60; wy < PH; wy += 80) {
    pdf.text('PDR CONNECT', PW / 2, wy, { align: 'center', angle: 35 });
  }
  pdf.restoreGraphicsState();

  // ─────────────── HEADER BAR ──────────────────────────────────────────
  pdf.setFillColor(...BLUE);
  pdf.rect(0, 0, PW, 24, 'F');

  // Logo circle (white circle with "C" initial as placeholder for Cybratech logo)
  pdf.setFillColor(...WHITE);
  pdf.circle(M + 8, 12, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 64, 175);
  pdf.text('C', M + 8, 15, { align: 'center' });

  // Brand text
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(...WHITE);
  pdf.text('PDR CONNECT', M + 20, 10);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(191, 219, 254); // blue-200
  pdf.text('by Cybratech Solutions Ltd.', M + 20, 16.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(191, 219, 254);
  pdf.text('Efesou 9, 5280 Paralimni, Cyprus · CY60015676H', PW - M, 12, { align: 'right' });
  yRef.v = 32;

  // Contract title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(...BLUE);
  pdf.text(doc.title, PW / 2, yRef.v, { align: 'center' });
  yRef.v += 7;

  // Badge pill
  const badge = doc.badge;
  const bw = 90;
  const bx = PW / 2 - bw / 2;
  pdf.setFillColor(...BGBLUE);
  pdf.setDrawColor(...BLUE);
  pdf.roundedRect(bx, yRef.v, bw, 7, 3, 3, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...BLUE);
  pdf.text(badge, PW / 2, yRef.v + 4.8, { align: 'center' });
  yRef.v += 12;

  // Intro
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...GRAY);
  const introLines = pdf.splitTextToSize(doc.intro, CW);
  for (const line of introLines) {
    pdf.text(line, M, yRef.v);
    yRef.v += 4.5;
  }
  yRef.v += 6;

  // Divider
  pdf.setDrawColor(...LGRAY);
  pdf.line(M, yRef.v, PW - M, yRef.v);
  yRef.v += 6;

  // ─────────────── PARTIES ─────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(...DARK);
  pdf.text(doc.parties.label, M, yRef.v);
  yRef.v += 5;

  // Operator party block
  const opLines = pdf.splitTextToSize(doc.parties.operator, CW - 8);
  const opH = opLines.length * 4.6 + 9;
  ensure(opH);
  pdf.setFillColor(...BGBLUE);
  pdf.roundedRect(M, yRef.v, CW, opH, 2, 2, 'F');
  pdf.setFillColor(...BLUE);
  pdf.rect(M, yRef.v, 3, opH, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...BLUE);
  pdf.text('OPERATOR — PDR CONNECT', M + 6, yRef.v + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(55, 65, 81);
  for (let i = 0; i < opLines.length; i++) {
    pdf.text(opLines[i], M + 6, yRef.v + 10 + i * 4.6);
  }
  yRef.v += opH + 3;

  // User party block
  const clLines = pdf.splitTextToSize(doc.parties.client, CW - 8);
  const clH = clLines.length * 4.6 + 9;
  ensure(clH);
  pdf.setFillColor(...BGDARK);
  pdf.roundedRect(M, yRef.v, CW, clH, 2, 2, 'F');
  pdf.setFillColor(156, 163, 175);
  pdf.rect(M, yRef.v, 3, clH, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  pdf.text(contractType === 'client' ? 'CLIENT / CONTRACTOR' : 'TECHNICIAN / WORKER', M + 6, yRef.v + 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(55, 65, 81);
  for (let i = 0; i < clLines.length; i++) {
    pdf.text(clLines[i], M + 6, yRef.v + 10 + i * 4.6);
  }
  yRef.v += clH + 8;

  // ─────────────── SECTIONS ────────────────────────────────────────────
  for (const section of doc.sections) {
    ensure(20);

    // Section heading bar
    pdf.setFillColor(...BGDARK);
    pdf.setDrawColor(...LGRAY);
    pdf.roundedRect(M, yRef.v, CW, 8, 1.5, 1.5, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(...DARK);
    pdf.text(section.h, M + 4, yRef.v + 5.5);
    yRef.v += 11;

    if (section.p) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81);
      const paras = section.p.split('\n');
      for (const para of paras) {
        const lines = pdf.splitTextToSize(para, CW);
        for (const line of lines) {
          ensure(5);
          pdf.text(line, M, yRef.v);
          yRef.v += 4.8;
        }
      }
      yRef.v += 2;
    }

    if (section.list) {
      for (const item of section.list) {
        const itemLines = pdf.splitTextToSize(item, CW - 7);
        ensure(itemLines.length * 4.8 + 2);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(55, 65, 81);
        // bullet dot
        pdf.setFillColor(...BLUE);
        pdf.circle(M + 2, yRef.v - 1, 0.8, 'F');
        for (let i = 0; i < itemLines.length; i++) {
          pdf.text(itemLines[i], M + 6, yRef.v + i * 4.8);
        }
        yRef.v += itemLines.length * 4.8 + 1.5;
      }
      yRef.v += 1;
    }

    if (section.p2) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...GRAY);
      const p2Lines = pdf.splitTextToSize(section.p2, CW);
      for (const line of p2Lines) {
        ensure(5);
        pdf.text(line, M, yRef.v);
        yRef.v += 4.5;
      }
      yRef.v += 2;
    }
  }

  // ─────────────── SIGNATURE BLOCK ─────────────────────────────────────
  ensure(90);
  yRef.v += 4;

  // Section divider
  pdf.setDrawColor(...LGRAY);
  pdf.line(M, yRef.v, PW - M, yRef.v);
  yRef.v += 6;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...BLUE);
  pdf.text('DIGITAL SIGNATURE & DECLARATION', M, yRef.v);
  yRef.v += 7;

  // Declaration text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(55, 65, 81);
  const declText = `I, ${signerName}, hereby confirm that I have read this entire Agreement, understand its content, and agree to be legally bound by all its terms and conditions.`;
  const declLines = pdf.splitTextToSize(declText, CW);
  for (const line of declLines) {
    pdf.text(line, M, yRef.v);
    yRef.v += 4.8;
  }
  yRef.v += 5;

  // Two-column: signature image | signer details
  const sigW = 85;
  const sigH = 38;
  const detX = M + sigW + 8;
  const detW = CW - sigW - 8;

  // Signature box
  pdf.setDrawColor(...LGRAY);
  pdf.setFillColor(252, 252, 252);
  pdf.roundedRect(M, yRef.v, sigW, sigH, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  pdf.text('DIGITAL SIGNATURE', M + 3, yRef.v + 5);

  // Embed signature image
  try {
    pdf.addImage(signatureDataUrl, 'PNG', M + 2, yRef.v + 7, sigW - 4, sigH - 12);
  } catch (e) {
    // If image fails, draw placeholder text
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(...GRAY);
    pdf.text('[Signature on file]', M + sigW / 2, yRef.v + sigH / 2, { align: 'center' });
  }

  // Signature line underline
  pdf.setDrawColor(...BLUE);
  pdf.setLineWidth(0.4);
  pdf.line(M + 2, yRef.v + sigH - 4, M + sigW - 2, yRef.v + sigH - 4);
  pdf.setLineWidth(0.2);

  // Signer details (right column)
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const detY = yRef.v + 2;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  pdf.text('SIGNER DETAILS', detX, detY + 3);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text('Full Name', detX, detY + 10);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...DARK);
  pdf.text(signerName, detX, detY + 15);

  if (signerEmail) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...GRAY);
    pdf.text('Email', detX, detY + 21);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81);
    const emailLines = pdf.splitTextToSize(signerEmail, detW);
    pdf.text(emailLines[0], detX, detY + 26);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text('Date & Time', detX, detY + 31);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...DARK);
  pdf.text(dateStr, detX, detY + 36);

  yRef.v += sigH + 8;

  // Operator countersignature line
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text('FOR PDR CONNECT — CYBRATECH SOLUTIONS LTD.', M, yRef.v);
  yRef.v += 5;
  pdf.setDrawColor(...LGRAY);
  pdf.line(M, yRef.v, M + 90, yRef.v);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...GRAY);
  pdf.text('Authorised Signatory', M, yRef.v + 4);
  yRef.v += 10;

  // Legal disclaimer box
  ensure(22);
  const disclaimerText = `This document was digitally signed and executed via the PDR Connect platform (pdrconnect.com) on ${dateStr}. The digital signature above constitutes a legally binding signature. A copy of this document has been stored securely in the signatory's account. Governing law: Republic of Cyprus.`;
  const dlLines = pdf.splitTextToSize(disclaimerText, CW - 8);
  const dlH = dlLines.length * 4.2 + 8;
  pdf.setFillColor(254, 252, 232); // yellow-50
  pdf.setDrawColor(253, 224, 71);  // yellow-300
  pdf.roundedRect(M, yRef.v, CW, dlH, 2, 2, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(92, 68, 0);
  for (let i = 0; i < dlLines.length; i++) {
    pdf.text(dlLines[i], M + 4, yRef.v + 5 + i * 4.2);
  }
  yRef.v += dlH + 5;

  // Timestamp
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRAY);
  pdf.text(`Document ID: PDR-${Date.now()} · Generated: ${new Date().toISOString()}`, M, yRef.v);

  addFooter();

  return pdf.output('blob');
}
