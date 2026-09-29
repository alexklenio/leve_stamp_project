import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Seal } from './Seal';
export const SealGrid = ({ seals, sealsPerPage = 22, showBorders = true, zoom = 100, currentPage = 1, onPageChange, }) => {
    const totalPages = Math.ceil(seals.length / sealsPerPage);
    const startIndex = (currentPage - 1) * sealsPerPage;
    const endIndex = startIndex + sealsPerPage;
    const currentSeals = seals.slice(startIndex, endIndex);
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange?.(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm", style: { height: '70vh', overflow: 'hidden' }, children: _jsx("div", { className: "w-full h-full overflow-auto", children: _jsx("div", { className: "p-8", style: {
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                            width: 'fit-content',
                        }, children: _jsx("div", { className: "grid grid-cols-2 gap-4 w-fit", children: currentSeals.map((seal) => (_jsx("div", { className: "flex justify-center", children: _jsx(Seal, { seal: seal, showBorders: showBorders }) }, seal.id))) }) }) }) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-4", children: [_jsx("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: "px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300", children: "Anterior" }), _jsxs("span", { className: "text-sm text-gray-600 font-semibold", children: ["P\u00E1gina ", currentPage, " de ", totalPages] }), _jsx("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages, className: "px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300", children: "Pr\u00F3xima" })] })), _jsxs("div", { className: "text-center text-sm text-gray-600", children: ["Exibindo ", startIndex + 1, " a ", Math.min(endIndex, seals.length), " de ", seals.length, " selos"] })] }));
};
