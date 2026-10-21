import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { AUDIENCIAS_CONFIG } from '../config/audiencias';
import { useAudiencias } from '../hooks/useAudiencias';
import { addDays, buildCompromissos, dayKey, displayLabel, formatDayLong, formatMinutes, isSameDay, normalize, pad2, relativeDayLabel, startOfDay, } from '../utils/audienciasSheet';
// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
function badgeClass(badge) {
    const key = normalize(badge);
    if (key === 'online')
        return 'bg-blue-100 text-blue-800';
    if (key === 'presencial')
        return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-700';
}
function CompromissoCard({ item, status }) {
    const [expanded, setExpanded] = useState(false);
    const visibleDetails = expanded ? item.details : item.details.slice(0, 4);
    const hiddenCount = item.details.length - 4;
    return (_jsxs("div", { className: `flex gap-4 bg-white rounded-lg shadow-md p-4 border ${status === 'proximo' ? 'border-leve-blue ring-1 ring-leve-blue' : 'border-gray-100'} ${status === 'passou' ? 'opacity-60' : ''}`, children: [_jsxs("div", { className: "flex-shrink-0 w-20 text-center", children: [_jsx("div", { className: `rounded-lg py-2 ${item.minutes !== null ? 'bg-leve-blue text-white' : 'bg-gray-100 text-gray-500'}`, children: _jsx("span", { className: "text-lg font-bold leading-none", children: item.minutes !== null ? formatMinutes(item.minutes) : '—' }) }), item.minutes === null && _jsx("p", { className: "text-[10px] text-gray-400 mt-1", children: "Sem hor\u00E1rio" })] }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: "font-bold text-gray-800 break-words", children: item.title }), status === 'proximo' && (_jsx("span", { className: "flex-shrink-0 text-[10px] font-bold uppercase bg-leve-blue text-white rounded px-2 py-0.5", children: "Pr\u00F3ximo" })), status === 'passou' && (_jsx("span", { className: "flex-shrink-0 text-[10px] font-bold uppercase bg-gray-200 text-gray-600 rounded px-2 py-0.5", children: "J\u00E1 passou" }))] }), item.subtitle && _jsx("p", { className: "text-sm text-gray-600 break-words", children: item.subtitle }), item.badges.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: item.badges.map((badge) => (_jsx("span", { className: `text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${badgeClass(badge)}`, children: badge }, badge))) })), visibleDetails.length > 0 && (_jsx("dl", { className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs", children: visibleDetails.map((detail) => (_jsxs("div", { className: "min-w-0", children: [_jsxs("dt", { className: "inline text-gray-500", children: [displayLabel(detail.label), ": "] }), _jsx("dd", { className: "inline text-gray-800 font-medium break-words", children: detail.value })] }, detail.label))) })), hiddenCount > 0 && (_jsx("button", { onClick: () => setExpanded((e) => !e), className: "mt-2 text-xs font-semibold text-leve-blue hover:text-blue-900", children: expanded ? 'Mostrar menos' : `Mais detalhes (${hiddenCount})` }))] })] }));
}
// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function AudienciasDashboard({ onNew }) {
    const { data, error, loading, refreshing, lastUpdated, configured, refresh } = useAudiencias();
    // "now" is re-evaluated every 30s so the "next / already passed" marks stay right.
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 30000);
        return () => window.clearInterval(id);
    }, []);
    const [range, setRange] = useState(0);
    const [search, setSearch] = useState('');
    const built = useMemo(() => (data ? buildCompromissos(data, AUDIENCIAS_CONFIG) : null), [data]);
    const today = startOfDay(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const compromissos = built ? built.compromissos : [];
    const todayItems = compromissos.filter((c) => isSameDay(c.date, today));
    const futureAll = compromissos.filter((c) => c.date.getTime() > today.getTime());
    const next7 = futureAll.filter((c) => c.date.getTime() <= addDays(today, 7).getTime());
    const searchTerm = normalize(search);
    const futureShown = futureAll.filter((c) => {
        if (range !== 0 && c.date.getTime() > addDays(today, range).getTime())
            return false;
        if (searchTerm !== '' && !c.searchText.includes(searchTerm))
            return false;
        return true;
    });
    // Group the upcoming ones by day (already sorted by date/time).
    const groups = [];
    futureShown.forEach((item) => {
        const key = dayKey(item.date);
        const last = groups[groups.length - 1];
        if (last && last.key === key)
            last.items.push(item);
        else
            groups.push({ key, date: item.date, items: [item] });
    });
    const nextTodayIndex = todayItems.findIndex((c) => c.minutes !== null && c.minutes >= nowMinutes);
    const statusFor = (item, index) => {
        if (item.minutes !== null && item.minutes < nowMinutes)
            return 'passou';
        if (index === nextTodayIndex)
            return 'proximo';
        return 'normal';
    };
    const updatedText = lastUpdated
        ? `Atualizado às ${pad2(lastUpdated.getHours())}:${pad2(lastUpdated.getMinutes())}`
        : '';
    // ------------------------------------------------------------------ render
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-6 pb-6", children: [_jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-800 mb-1", children: "Audi\u00EAncias e Compromissos" }), _jsxs("p", { className: "text-sm text-gray-500", children: [formatDayLong(now), updatedText && _jsxs(_Fragment, { children: [" \u00B7 ", updatedText, " \u00B7 atualiza sozinho"] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: refresh, disabled: !configured || refreshing, className: "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx("svg", { className: `w-4 h-4 ${refreshing ? 'animate-spin' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), refreshing ? 'Atualizando...' : 'Atualizar'] }), _jsxs("button", { onClick: onNew, className: "flex items-center gap-2 px-4 py-2 bg-leve-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-900", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }), "Novo compromisso"] })] })] }), !configured && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-6 text-sm text-amber-900", children: [_jsx("p", { className: "font-bold mb-1", children: "Falta ligar a dashboard \u00E0 planilha" }), _jsxs("p", { children: ["Abra o arquivo ", _jsx("span", { className: "font-mono", children: "src/config/audiencias.ts" }), " e preencha o", ' ', _jsx("span", { className: "font-mono", children: "sheetId" }), " (e a aba). O passo a passo est\u00E1 no arquivo", ' ', _jsx("span", { className: "font-mono", children: "AUDIENCIAS_SETUP.md" }), "."] })] })), configured && loading && (_jsx("div", { className: "bg-white rounded-lg shadow-md p-12 text-center text-gray-500", children: "Carregando compromissos..." })), configured && error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-800 mb-6", children: [_jsx("p", { className: "font-bold mb-1", children: "N\u00E3o foi poss\u00EDvel atualizar os compromissos" }), _jsx("p", { children: error }), data && _jsx("p", { className: "mt-2 text-xs", children: "Exibindo os \u00FAltimos dados carregados." })] })), configured && data && built && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-md p-5 border-l-4 border-leve-blue", children: [_jsx("p", { className: "text-xs font-semibold uppercase text-gray-500", children: "Hoje" }), _jsx("p", { className: "text-3xl font-bold text-gray-800", children: todayItems.length })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-300", children: [_jsx("p", { className: "text-xs font-semibold uppercase text-gray-500", children: "Pr\u00F3ximos 7 dias" }), _jsx("p", { className: "text-3xl font-bold text-gray-800", children: next7.length })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-5 border-l-4 border-gray-300", children: [_jsx("p", { className: "text-xs font-semibold uppercase text-gray-500", children: "Total futuros" }), _jsx("p", { className: "text-3xl font-bold text-gray-800", children: futureAll.length })] })] }), !built.map.dateCol && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 mb-6", children: ["N\u00E3o encontrei uma coluna de data na planilha. Informe o nome dela em", ' ', _jsx("span", { className: "font-mono", children: "dateColumn" }), " no arquivo", ' ', _jsx("span", { className: "font-mono", children: "src/config/audiencias.ts" }), "."] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", children: [_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-bold text-gray-800 mb-1", children: "Hoje" }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: formatDayLong(today) }), todayItems.length === 0 ? (_jsx("div", { className: "bg-white rounded-lg shadow-md p-8 text-center text-gray-500 text-sm", children: "Nenhum compromisso para hoje." })) : (_jsx("div", { className: "flex flex-col gap-3", children: todayItems.map((item, index) => (_jsx(CompromissoCard, { item: item, status: statusFor(item, index) }, item.id))) }))] }), _jsxs("section", { children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4", children: [_jsx("h2", { className: "text-lg font-bold text-gray-800", children: "Pr\u00F3ximos compromissos" }), _jsx("div", { className: "flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1", children: [7, 30, 0].map((option) => (_jsx("button", { onClick: () => setRange(option), className: `px-3 py-1 rounded-md text-xs font-semibold ${range === option
                                                        ? 'bg-leve-blue text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'}`, children: option === 0 ? 'Todos' : `${option} dias` }, option))) })] }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-leve-blue", placeholder: "Buscar nos pr\u00F3ximos compromissos", "aria-label": "Buscar nos pr\u00F3ximos compromissos" }), groups.length === 0 ? (_jsx("div", { className: "bg-white rounded-lg shadow-md p-8 text-center text-gray-500 text-sm", children: futureAll.length === 0
                                            ? 'Nenhum compromisso futuro registrado.'
                                            : 'Nenhum compromisso encontrado com esses filtros.' })) : (_jsx("div", { className: "flex flex-col gap-6", children: groups.map((group) => (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h3", { className: "text-sm font-bold text-gray-700", children: formatDayLong(group.date) }), relativeDayLabel(group.date, today) && (_jsx("span", { className: "text-[10px] font-bold uppercase bg-blue-100 text-leve-blue rounded px-2 py-0.5", children: relativeDayLabel(group.date, today) })), _jsxs("span", { className: "text-xs text-gray-400", children: [group.items.length, " ", group.items.length === 1 ? 'compromisso' : 'compromissos'] })] }), _jsx("div", { className: "flex flex-col gap-3", children: group.items.map((item) => (_jsx(CompromissoCard, { item: item, status: "normal" }, item.id))) })] }, group.key))) }))] })] }), built.ignored > 0 && (_jsxs("div", { className: "mt-8 text-xs text-gray-500", children: [_jsxs("p", { className: "font-semibold text-gray-600 mb-1", children: ["Processos sem audi\u00EAncia marcada (", built.ignored, ")"] }), _jsx("p", { children: built.pending.map((group) => `${group.label}: ${group.count}`).join(' · ') })] }))] }))] }));
}
