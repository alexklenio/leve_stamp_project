import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UploadBox } from './components/UploadBox';
import { SealGrid } from './components/SealGrid';
import { Toolbar } from './components/Toolbar';
import { parseTxt, validateSeals } from './utils/parseTxt';
import { LEVE_LOGO_WHITE_BASE64, LEVE_LOGO_WHITE_ASPECT_RATIO } from './assets/leveLogoBase64';
export default function App() {
    const [seals, setSeals] = useState([]);
    const [invalidSeals, setInvalidSeals] = useState([]);
    const [zoom, setZoom] = useState(100);
    const [showBorders, setShowBorders] = useState(true);
    const [barcodeType, setBarcodeType] = useState('code128');
    const [sealsPerPage, setSealsPerPage] = useState(22);
    const [currentPage, setCurrentPage] = useState(1);
    const [convenio, setConvenio] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleFileUpload = (content) => {
        setIsLoading(true);
        try {
            // Parse the TXT file
            let parsedSeals = parseTxt(content);
            // If convenio is set and seals don't have it, add it
            if (convenio && parsedSeals.length > 0) {
                parsedSeals = parsedSeals.map(seal => ({
                    ...seal,
                    convenio: seal.convenio || convenio,
                }));
            }
            // Validate seals
            const { valid, invalid } = validateSeals(parsedSeals);
            setSeals(valid);
            setInvalidSeals(invalid);
            setCurrentPage(1);
            // Show warning if there are invalid seals
            if (invalid.length > 0) {
                alert(`⚠️ ${invalid.length} código(s) inválido(s) foi/foram ignorado(s).\n\nValor mínimo: 10 dígitos numéricos.`);
            }
        }
        catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar o arquivo. Verifique o formato.');
            setSeals([]);
            setInvalidSeals([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [_jsx("header", { className: "bg-leve-blue text-white px-6 py-3 shadow-lg", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-4 mb-2", children: [_jsx("img", { src: LEVE_LOGO_WHITE_BASE64, alt: "LEV\u00C9 Mobilidade", style: {
                                        height: '76px',
                                        width: `${76 * LEVE_LOGO_WHITE_ASPECT_RATIO}px`,
                                    } }), _jsx("span", { className: "text-xl md:text-2xl font-bold tracking-tight", children: "- SETOR DE AUDITORIA" })] }), _jsx("p", { className: "text-gray-200 text-sm", children: "Ferramenta de gera\u00E7\u00E3o de selos." })] }) }), _jsx("main", { className: "max-w-7xl mx-auto p-6 gap-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 flex flex-col gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Upload do TXT" }), _jsx(UploadBox, { onFileUpload: handleFileUpload, isLoading: isLoading })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Configura\u00E7\u00F5es" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Conv\u00EAnio / Libera\u00E7\u00E3o" }), _jsx("input", { type: "text", value: convenio, onChange: (e) => setConvenio(e.target.value), placeholder: "ex: LIBERA\u00C7\u00C3O GER\u00CANCIA - LT12082026", className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue", disabled: isLoading }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Se preenchido, ser\u00E1 aplicado a todos os selos" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Tipo de C\u00F3digo" }), _jsxs("select", { value: barcodeType, onChange: (e) => setBarcodeType(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue", disabled: isLoading, children: [_jsx("option", { value: "numeric", children: "Num\u00E9rico" }), _jsx("option", { value: "code128", children: "Code 128" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Selos por p\u00E1gina" }), _jsxs("select", { value: sealsPerPage, onChange: (e) => setSealsPerPage(Number(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue", disabled: isLoading, children: [_jsx("option", { value: 6, children: "6 (3x2)" }), _jsx("option", { value: 12, children: "12 (4x3)" }), _jsx("option", { value: 22, children: "22 (11x2)" }), _jsx("option", { value: 24, children: "24 (12x2)" })] })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: showBorders, onChange: (e) => setShowBorders(e.target.checked), className: "w-4 h-4 text-leve-blue rounded focus:ring-2 focus:ring-leve-blue", disabled: isLoading }), _jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Visualizar bordas dos selos" })] })] })] }), seals.length > 0 && (_jsx("div", { className: "bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-semibold text-green-800", children: ["\u2713 ", seals.length, " selos carregados"] }), _jsx("p", { className: "text-xs text-green-700 mt-1", children: "Pronto para impress\u00E3o" })] })] }) }))] }), _jsxs("div", { className: "lg:col-span-3 flex flex-col gap-6", children: [seals.length > 0 && (_jsx(Toolbar, { seals: seals, zoom: zoom, onZoomChange: setZoom, showBorders: showBorders, onShowBordersChange: setShowBorders, barcodeType: barcodeType, onBarcodeTypeChange: setBarcodeType, sealsPerPage: sealsPerPage, onSealsPerPageChange: setSealsPerPage, convenio: convenio, onConvenioChange: setConvenio, isLoading: isLoading })), seals.length > 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Visualiza\u00E7\u00E3o" }), _jsx(SealGrid, { seals: seals, sealsPerPage: sealsPerPage, showBorders: showBorders, zoom: zoom, currentPage: currentPage, onPageChange: setCurrentPage })] })) : (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [_jsx("svg", { className: "w-16 h-16 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 font-semibold", children: "Nenhum arquivo carregado" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Carregue um arquivo TXT para come\u00E7ar" })] })] }) }))] })] }) }), _jsx("footer", { className: "bg-gray-800 text-gray-400 text-center py-4 mt-12", children: _jsx("p", { className: "text-sm", children: "Leve Mobilidade 2026 | Setor de Auditoria | Desenvolvido por Alex Lopes" }) })] }));
}
