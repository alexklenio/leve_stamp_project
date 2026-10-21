import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { UploadBox } from './UploadBox';
import { SealGrid } from './SealGrid';
import { Toolbar } from './Toolbar';
import { parseTxt, validateSeals } from '../utils/parseTxt';
export default function SealGeneratorTool({ onBack }) {
    // The list of codes, one per line. It is filled by pasting into the text
    // area OR by uploading a TXT (the file content is loaded into the same
    // area), so both ways go through exactly the same recognition below.
    const [codesText, setCodesText] = useState('');
    const [zoom, setZoom] = useState(100);
    const [showBorders, setShowBorders] = useState(true);
    const [barcodeType, setBarcodeType] = useState('code128');
    const [sealsPerPage, setSealsPerPage] = useState(22);
    const [currentPage, setCurrentPage] = useState(1);
    const [convenio, setConvenio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const parsed = useMemo(() => validateSeals(parseTxt(codesText)), [codesText]);
    const rawSeals = parsed.valid;
    const ignoredLines = parsed.invalid;
    const duplicateCount = useMemo(() => rawSeals.length - new Set(rawSeals.map((s) => s.codigo)).size, [rawSeals]);
    // Seals actually shown and exported. The convênio typed in the field is
    // applied here, so inserting/changing it updates the preview and the PDF
    // immediately — no need to upload the TXT again. A convênio that comes
    // inside the TXT line itself is kept as is.
    const seals = useMemo(() => {
        const convenioTrimmed = convenio.trim();
        if (!convenioTrimmed)
            return rawSeals;
        return rawSeals.map((seal) => ({
            ...seal,
            convenio: seal.convenio || convenioTrimmed,
        }));
    }, [rawSeals, convenio]);
    const totalPages = Math.max(1, Math.ceil(seals.length / sealsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const handleFileUpload = (content) => {
        setIsLoading(true);
        try {
            setCodesText(content);
            setCurrentPage(1);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Voltar ao Dashboard"] }), _jsx("span", { className: "text-gray-300", children: "|" }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: "Gerador de Selos" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 flex flex-col gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Conv\u00EAnio / Libera\u00E7\u00E3o" }), _jsx("input", { type: "text", value: convenio, onChange: (e) => setConvenio(e.target.value), placeholder: "ex: LIBERA\u00C7\u00C3O GER\u00CANCIA - LT12082026", className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue", disabled: isLoading }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Pode preencher ou alterar a qualquer momento \u2014 os selos s\u00E3o atualizados na hora" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Upload do TXT" }), _jsx(UploadBox, { onFileUpload: handleFileUpload, isLoading: isLoading })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800", children: "Colar c\u00F3digos" }), codesText && (_jsx("button", { onClick: () => {
                                                    setCodesText('');
                                                    setCurrentPage(1);
                                                }, className: "text-xs font-semibold text-red-600 hover:text-red-800", children: "Limpar" }))] }), _jsx("textarea", { value: codesText, onChange: (e) => setCodesText(e.target.value), rows: 8, spellCheck: false, className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-leve-blue resize-y" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Cole a lista com um c\u00F3digo por linha (tamb\u00E9m aceita c\u00F3digo;conv\u00EAnio). Os selos s\u00E3o gerados na hora. O conte\u00FAdo de um TXT enviado aparece aqui e pode ser editado." }), rawSeals.length > 0 && (_jsxs("p", { className: "text-xs font-semibold text-green-700 mt-2", children: ["\u2713 ", rawSeals.length, " ", rawSeals.length === 1 ? 'código reconhecido' : 'códigos reconhecidos'] })), duplicateCount > 0 && (_jsxs("p", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2", children: ["\u26A0\uFE0F ", duplicateCount, " ", duplicateCount === 1 ? 'código repetido' : 'códigos repetidos', " na lista."] })), ignoredLines.length > 0 && (_jsxs("div", { className: "text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2", children: [_jsxs("p", { className: "font-semibold", children: ["\u26A0\uFE0F ", ignoredLines.length, " ", ignoredLines.length === 1 ? 'linha ignorada' : 'linhas ignoradas', " (o c\u00F3digo precisa ter ao menos 10 d\u00EDgitos num\u00E9ricos):"] }), _jsxs("p", { className: "font-mono break-all mt-1", children: [ignoredLines.slice(0, 3).map((l) => l.codigo || '(vazio)').join(' · '), ignoredLines.length > 3 && ` · … e mais ${ignoredLines.length - 3}`] })] }))] }), seals.length > 0 && (_jsx("div", { className: "bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-semibold text-green-800", children: ["\u2713 ", seals.length, " selos carregados"] }), _jsx("p", { className: "text-xs text-green-700 mt-1", children: "Pronto para impress\u00E3o" })] })] }) }))] }), _jsxs("div", { className: "lg:col-span-3 flex flex-col gap-6", children: [seals.length > 0 && (_jsx(Toolbar, { seals: seals, zoom: zoom, onZoomChange: setZoom, showBorders: showBorders, onShowBordersChange: setShowBorders, barcodeType: barcodeType, onBarcodeTypeChange: setBarcodeType, sealsPerPage: sealsPerPage, onSealsPerPageChange: setSealsPerPage, isLoading: isLoading })), seals.length > 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Visualiza\u00E7\u00E3o" }), _jsx(SealGrid, { seals: seals, sealsPerPage: sealsPerPage, showBorders: showBorders, zoom: zoom, currentPage: safePage, onPageChange: setCurrentPage, barcodeType: barcodeType })] })) : (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [_jsx("svg", { className: "w-16 h-16 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 font-semibold", children: "Nenhum c\u00F3digo carregado" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Carregue um arquivo TXT ou cole os c\u00F3digos para come\u00E7ar" })] })] }) }))] })] })] }));
}
