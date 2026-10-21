import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { AUDIENCIAS_CONFIG } from '../config/audiencias';
import { useAudiencias } from '../hooks/useAudiencias';
import { buildCompromissos, detectColumns, displayLabel, distinctValues, formatForSheet, inputKindFor, normalize, refMatches, situationValues, submitCompromisso, } from '../utils/audienciasSheet';
const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue';
const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
export default function NovoCompromissoForm({ onBack }) {
    const { data, error, loading, configured, refresh } = useAudiencias();
    const [values, setValues] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [saved, setSaved] = useState(false);
    // For processes that still have no hearing date ("AG AUDIÊNCIA", "AG SENTENÇA"...).
    const [situacao, setSituacao] = useState('');
    const columns = useMemo(() => (data ? data.columns : []), [data]);
    const map = useMemo(() => detectColumns(columns, AUDIENCIAS_CONFIG), [columns]);
    // The form mirrors the sheet: one field per column, except the ones excluded in the config
    // (listed by header name or column letter).
    const formColumns = useMemo(() => columns.filter((c) => !AUDIENCIAS_CONFIG.formExcludedColumns.some((ref) => refMatches(c, ref))), [columns]);
    const situations = useMemo(() => (data ? situationValues(data, map) : []), [data, map]);
    const suggestions = useMemo(() => {
        const result = {};
        if (!data)
            return result;
        formColumns.forEach((c) => {
            if (c.type === 'string' && inputKindFor(c, map) === 'text') {
                const list = distinctValues(data, c.label);
                if (list.length > 0)
                    result[c.label] = list;
            }
        });
        return result;
    }, [data, formColumns, map]);
    // How many rows exist today — shown after saving, to confirm the new one appeared.
    const totalRows = useMemo(() => (data ? buildCompromissos(data, AUDIENCIAS_CONFIG).compromissos.length : 0), [data]);
    const setValue = (label, value) => setValues((prev) => ({ ...prev, [label]: value }));
    const isDirty = situacao !== '' || Object.values(values).some((v) => v !== '');
    const handleClear = () => {
        if (window.confirm('Limpar todos os campos? Essa ação não pode ser desfeita.')) {
            setValues({});
            setSituacao('');
            setSubmitError(null);
        }
    };
    const dateColumn = map.dateCol;
    const timeColumn = map.timeCol;
    const dateMissing = dateColumn !== null && situacao === '' && (values[dateColumn.label] ?? '') === '';
    const handleSituacaoChange = (value) => {
        setSituacao(value);
        if (value !== '') {
            // A situation takes the place of the date and time.
            setValues((prev) => {
                const next = { ...prev };
                if (dateColumn)
                    next[dateColumn.label] = '';
                if (timeColumn)
                    next[timeColumn.label] = '';
                return next;
            });
        }
    };
    const handleSubmit = async () => {
        if (dateMissing) {
            setSubmitError(situations.length > 0
                ? `Informe a data (${displayLabel(dateColumn ? dateColumn.label : 'data')}) ou escolha uma situação antes de registrar.`
                : `Preencha o campo "${displayLabel(dateColumn ? dateColumn.label : 'data')}" antes de registrar.`);
            return;
        }
        const payload = {};
        formColumns.forEach((col) => {
            const raw = values[col.label] ?? '';
            if (raw !== '')
                payload[col.label] = formatForSheet(col, inputKindFor(col, map), raw);
        });
        // Same pattern the sheet already uses: the situation goes in the date AND time columns.
        if (situacao !== '' && dateColumn) {
            payload[dateColumn.label] = situacao;
            if (timeColumn)
                payload[timeColumn.label] = situacao;
        }
        if (Object.keys(payload).length === 0) {
            setSubmitError('Preencha pelo menos um campo.');
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        try {
            await submitCompromisso(AUDIENCIAS_CONFIG, payload, columns);
            setSaved(true);
            setValues({});
            setSituacao('');
            refresh(); // read the sheet again so the agenda already shows the new row
        }
        catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Não foi possível registrar o compromisso.');
        }
        finally {
            setSubmitting(false);
        }
    };
    // ------------------------------------------------------------------ render
    return (_jsxs("div", { className: "max-w-3xl mx-auto px-6 pb-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsxs("button", { onClick: onBack, className: "flex items-center gap-1.5 text-leve-blue hover:text-blue-900 font-semibold text-sm", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), "Voltar para a agenda"] }), _jsx("span", { className: "text-gray-300", children: "|" }), _jsx("h1", { className: "text-lg font-bold text-gray-800", children: "Novo compromisso" }), isDirty && !saved && (_jsx("button", { onClick: handleClear, className: "ml-auto text-sm font-semibold text-red-600 hover:text-red-800", children: "Limpar" }))] }), !configured && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900", children: ["Ligue a dashboard \u00E0 planilha em ", _jsx("span", { className: "font-mono", children: "src/config/audiencias.ts" }), ' ', "antes de registrar compromissos (veja ", _jsx("span", { className: "font-mono", children: "AUDIENCIAS_SETUP.md" }), ")."] })), configured && loading && (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center text-gray-500", children: "Carregando as colunas da planilha..." })), configured && !data && error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800", children: [_jsx("p", { className: "font-bold mb-1", children: "N\u00E3o foi poss\u00EDvel ler a planilha" }), _jsx("p", { children: error }), _jsx("button", { onClick: refresh, className: "mt-3 font-semibold underline", children: "Tentar novamente" })] })), configured && data && saved && (_jsxs("div", { className: "bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6", children: [_jsx("h2", { className: "text-lg font-bold text-green-800 mb-1", children: "\u2713 Compromisso registrado na planilha" }), _jsxs("p", { className: "text-sm text-green-700 mb-4", children: ["A agenda j\u00E1 foi atualizada (", totalRows, " compromissos com data na planilha)."] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { onClick: onBack, className: "px-4 py-2 bg-leve-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-900", children: "Ver a agenda" }), _jsx("button", { onClick: () => setSaved(false), className: "px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50", children: "Registrar outro" })] })] })), configured && data && !saved && (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-1", children: "Dados do compromisso" }), _jsx("p", { className: "text-xs text-gray-500 mb-5", children: "Os campos seguem as colunas da planilha. Ao registrar, uma nova linha \u00E9 adicionada ao final dela." }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [dateColumn && situations.length > 0 && (_jsxs("div", { className: "sm:col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4", children: [_jsx("label", { className: labelClass, children: "Situa\u00E7\u00E3o (quando ainda n\u00E3o h\u00E1 data de audi\u00EAncia)" }), _jsxs("select", { value: situacao, onChange: (e) => handleSituacaoChange(e.target.value), className: inputClass, children: [_jsx("option", { value: "", children: "Tem data marcada" }), situations.map((option) => (_jsx("option", { value: option, children: option }, option)))] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Ao escolher uma situa\u00E7\u00E3o, ela \u00E9 gravada nas colunas de data e de hora, como j\u00E1 \u00E9 feito na planilha." })] })), formColumns.map((col) => {
                                const kind = inputKindFor(col, map);
                                const value = values[col.label] ?? '';
                                const isDate = dateColumn !== null && col === dateColumn;
                                const isTime = timeColumn !== null && col === timeColumn;
                                const lockedBySituation = situacao !== '' && (isDate || isTime);
                                const listId = `sugestoes-${normalize(col.label).replace(/[^a-z0-9]+/g, '-')}`;
                                if (kind === 'checkbox') {
                                    return (_jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer sm:col-span-2", children: [_jsx("input", { type: "checkbox", checked: value === 'true', onChange: (e) => setValue(col.label, e.target.checked ? 'true' : ''), className: "w-5 h-5 rounded accent-blue-600 cursor-pointer" }), _jsx("span", { className: "text-sm font-semibold text-gray-700", children: displayLabel(col.label) })] }, col.label));
                                }
                                return (_jsxs("div", { className: kind === 'textarea' ? 'sm:col-span-2' : '', children: [_jsxs("label", { className: labelClass, children: [displayLabel(col.label), " ", isDate && _jsx("span", { className: "text-red-500", children: "*" })] }), kind === 'textarea' ? (_jsx("textarea", { value: value, onChange: (e) => setValue(col.label, e.target.value), rows: 3, className: `${inputClass} resize-y` })) : (_jsx("input", { type: kind === 'datetime' ? 'datetime-local' : kind === 'number' ? 'text' : kind, inputMode: kind === 'number' ? 'decimal' : undefined, value: value, onChange: (e) => setValue(col.label, e.target.value), list: suggestions[col.label] ? listId : undefined, disabled: lockedBySituation, className: `${inputClass} disabled:bg-gray-100 disabled:text-gray-400` })), suggestions[col.label] && (_jsx("datalist", { id: listId, children: suggestions[col.label].map((option) => (_jsx("option", { value: option }, option))) }))] }, col.label));
                            })] }), !AUDIENCIAS_CONFIG.scriptUrl.trim() && (_jsxs("p", { className: "mt-5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3", children: ["A grava\u00E7\u00E3o ainda n\u00E3o est\u00E1 ligada: falta preencher ", _jsx("span", { className: "font-mono", children: "scriptUrl" }), " em", ' ', _jsx("span", { className: "font-mono", children: "src/config/audiencias.ts" }), " (veja", ' ', _jsx("span", { className: "font-mono", children: "AUDIENCIAS_SETUP.md" }), ")."] })), submitError && (_jsx("p", { className: "mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3", children: submitError })), _jsxs("div", { className: "mt-6 flex items-center justify-end gap-3", children: [_jsx("button", { onClick: onBack, className: "px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: submitting, className: "px-5 py-3 bg-leve-blue text-white font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed", children: submitting ? 'Registrando...' : 'Registrar compromisso' })] })] }))] }));
}
