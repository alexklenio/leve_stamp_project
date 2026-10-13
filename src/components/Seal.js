import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { generateBarcode } from '../utils/barcode';
import { LEVE_LOGO_BASE64 } from '../assets/leveLogoBase64';
export const Seal = ({ seal, showBorders = true, barcodeType = 'code128', }) => {
    // The preview uses the exact same barcode image the PDF export uses
    // (generateBarcode returns null for 'numeric', i.e. "no bars, digits only").
    const barcode = useMemo(() => generateBarcode(seal.codigo, barcodeType), [seal.codigo, barcodeType]);
    // Seal dimensions: 7cm × 2.5cm = 198.4px × 70.9px at 72 DPI
    const sealWidth = 198; // pixels for 7cm
    const sealHeight = 71; // pixels for 2.5cm
    // Fixed logo zone (matches the 27mm / 70mm reserved zone used in the PDF
    // export, generatePdf.ts) so the on-screen preview and the exported PDF
    // line up exactly and the code never overlaps the logo.
    const logoZoneWidth = Math.round(sealWidth * (27 / 70)); // ~76px
    return (_jsx("div", { className: `bg-white inline-block ${showBorders ? 'border border-gray-300' : ''}`, style: {
            width: `${sealWidth}px`,
            height: `${sealHeight}px`,
        }, children: _jsxs("div", { className: "flex items-center h-full px-2 gap-2", children: [_jsx("div", { className: "flex-shrink-0 flex items-center justify-center", style: { width: `${logoZoneWidth}px` }, children: _jsx("img", { src: LEVE_LOGO_BASE64, alt: "LEV\u00C9 Mobilidade", className: "w-full h-auto object-contain" }) }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0", children: [_jsx("div", { className: "font-bold text-black text-center leading-none", style: { fontSize: barcode ? '12px' : '14px' }, children: seal.codigo }), barcode && (
                        // 20px ≈ 7mm tall: same height cap the PDF export applies.
                        _jsx("img", { src: barcode.dataUrl, alt: `Código de barras ${seal.codigo}`, style: { height: '20px', width: 'auto', maxWidth: '100%' } })), seal.convenio && (_jsx("div", { className: "font-bold text-black text-center leading-none", style: { fontSize: '5px' }, children: seal.convenio.length > 35
                                ? `${seal.convenio.substring(0, 32)}...`
                                : seal.convenio }))] })] }) }));
};
// Preview component for tooltip/modal
export const SealPreview = ({ seal, showBorders, barcodeType }) => {
    return (_jsx("div", { className: "bg-white p-4 rounded-lg shadow-lg", children: _jsx(Seal, { seal: seal, showBorders: showBorders, barcodeType: barcodeType }) }));
};
