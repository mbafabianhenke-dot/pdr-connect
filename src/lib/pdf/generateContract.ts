import { jsPDF } from 'jspdf';
import { getContractContent, type ContractContext } from './contractTemplate';

export async function generateContractPDF(ctx: ContractContext): Promise<Buffer> {
  const content = getContractContent(ctx);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210, H = 297;
  const ML = 20, MR = 20, MT = 20;
  const TW = W - ML - MR;
  let y = MT;

  const blue = [30, 78, 172] as [number, number, number];
  const darkGray = [40, 40, 40] as [number, number, number];
  const midGray = [100, 100, 100] as [number, number, number];
  const lightGray = [220, 220, 220] as [number, number, number];

  const addPage = () => {
    doc.addPage();
    y = MT;
    addWatermark();
    addPageNumber();
  };

  const checkY = (needed: number) => {
    if (y + needed > H - 20) addPage();
  };

  const addWatermark = () => {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(80, 80, 80);
    for (let wy = 60; wy < H; wy += 70) {
      doc.text(content.watermark, W / 2, wy, { align: 'center', angle: 35 });
    }
    doc.restoreGraphicsState();
    doc.setTextColor(...darkGray);
  };

  const addPageNumber = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...midGray);
    doc.text(`PDR Connect · ${content.operator}`, ML, H - 10);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, W - MR, H - 10, { align: 'right' });
  };

  // Page 1 watermark
  addWatermark();

  // Header bar
  doc.setFillColor(...blue);
  doc.rect(0, 0, W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PDR CONNECT', ML, 11);
  doc.setFont('helvetica', 'normal');
  doc.text(content.operator, W - MR, 11, { align: 'right' });
  doc.setTextColor(...darkGray);
  y = 28;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...blue);
  doc.text(content.title, W / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...midGray);
  doc.text(content.subtitle, W / 2, y, { align: 'center' });
  y += 6;

  // Divider
  doc.setDrawColor(...lightGray);
  doc.line(ML, y, W - MR, y);
  y += 6;

  // Member info box
  doc.setFillColor(245, 247, 255);
  doc.setDrawColor(...blue);
  doc.roundedRect(ML, y, TW, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blue);
  doc.text('MEMBER DETAILS', ML + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text(`Name: ${ctx.full_name}   ·   Role: ${ctx.role}   ·   Date: ${ctx.date}`, ML + 4, y + 11);
  y += 24;

  // Watermark text
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(`⚠ ${content.watermark}`, W / 2, y, { align: 'center' });
  y += 8;

  // Paragraphs
  doc.setFont('helvetica', 'normal');
  for (const para of content.paragraphs) {
    checkY(20);

    // Heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...blue);
    doc.text(para.heading, ML, y);
    y += 5;

    // Body with word wrap
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkGray);
    const lines = doc.splitTextToSize(para.body, TW);
    for (const line of lines) {
      checkY(5);
      doc.text(line, ML, y);
      y += 4.8;
    }
    y += 5;
  }

  // Signature block
  checkY(40);
  y += 4;
  doc.setDrawColor(...lightGray);
  doc.line(ML, y, W - MR, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...blue);
  doc.text('SIGNATURES', ML, y);
  y += 8;

  // Member signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text(`${content.signed_by}:`, ML, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(ctx.full_name, ML, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${ctx.role})`, ML + 60, y);
  y += 8;
  doc.line(ML, y, ML + 80, y);
  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(`${content.date_label}: ${ctx.date}`, ML, y);

  // Operator signature
  const ox = W / 2 + 10;
  y -= 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text('Cybratech-Solutions', ox, y);
  doc.setFont('helvetica', 'normal');
  doc.text('(Operator)', ox + 40, y);
  y += 8;
  doc.line(ox, y, ox + 80, y);
  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(`${content.date_label}: ${ctx.date}`, ox, y);

  // Footer watermark on last page
  y += 16;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8);
  doc.setTextColor(...midGray);
  doc.text(content.watermark, W / 2, y, { align: 'center' });

  addPageNumber();

  return Buffer.from(doc.output('arraybuffer'));
}
