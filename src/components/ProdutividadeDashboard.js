import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { PRODUTIVIDADE_CONFIG } from '../config/produtividade';
import { useSheetData } from '../hooks/useSheetData';
import { pad2 } from '../utils/audienciasSheet';
import { aggregate, applyFilters, buildProdExport, buildProdRows, EMPTY_FILTERS, filterOptions, hasActiveFilters, MONTH_NAMES, motivoColor, } from '../utils/produtividadeData';
import { buildXlsx, downloadXlsx } from '../utils/xlsxExport';
import MultiSelect from './MultiSelect';
import { KpiCard, PieChartCard, StackedBarsCard, StackedColumnsCard } from './ProdutividadeCharts';
const PAGE_SIZE = 100;
export default function ProdutividadeDashboard() {
    const { data, error, loading, refreshing, lastUpdated, configured, refresh } = useSheetData(PRODUTIVIDADE_CONFIG, PRODUTIVIDADE_CONFIG.refreshIntervalMs);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [limit, setLimit] = useState(PAGE_SIZE);
    const built = useMemo(() => (data ? buildProdRows(data, PRODUTIVIDADE_CONFIG) : null), [data]);
    const options = useMemo(() => filterOptions(built ? built.rows : []), [built]);
    const filtered = useMemo(() => (built ? applyFilters(built.rows, filters) : []), [built, filters]);
    // Colours follow the order of ALL motivos, so they don't change when filtering.
    const aggregates = useMemo(() => aggregate(filtered, options.motivos), [filtered, options.motivos]);
    const filtering = hasActiveFilters(filters);
    const updateFilters = (patch) => {
        setFilters((prev) => ({ ...prev, ...patch }));
        setLimit(PAGE_SIZE);
    };
    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setLimit(PAGE_SIZE);
    };
    // Exports the table exactly as filtered now: everything when no filter is active,
    // otherwise only the filtered rows (all of them, not just the ones loaded on screen).
    const handleExport = () => {
        if (!built || filtered.length === 0)
            return;
        try {
            const sheets = buildProdExport(built, filtered, filters);
            const today = new Date();
            const stamp = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
            downloadXlsx(buildXlsx(sheets), `produtividade${filtering ? '_filtrado' : ''}_${stamp}.xlsx`);
        }
        catch (err) {
            console.error('Erro ao exportar .xlsx:', err);
            alert('Não foi possível gerar o arquivo .xlsx.');
        }
    };
    const updatedText = lastUpdated
        ? `Atualizado às ${pad2(lastUpdated.getHours())}:${pad2(lastUpdated.getMinutes())}`
        : '';
    // Which of the four filter columns the sheet is missing (so the user knows what to configure).
    const missing = [];
    if (built) {
        if (!built.map.auditor)
            missing.push('AUDITOR');
        if (!built.map.motivo)
            missing.push('MOTIVO');
        if (options.months.length === 0)
            missing.push('MÊS');
        if (options.years.length === 0)
            missing.push('ANO');
    }
    const shownRows = filtered.slice(0, limit);
    // ------------------------------------------------------------------ render
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-6 pb-6", children: [_jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-800 mb-1", children: "Produtividade" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Indicadores do setor, direto da planilha", updatedText && _jsxs(_Fragment, { children: [" \u00B7 ", updatedText, " \u00B7 atualiza sozinho"] })] })] }), _jsxs("button", { onClick: refresh, disabled: !configured || refreshing, className: "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("svg", { className: `w-4 h-4 ${refreshing ? 'animate-spin' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), refreshing ? 'Atualizando...' : 'Atualizar'] })] }), !configured && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900", children: [_jsx("p", { className: "font-bold mb-1", children: "Falta ligar a dashboard \u00E0 planilha" }), _jsxs("p", { children: ["Preencha o ", _jsx("span", { className: "font-mono", children: "sheetId" }), " em", ' ', _jsx("span", { className: "font-mono", children: "src/config/produtividade.ts" }), "."] })] })), configured && loading && (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center text-gray-500", children: "Carregando dados da planilha..." })), configured && error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800 mb-6", children: [_jsx("p", { className: "font-bold mb-1", children: "N\u00E3o foi poss\u00EDvel ler a planilha" }), _jsx("p", { children: error }), _jsxs("ul", { className: "list-disc pl-5 mt-3 space-y-1 text-xs", children: [_jsxs("li", { children: ["O compartilhamento precisa estar como ", _jsx("b", { children: "Qualquer pessoa com o link: Leitor" }), "."] }), _jsxs("li", { children: ["Se a planilha for um arquivo do ", _jsx("b", { children: "Excel (.xlsx)" }), " aberto no Google Planilhas (aparece \".XLSX\" ao lado do nome), ela precisa ser convertida: ", _jsx("b", { children: "Arquivo \u2192 Salvar como Planilha Google" }), ". Depois, troque o ", _jsx("span", { className: "font-mono", children: "sheetId" }), " e o", ' ', _jsx("span", { className: "font-mono", children: "sheetGid" }), " em", ' ', _jsx("span", { className: "font-mono", children: "src/config/produtividade.ts" }), " pelos da nova planilha."] })] }), data && _jsx("p", { className: "mt-3 text-xs", children: "Exibindo os \u00FAltimos dados carregados." })] })), configured && data && built && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-5 mb-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(MultiSelect, { label: "Auditor", options: options.auditors.map((a) => ({ value: a, label: a })), selected: filters.auditors, onChange: (auditors) => updateFilters({ auditors }), disabled: !built.map.auditor }), _jsx(MultiSelect, { label: "Motivo", options: options.motivos.map((m) => ({ value: m, label: m })), selected: filters.motivos, onChange: (motivos) => updateFilters({ motivos }), disabled: !built.map.motivo }), _jsx(MultiSelect, { label: "M\u00EAs", options: options.months.map((m) => ({ value: m, label: MONTH_NAMES[m - 1] })), selected: filters.months, onChange: (months) => updateFilters({ months }), disabled: options.months.length === 0 }), _jsx(MultiSelect, { label: "Ano", options: options.years.map((y) => ({ value: y, label: String(y) })), selected: filters.years, onChange: (years) => updateFilters({ years }), disabled: options.years.length === 0 })] }), _jsxs("div", { className: "mt-4", children: [_jsx("label", { className: "block text-xs font-bold uppercase text-gray-500 mb-1", children: "Colaborador" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: filters.name, onChange: (e) => updateFilters({ name: e.target.value }), placeholder: "Buscar pelo nome do colaborador", className: `w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leve-blue ${filters.name.trim() !== '' ? 'border-leve-blue' : 'border-gray-300'}` }), filters.name !== '' && (_jsx("button", { type: "button", onClick: () => updateFilters({ name: '' }), "aria-label": "Limpar busca por nome", className: "absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }))] }), !built.map.name && (_jsxs("p", { className: "mt-1 text-xs text-amber-700", children: ["N\u00E3o encontrei a coluna do colaborador: a busca olha todas as colunas. Informe o nome dela em ", _jsx("span", { className: "font-mono", children: "nameColumn" }), " (src/config/produtividade.ts)."] }))] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 text-sm", children: [_jsxs("p", { className: "text-gray-500", children: ["Mostrando ", _jsx("b", { className: "text-gray-800", children: filtered.length.toLocaleString('pt-BR') }), " de", ' ', built.rows.length.toLocaleString('pt-BR'), " registros"] }), _jsxs("div", { className: "flex items-center gap-4", children: [filtering && (_jsx("button", { onClick: clearFilters, className: "font-semibold text-red-600 hover:text-red-800", children: "Limpar filtros" })), _jsxs("button", { onClick: handleExport, disabled: filtered.length === 0, title: filtering
                                                    ? `Exporta os ${filtered.length.toLocaleString('pt-BR')} registros filtrados`
                                                    : `Exporta todos os ${filtered.length.toLocaleString('pt-BR')} registros`, className: "flex items-center gap-2 px-4 py-2 bg-leve-blue text-white rounded-lg font-semibold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" }) }), "Exportar .xlsx"] })] })] }), missing.length > 0 && (_jsxs("p", { className: "mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3", children: ["N\u00E3o encontrei na planilha: ", _jsx("b", { children: missing.join(', ') }), ". Informe o nome (ou a letra) da coluna em ", _jsx("span", { className: "font-mono", children: "src/config/produtividade.ts" }), "."] }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 items-start", children: [_jsxs("section", { className: "lg:col-span-2 bg-white rounded-lg shadow-md lg:sticky lg:top-4", children: [_jsx("div", { className: "px-5 py-4 border-b border-gray-100", children: _jsxs("h2", { className: "text-lg font-bold text-gray-800", children: ["Registros", ' ', _jsxs("span", { className: "text-sm font-medium text-gray-400", children: ["(", filtered.length.toLocaleString('pt-BR'), ")"] })] }) }), filtered.length === 0 ? (_jsx("p", { className: "text-center text-sm text-gray-400 py-16", children: "Nenhum registro para os filtros selecionados." })) : (_jsxs("div", { className: "overflow-auto", style: { maxHeight: 'calc(100vh - 9rem)' }, children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "sticky top-0 bg-gray-50 z-10", children: _jsx("tr", { children: built.columns.map((column) => (_jsx("th", { className: "px-3 py-2 text-left text-xs font-bold uppercase text-gray-500 whitespace-nowrap border-b border-gray-200", children: column.label }, column.label))) }) }), _jsx("tbody", { children: shownRows.map((row) => (_jsx("tr", { className: "hover:bg-gray-50", children: built.columns.map((column) => {
                                                                const text = row.cells[column.label] ?? '';
                                                                const isMotivo = built.map.motivo === column;
                                                                return (_jsx("td", { className: "px-3 py-2 border-b border-gray-100 text-gray-800 align-top", children: isMotivo && text !== '' ? (_jsxs("span", { className: "flex items-center gap-2 whitespace-nowrap", children: [_jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0", style: { backgroundColor: motivoColor(options.motivos, row.motivo) } }), text] })) : (text) }, column.label));
                                                            }) }, row.id))) })] }), filtered.length > limit && (_jsxs("div", { className: "flex items-center justify-center gap-4 py-4 text-sm", children: [_jsxs("span", { className: "text-gray-500", children: [limit.toLocaleString('pt-BR'), " de ", filtered.length.toLocaleString('pt-BR')] }), _jsx("button", { onClick: () => setLimit((l) => l + PAGE_SIZE), className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700", children: "Mostrar mais" }), _jsx("button", { onClick: () => setLimit(filtered.length), className: "font-semibold text-leve-blue hover:text-blue-900", children: "Mostrar todos" })] }))] }))] }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(KpiCard, { title: filtering ? 'TOTAL DE JUSTAS NO FILTRO' : 'TOTAL GERAL DE JUSTAS DO SETOR', value: aggregates.total }), _jsx(PieChartCard, { title: "DISTRIBUI\u00C7\u00C3O POR AL\u00CDNEA", data: aggregates.byMotivo, order: options.motivos }), _jsx(StackedColumnsCard, { title: "DISTRIBUI\u00C7\u00C3O - ANO x AL\u00CDNEA", groups: aggregates.byYear, order: options.motivos }), _jsx(StackedBarsCard, { title: "DISTRIBUI\u00C7\u00C3O POR AUDITOR", groups: aggregates.byAuditor, order: options.motivos })] })] })] }))] }));
}
