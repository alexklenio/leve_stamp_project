import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
/** Dropdown with checkboxes. Nothing selected = "Todos" (no filtering). */
export default function MultiSelect({ label, options, selected, onChange, disabled = false, }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    // Close when clicking outside or pressing Escape.
    useEffect(() => {
        if (!open)
            return undefined;
        const onPointerDown = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target))
                setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);
    const toggle = (value) => {
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };
    let summary = 'Todos';
    if (selected.length === 1) {
        summary = options.find((o) => o.value === selected[0])?.label ?? String(selected[0]);
    }
    else if (selected.length > 1) {
        summary = `${selected.length} selecionados`;
    }
    return (_jsxs("div", { ref: wrapperRef, className: "relative", children: [_jsx("label", { className: "block text-xs font-bold uppercase text-gray-500 mb-1", children: label }), _jsxs("button", { type: "button", disabled: disabled, onClick: () => setOpen((o) => !o), "aria-haspopup": "listbox", "aria-expanded": open, className: `w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-lg text-sm bg-white text-left disabled:opacity-50 disabled:cursor-not-allowed ${selected.length > 0 ? 'border-leve-blue text-leve-blue font-semibold' : 'border-gray-300 text-gray-700'}`, children: [_jsx("span", { className: "truncate", children: summary }), _jsx("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), open && (_jsxs("div", { className: "absolute z-20 mt-1 w-full min-w-[12rem] bg-white border border-gray-200 rounded-lg shadow-lg", children: [_jsxs("ul", { className: "max-h-60 overflow-y-auto py-1", children: [options.length === 0 && (_jsx("li", { className: "px-3 py-2 text-sm text-gray-400", children: "Nenhuma op\u00E7\u00E3o" })), options.map((option) => (_jsx("li", { children: _jsxs("label", { className: "flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: selected.includes(option.value), onChange: () => toggle(option.value), className: "w-4 h-4 rounded accent-blue-600 cursor-pointer" }), _jsx("span", { className: "break-words", children: option.label })] }) }, String(option.value))))] }), selected.length > 0 && (_jsx("button", { type: "button", onClick: () => onChange([]), className: "w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border-t border-gray-100 rounded-b-lg", children: "Limpar sele\u00E7\u00E3o" }))] }))] }));
}
