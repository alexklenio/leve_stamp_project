import JsBarcode from 'jsbarcode';

export type BarcodeType = 'numeric' | 'code128';

/**
 * Generate a barcode as SVG string
 */
export function generateBarcode(codigo: string, type: BarcodeType = 'code128'): string {
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
  } catch (error) {
    console.error('Error generating barcode:', error);
    return '';
  }
}

/**
 * Generate multiple barcodes for batch processing
 */
export async function generateBarcodes(
  codigos: string[],
  type: BarcodeType = 'code128'
): Promise<Map<string, string>> {
  const barcodes = new Map<string, string>();

  for (const codigo of codigos) {
    const barcode = generateBarcode(codigo, type);
    if (barcode) {
      barcodes.set(codigo, barcode);
    }
  }

  return barcodes;
}
