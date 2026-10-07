import jsPDF from 'jspdf';
import { generateBarcode } from './barcode';
import { LEVE_LOGO_BASE64, LEVE_LOGO_ASPECT_RATIO } from '../assets/leveLogoBase64';
// Seal dimensions in millimeters
const SEAL_WIDTH_MM = 70; // 7cm
const SEAL_HEIGHT_MM = 25; // 2.5cm
// Fixed zone reserved for the logo (mirrors the flex-shrink-0 logo column
// used in the on-screen preview, Seal.tsx). The code/convenio block is
// centered only within the remaining space so it never overlaps the logo.
const LOGO_ZONE_WIDTH_MM = 27;
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
const CONTENT_START_X_MM = (A4_WIDTH_MM - (SEALS_PER_ROW * SEAL_WIDTH_MM + (SEALS_PER_ROW - 1) * COLUMN_GAP_MM)) / 2;
// Border: solid black and thick enough to be a clear, easy-to-follow cut line.
const BORDER_COLOR = [0, 0, 0];
const BORDER_WIDTH_MM = 0.6;
// Barcode graphic sizing (only used when barcodeType === 'code128')
const BARCODE_MAX_HEIGHT_MM = 7;
const BARCODE_WIDTH_RATIO = 0.92; // fraction of contentWidth the barcode may use
/**
 * Generate PDF with seals
 */
export async function generatePdf(seals, options = {
    sealsPerPage: 22,
    showBorders: true,
    barcodeType: 'code128',
}) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4',
    });
    // Calculate layout
    const sealsPerRow = SEALS_PER_ROW;
    const sealsPerCol = Math.floor((A4_HEIGHT_MM - MARGIN_MM * 2) / SEAL_HEIGHT_MM);
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
                if (sealIndex >= seals.length)
                    break;
                const seal = seals[sealIndex];
                const x = CONTENT_START_X_MM + col * (SEAL_WIDTH_MM + COLUMN_GAP_MM);
                const y = MARGIN_MM + row * SEAL_HEIGHT_MM;
                renderSeal(doc, seal, x, y, options.showBorders, options.barcodeType);
                sealIndex++;
            }
            if (sealIndex >= seals.length)
                break;
        }
        pageNum++;
    }
    // Save PDF
    doc.save('selos_leve.pdf');
}
/**
 * Render a single seal on the PDF
 */
function renderSeal(doc, seal, x, y, showBorders, barcodeType) {
    // Draw border if requested — solid black, thick enough for a clean cut line.
    if (showBorders) {
        doc.setDrawColor(...BORDER_COLOR);
        doc.setLineWidth(BORDER_WIDTH_MM);
        doc.rect(x, y, SEAL_WIDTH_MM, SEAL_HEIGHT_MM);
    }
    // Add LEVE logo — the real logo image, confined to its own fixed-width
    // zone on the left and vertically centered, so it can never be
    // overlapped by the code text (mirrors the on-screen preview, Seal.tsx).
    const logoPaddingXMm = 1.5;
    const logoPaddingYMm = 2;
    const logoMaxWidthMm = LOGO_ZONE_WIDTH_MM - logoPaddingXMm * 2;
    const logoMaxHeightMm = SEAL_HEIGHT_MM - logoPaddingYMm * 2;
    let logoWidthMm = logoMaxWidthMm;
    let logoHeightMm = logoWidthMm / LEVE_LOGO_ASPECT_RATIO;
    if (logoHeightMm > logoMaxHeightMm) {
        logoHeightMm = logoMaxHeightMm;
        logoWidthMm = logoHeightMm * LEVE_LOGO_ASPECT_RATIO;
    }
    const logoX = x + (LOGO_ZONE_WIDTH_MM - logoWidthMm) / 2;
    const logoY = y + (SEAL_HEIGHT_MM - logoHeightMm) / 2;
    doc.addImage(LEVE_LOGO_BASE64, 'PNG', logoX, logoY, logoWidthMm, logoHeightMm);
    // Content area starts right after the logo zone. The code, the optional
    // barcode graphic, and the convenio are all centered only within THIS
    // area, so they never invade the logo zone regardless of code length.
    const contentStartX = x + LOGO_ZONE_WIDTH_MM;
    const contentWidth = SEAL_WIDTH_MM - LOGO_ZONE_WIDTH_MM - CONTENT_PADDING_MM;
    const contentCenterX = contentStartX + contentWidth / 2;
    // Try to generate the scannable barcode graphic when 'code128' is
    // selected. Returns null for 'numeric' (by design — no graphic, just
    // the plain digits) or if generation fails for any reason.
    const barcodeImage = generateBarcode(seal.codigo, barcodeType);
    if (barcodeImage) {
        // --- Layout WITH barcode graphic: code on top, barcode strip below,
        //     convenio (if any) at the bottom. ---
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const codigoY = y + 7;
        doc.text(seal.codigo, contentCenterX, codigoY, {
            align: 'center',
            maxWidth: contentWidth,
        });
        // Size the barcode to fit the content area without distorting its
        // aspect ratio, capped at BARCODE_MAX_HEIGHT_MM tall.
        const naturalAspect = barcodeImage.width / barcodeImage.height;
        let barcodeWidthMm = contentWidth * BARCODE_WIDTH_RATIO;
        let barcodeHeightMm = barcodeWidthMm / naturalAspect;
        if (barcodeHeightMm > BARCODE_MAX_HEIGHT_MM) {
            barcodeHeightMm = BARCODE_MAX_HEIGHT_MM;
            barcodeWidthMm = barcodeHeightMm * naturalAspect;
        }
        const barcodeX = contentCenterX - barcodeWidthMm / 2;
        const barcodeY = codigoY + 2;
        doc.addImage(barcodeImage.dataUrl, 'PNG', barcodeX, barcodeY, barcodeWidthMm, barcodeHeightMm);
        if (seal.convenio) {
            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            const convenioY = barcodeY + barcodeHeightMm + 3.5;
            let convenio = seal.convenio;
            if (convenio.length > 40) {
                convenio = convenio.substring(0, 37) + '...';
            }
            doc.text(convenio, contentCenterX, convenioY, {
                align: 'center',
                maxWidth: contentWidth,
            });
        }
        return;
    }
    // --- Layout WITHOUT barcode graphic ('numeric' mode): the original,
    //     vertically-centered code + convenio layout. ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const codigoY = seal.convenio ? y + SEAL_HEIGHT_MM / 2 - 1 : y + SEAL_HEIGHT_MM / 2 + 2;
    doc.text(seal.codigo, contentCenterX, codigoY, {
        align: 'center',
        maxWidth: contentWidth,
    });
    if (seal.convenio) {
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const convenioY = codigoY + 5;
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
export async function generatePdfPreview(seals, showBorders = true, barcodeType = 'code128') {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4',
    });
    const sealsPerRow = SEALS_PER_ROW;
    const sealsPerCol = Math.floor((A4_HEIGHT_MM - MARGIN_MM * 2) / SEAL_HEIGHT_MM);
    let sealIndex = 0;
    let pageNum = 1;
    while (sealIndex < seals.length) {
        if (pageNum > 1) {
            doc.addPage();
        }
        for (let row = 0; row < sealsPerCol; row++) {
            for (let col = 0; col < sealsPerRow; col++) {
                if (sealIndex >= seals.length)
                    break;
                const seal = seals[sealIndex];
                const x = CONTENT_START_X_MM + col * (SEAL_WIDTH_MM + COLUMN_GAP_MM);
                const y = MARGIN_MM + row * SEAL_HEIGHT_MM;
                renderSeal(doc, seal, x, y, showBorders, barcodeType);
                sealIndex++;
            }
            if (sealIndex >= seals.length)
                break;
        }
        pageNum++;
    }
    return doc.output('blob');
}
