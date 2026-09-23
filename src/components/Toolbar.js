import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { generatePdf } from '../utils/generatePdf';
export const Toolbar = ({ seals, zoom, onZoomChange, showBorders, onShowBordersChange, barcodeType, onBarcodeTypeChange, sealsPerPage, onSealsPerPageChange, convenio = '', onConvenioChange, isLoading = false, }) => {
    const handleExportPdf = async () => {
        if (seals.length === 0) {
            alert('Nenhum selo para exportar');
            return;
        }
        try {
            await generatePdf(seals, {
                sealsPerPage,
                showBorders,
                barcodeType,
            });
        }
        catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF');
        }
    };
    return (_jsxs("div", { className: "bg-leve-blue text-white p-6 rounded-xl shadow-md", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-[15px] font-semibold", children: "Zoom" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => onZoomChange(Math.max(50, zoom - 10)), className: "w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none", disabled: isLoading, children: "\u2212" }), _jsxs("span", { className: "text-base font-medium w-12 text-center", children: [zoom, "%"] }), _jsx("button", { onClick: () => onZoomChange(Math.min(200, zoom + 10)), className: "w-9 h-9 flex items-center justify-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-lg leading-none", disabled: isLoading, children: "+" })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-[15px] font-semibold", children: "Tipo de C\u00F3digo" }), _jsxs("select", { value: barcodeType, onChange: (e) => onBarcodeTypeChange(e.target.value), className: "px-4 py-2.5 rounded-lg text-gray-800 text-sm", disabled: isLoading, children: [_jsx("option", { value: "numeric", children: "Num\u00E9rico" }), _jsx("option", { value: "code128", children: "Code 128" })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-[15px] font-semibold", children: "Selos por p\u00E1gina" }), _jsxs("select", { value: sealsPerPage, onChange: (e) => onSealsPerPageChange(Number(e.target.value)), className: "px-4 py-2.5 rounded-lg text-gray-800 text-sm", disabled: isLoading, children: [_jsx("option", { value: 6, children: "6 (3x2)" }), _jsx("option", { value: 12, children: "12 (4x3)" }), _jsx("option", { value: 22, children: "22 (11x2)" }), _jsx("option", { value: 24, children: "24 (12x2)" })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-[15px] font-semibold", children: "Borda" }), _jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer h-[42px]", children: [_jsx("input", { type: "checkbox", checked: showBorders, onChange: (e) => onShowBordersChange(e.target.checked), className: "w-5 h-5 rounded accent-blue-600 cursor-pointer", disabled: isLoading }), _jsx("span", { className: "text-sm", children: "Mostrar bordas" })] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white border-opacity-20", children: [_jsx("div", { className: "text-sm", children: seals.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "font-semibold", children: ["\u2713 ", seals.length, " selos carregados com sucesso!"] }), _jsx("span", { className: "ml-2 opacity-80", children: "Pronto para impress\u00E3o." })] })) }), _jsxs("button", { onClick: handleExportPdf, disabled: seals.length === 0 || isLoading, className: "flex items-center gap-2 px-5 py-3 bg-white text-leve-blue font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) }), "Exportar PDF"] })] })] }));
};
