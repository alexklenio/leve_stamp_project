import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UploadBox } from './UploadBox';
import { SealGrid } from './SealGrid';
import { Toolbar } from './Toolbar';
import { parseTxt, validateSeals } from '../utils/parseTxt';
export default function SealGeneratorTool({ onBack }) {
    const [seals, setSeals] = useState([]);
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
            let parsedSeals = parseTxt(content);
            if (convenio && parsedSeals.length > 0) {
                parsedSeals = parsedSeals.map(seal => ({
                    ...seal,
                    convenio: seal.convenio || convenio,
                }));
            }
            const { valid, invalid } = validateSeals(parsedSeals);
            setSeals(valid);
            setCurrentPage(1);
            if (invalid.length > 0) {
                alert(`⚠️ ${invalid.length} código(s) inválido(s) foi/foram ignorado(s).\n\nValor mínimo: 10 dígitos numéricos.`);
            }
        }
        catch (error) {
            console.error('Erro ao processar arquivo:', error);
            alert('Erro ao processar o arquivo. Verifique o formato.');
            setSeals([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Voltar ao Dashboard"] }), _jsx("span", { className: "text-gray-300", children: "|" }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: "Gerador de Selos" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 flex flex-col gap-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-4", children: "Conv\u00EAnio / Libera\u00E7\u00E3o" }), _jsx("input", { type: "text", value: convenio, onChange: (e) => setConvenio(e.target.value), placeholder: "ex: LIBERA\u00C7\u00C3O GER\u00CANCIA - LT12082026", className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue", disabled: isLoading }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Preencha antes de carregar o TXT \u2014 ser\u00E1 aplicado a todos os selos" })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Upload do TXT" }), _jsx(UploadBox, { onFileUpload: handleFileUpload, isLoading: isLoading })] }), seals.length > 0 && (_jsx("div", { className: "bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-semibold text-green-800", children: ["\u2713 ", seals.length, " selos carregados"] }), _jsx("p", { className: "text-xs text-green-700 mt-1", children: "Pronto para impress\u00E3o" })] })] }) }))] }), _jsxs("div", { className: "lg:col-span-3 flex flex-col gap-6", children: [seals.length > 0 && (_jsx(Toolbar, { seals: seals, zoom: zoom, onZoomChange: setZoom, showBorders: showBorders, onShowBordersChange: setShowBorders, barcodeType: barcodeType, onBarcodeTypeChange: setBarcodeType, sealsPerPage: sealsPerPage, onSealsPerPageChange: setSealsPerPage, isLoading: isLoading })), seals.length > 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-4", children: "Visualiza\u00E7\u00E3o" }), _jsx(SealGrid, { seals: seals, sealsPerPage: sealsPerPage, showBorders: showBorders, zoom: zoom, currentPage: currentPage, onPageChange: setCurrentPage, barcodeType: barcodeType })] })) : (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: _jsxs("div", { className: "flex flex-col items-center justify-center gap-4", children: [_jsx("svg", { className: "w-16 h-16 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500 font-semibold", children: "Nenhum arquivo carregado" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Carregue um arquivo TXT para come\u00E7ar" })] })] }) }))] })] })] }));
}
