import jsPDF from 'jspdf';
import { Seal } from './parseTxt';
import { generateBarcode } from './barcode';

// Seal dimensions in millimeters
const SEAL_WIDTH_MM = 70; // 7cm
const SEAL_HEIGHT_MM = 25; // 2.5cm

// Page dimensions
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Margins
const MARGIN_MM = 10;

interface PdfOptions {
  sealsPerPage: number;
  showBorders: boolean;
  barcodeType: 'numeric' | 'code128';
}

/**
 * Generate PDF with seals
 */
export async function generatePdf(
  seals: Seal[],
  options: PdfOptions = {
    sealsPerPage: 22,
    showBorders: true,
    barcodeType: 'code128',
  }
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  // Calculate layout
  const sealsPerRow = 2;
  const sealsPerCol = Math.floor(
    (A4_HEIGHT_MM - MARGIN_MM * 2) / SEAL_HEIGHT_MM
  );
  const totalSealsPerPage = sealsPerRow * sealsPerCol;

  // Generate all barcodes first
  const barcodes = new Map<string, string>();
  for (const seal of seals) {
    const barcode = generateBarcode(seal.codigo, options.barcodeType);
    barcodes.set(seal.codigo, barcode);
  }

  // Render pages
  let sealIndex = 0;
  let pageNum = 1;

  while (sealIndex < seals.length) {
    if (pageNum > 1) {
      doc.addPage();
    }

    // Render seals on this page
    for (let row = 0; row < sealsPerCol; row++) {
      for (let col = 0; col < sealsPerRow; col++) {
        if (sealIndex >= seals.length) break;

        const seal = seals[sealIndex];
        const x = MARGIN_MM + col * SEAL_WIDTH_MM;
        const y = MARGIN_MM + row * SEAL_HEIGHT_MM;

        renderSeal(doc, seal, x, y, options.showBorders, barcodes.get(seal.codigo) || '');
        sealIndex++;
      }
      if (sealIndex >= seals.length) break;
    }

    pageNum++;
  }

  // Save PDF
  doc.save('selos_leve.pdf');
}

/**
 * Render a single seal on the PDF
 */
function renderSeal(
  doc: jsPDF,
  seal: Seal,
  x: number,
  y: number,
  showBorders: boolean,
  barcodeImage: string
): void {
  // Draw border if requested
  if (showBorders) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(x, y, SEAL_WIDTH_MM, SEAL_HEIGHT_MM);
  }

  // Add LEVE logo (simplified - using text as placeholder)
  doc.setFontSize(10);
  doc.setTextColor(0, 51, 102); // LEVE blue
  doc.text('LEVÉ', x + 5, y + 10);
  doc.setFontSize(7);
  doc.text('MOBILIDADE', x + 5, y + 14);

  // Add codigo (centered)
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  const codigoX = x + SEAL_WIDTH_MM / 2;
  const codigoY = y + 15;
  doc.text(seal.codigo, codigoX, codigoY, { align: 'center' });

  // Add convenio if present (centered, smaller)
  if (seal.convenio) {
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const convenioY = codigoY + 4;
    
    // Truncate long text to fit
    let convenio = seal.convenio;
    if (convenio.length > 40) {
      convenio = convenio.substring(0, 37) + '...';
    }
    
    doc.text(convenio, codigoX, convenioY, { align: 'center' });
  }
}

/**
 * Generate PDF preview for display
 */
export async function generatePdfPreview(seals: Seal[], showBorders: boolean = true): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const sealsPerRow = 2;
  const sealsPerCol = Math.floor(
    (A4_HEIGHT_MM - MARGIN_MM * 2) / SEAL_HEIGHT_MM
  );

  // Generate barcodes
  const barcodes = new Map<string, string>();
  for (const seal of seals) {
    const barcode = generateBarcode(seal.codigo, 'code128');
    barcodes.set(seal.codigo, barcode);
  }

  let sealIndex = 0;
  let pageNum = 1;

  while (sealIndex < seals.length) {
    if (pageNum > 1) {
      doc.addPage();
    }

    for (let row = 0; row < sealsPerCol; row++) {
      for (let col = 0; col < sealsPerRow; col++) {
        if (sealIndex >= seals.length) break;

        const seal = seals[sealIndex];
        const x = MARGIN_MM + col * SEAL_WIDTH_MM;
        const y = MARGIN_MM + row * SEAL_HEIGHT_MM;

        renderSeal(doc, seal, x, y, showBorders, barcodes.get(seal.codigo) || '');
        sealIndex++;
      }
      if (sealIndex >= seals.length) break;
    }

    pageNum++;
  }

  return doc.output('blob');
}
