import JsBarcode from 'jsbarcode';

export type BarcodeType = 'numeric' | 'code128';

export interface BarcodeImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Generate a Code 128 barcode as a PNG data URL, plus its pixel dimensions
 * (needed by the PDF export to size the image without distorting it).
 *
 * 'numeric' means "no scannable barcode graphic — just the plain number",
 * which is the whole point of offering it as an alternative to 'code128'.
 * So this returns null for 'numeric', and callers should simply not draw
 * anything when they get null back.
 */
export function generateBarcode(codigo: string, type: BarcodeType): BarcodeImage | null {
  if (type !== 'code128') {
    return null;
  }

  try {
    const canvas = document.createElement('canvas');

    JsBarcode(canvas, codigo, {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 4,
    });

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error('Error generating barcode:', error);
    return null;
  }
}
