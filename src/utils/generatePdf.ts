import jsPDF from 'jspdf';
import { Seal } from './parseTxt';
import { generateBarcode } from './barcode';

// Seal dimensions in millimeters
const SEAL_WIDTH_MM = 70; // 7cm
const SEAL_HEIGHT_MM = 25; // 2.5cm

// Fixed zone reserved for the logo (mirrors the flex-shrink-0 logo column
// used in the on-screen preview, Seal.tsx). The code/convenio block is
// centered only within the remaining space so it never overlaps the logo.
const LOGO_ZONE_WIDTH_MM = 20;
const CONTENT_PADDING_MM = 2; // small right padding so text doesn't touch the border

// Page dimensions
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Margins
const MARGIN_MM = 10;

// Layout: 2 columns of seals, with a visible gap between them, and the
// whole two-column block centered horizontally on the page (rather than
// pinned to the left margin).
const SEALS_PER_ROW = 2;
const COLUMN_GAP_MM = 8;
const CONTENT_START_X_MM =
  (A4_WIDTH_MM - (SEALS_PER_ROW * SEAL_WIDTH_MM + (SEALS_PER_ROW - 1) * COLUMN_GAP_MM)) / 2;

// Border: solid black and thick enough to be a clear, easy-to-follow cut line.
const BORDER_COLOR: [number, number, number] = [0, 0, 0];
const BORDER_WIDTH_MM = 0.6;

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
  const sealsPerRow = SEALS_PER_ROW;
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
        const x = CONTENT_START_X_MM + col * (SEAL_WIDTH_MM + COLUMN_GAP_MM);
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
  // Draw border if requested — solid black, thick enough for a clean cut line.
  if (showBorders) {
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(BORDER_WIDTH_MM);
    doc.rect(x, y, SEAL_WIDTH_MM, SEAL_HEIGHT_MM);
  }

  // Add LEVE logo — confined to its own fixed-width zone on the left,
  // vertically centered, so it can never be overlapped by the code text.
  const logoCenterX = x + LOGO_ZONE_WIDTH_MM / 2;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102); // LEVE blue
  doc.text('LEVÉ', logoCenterX, y + SEAL_HEIGHT_MM / 2 - 1, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont(undefined, 'normal');
  doc.text('MOBILIDADE', logoCenterX, y + SEAL_HEIGHT_MM / 2 + 3, { align: 'center' });

  // Content area starts right after the logo zone. The code and convenio
  // are centered within THIS area only (never within the full seal width),
  // so they never invade the logo zone regardless of code length.
  const contentStartX = x + LOGO_ZONE_WIDTH_MM;
  const contentWidth = SEAL_WIDTH_MM - LOGO_ZONE_WIDTH_MM - CONTENT_PADDING_MM;
  const contentCenterX = contentStartX + contentWidth / 2;

  // Add codigo (centered within content area)
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  const codigoY = seal.convenio ? y + SEAL_HEIGHT_MM / 2 - 1 : y + SEAL_HEIGHT_MM / 2 + 2;
  doc.text(seal.codigo, contentCenterX, codigoY, {
    align: 'center',
    maxWidth: contentWidth,
  });

  // Add convenio if present (centered within content area, smaller)
  if (seal.convenio) {
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const convenioY = codigoY + 5;

    // Truncate long text to fit
    let convenio = seal.convenio;
    if (convenio.length > 40) {
      convenio = convenio.substring(0, 37) + '...';
    }

    doc.text(convenio, contentCenterX, convenioY, {
      align: 'center',
      maxWidth: contentWidth,
    });
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

  const sealsPerRow = SEALS_PER_ROW;
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
        const x = CONTENT_START_X_MM + col * (SEAL_WIDTH_MM + COLUMN_GAP_MM);
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
