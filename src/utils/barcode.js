import JsBarcode from 'jsbarcode';
/**
 * Generate a barcode as SVG string
 */
export function generateBarcode(codigo, type = 'code128') {
    try {
        const canvas = document.createElement('canvas');
        const format = type === 'code128' ? 'CODE128' : 'CODE128'; // Both use CODE128, just display differs
        JsBarcode(canvas, codigo, {
            format: format,
            width: 2,
            height: 40,
            displayValue: false,
            margin: 0,
        });
        return canvas.toDataURL('image/png');
    }
    catch (error) {
        console.error('Error generating barcode:', error);
        return '';
    }
}
/**
 * Generate multiple barcodes for batch processing
 */
export async function generateBarcodes(codigos, type = 'code128') {
    const barcodes = new Map();
    for (const codigo of codigos) {
        const barcode = generateBarcode(codigo, type);
        if (barcode) {
            barcodes.set(codigo, barcode);
        }
    }
    return barcodes;
}
