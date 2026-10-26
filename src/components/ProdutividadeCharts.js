import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motivoColor, niceScale } from '../utils/produtividadeData';
// All charts are plain SVG (no chart library), drawn from the already filtered data.
// Colours come from the GLOBAL motivo order, so a motivo keeps its colour whatever the filters.
const GRID = '#E0E0E0';
const AXIS_TEXT = '#5F6368';
function ChartCard({ title, children }) {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md p-5", children: [_jsx("h3", { className: "text-center text-gray-500 text-base md:text-lg font-medium mb-3", children: title }), children] }));
}
function NoData() {
    return _jsx("p", { className: "text-center text-sm text-gray-400 py-10", children: "Sem dados para os filtros selecionados." });
}
function Legend({ order }) {
    return (_jsx("div", { className: "flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-gray-700 mb-2", children: order.map((label) => (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-sm", style: { backgroundColor: motivoColor(order, label) } }), label] }, label))) }));
}
function shorten(text, max) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------
export function KpiCard({ title, value }) {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow-md overflow-hidden", children: [_jsx("div", { className: "px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wide text-white", style: { backgroundColor: '#4285F4' }, children: title }), _jsx("p", { className: "text-center text-6xl font-light text-gray-900 py-5 leading-none", children: value.toLocaleString('pt-BR') })] }));
}
// ---------------------------------------------------------------------------
// Pie
// ---------------------------------------------------------------------------
function slicePath(cx, cy, r, a0, a1) {
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}
export function PieChartCard({ title, data, order, }) {
    const slices = data.filter((d) => d.count > 0);
    const total = slices.reduce((sum, d) => sum + d.count, 0);
    const cx = 100;
    const cy = 100;
    const r = 92;
    let angle = -Math.PI / 2;
    const paths = slices.map((d) => {
        const start = angle;
        angle += (d.count / total) * 2 * Math.PI;
        return { ...d, start, end: angle, percent: Math.round((d.count / total) * 100) };
    });
    return (_jsx(ChartCard, { title: title, children: total === 0 ? (_jsx(NoData, {})) : (_jsxs(_Fragment, { children: [_jsx("svg", { viewBox: "0 0 200 200", width: "190", height: "190", className: "mx-auto block", role: "img", "aria-label": title, children: paths.length === 1 ? (_jsx("circle", { cx: cx, cy: cy, r: r, fill: motivoColor(order, paths[0].label), children: _jsx("title", { children: `${paths[0].label}: ${paths[0].count} (100%)` }) })) : (paths.map((p) => (_jsx("path", { d: slicePath(cx, cy, r, p.start, p.end), fill: motivoColor(order, p.label), stroke: "#FFFFFF", strokeWidth: "1", children: _jsx("title", { children: `${p.label}: ${p.count} (${p.percent}%)` }) }, p.label)))) }), _jsx("ul", { className: "mt-3 flex flex-col gap-1 text-xs text-gray-700", children: paths.map((p) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0", style: { backgroundColor: motivoColor(order, p.label) } }), _jsx("span", { className: "flex-1 min-w-0 break-words", children: p.label }), _jsx("span", { className: "font-semibold", children: p.count.toLocaleString('pt-BR') }), _jsxs("span", { className: "text-gray-400 w-10 text-right", children: [p.percent, "%"] })] }, p.label))) })] })) }));
}
// ---------------------------------------------------------------------------
// Stacked columns (e.g. year x motivo)
// ---------------------------------------------------------------------------
export function StackedColumnsCard({ title, groups, order, }) {
    const W = 400;
    const H = 270;
    const left = 34;
    const right = 10;
    const top = 12;
    const bottom = 28;
    const plotW = W - left - right;
    const plotH = H - top - bottom;
    const max = Math.max(0, ...groups.map((g) => g.total));
    const scale = niceScale(max);
    const ticks = [];
    for (let v = 0; v <= scale.top; v += scale.step)
        ticks.push(v);
    const band = plotW / Math.max(groups.length, 1);
    const barW = Math.min(band * 0.62, 56);
    const yOf = (value) => top + plotH - (value / scale.top) * plotH;
    return (_jsx(ChartCard, { title: title, children: groups.length === 0 ? (_jsx(NoData, {})) : (_jsxs(_Fragment, { children: [_jsx(Legend, { order: order }), _jsxs("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": title, children: [ticks.map((v) => (_jsxs("g", { children: [_jsx("line", { x1: left, x2: W - right, y1: yOf(v), y2: yOf(v), stroke: GRID, strokeWidth: "1" }), _jsx("text", { x: left - 6, y: yOf(v) + 4, textAnchor: "end", fontSize: "11", fill: AXIS_TEXT, children: v })] }, v))), groups.map((g, i) => {
                            const x = left + band * i + (band - barW) / 2;
                            let acc = 0;
                            return (_jsxs("g", { children: [order.map((motivo) => {
                                        const seg = g.segments.find((s) => s.label === motivo);
                                        if (!seg || seg.count === 0)
                                            return null;
                                        const y0 = yOf(acc + seg.count);
                                        const h = (seg.count / scale.top) * plotH;
                                        acc += seg.count;
                                        return (_jsxs("g", { children: [_jsx("rect", { x: x, y: y0, width: barW, height: h, fill: motivoColor(order, motivo), children: _jsx("title", { children: `${g.label} · ${motivo}: ${seg.count}` }) }), h >= 14 && (_jsx("text", { x: x + barW / 2, y: y0 + h / 2 + 4, textAnchor: "middle", fontSize: "11", fontWeight: "700", fill: "#FFFFFF", children: seg.count }))] }, motivo));
                                    }), _jsx("text", { x: x + barW / 2, y: H - 9, textAnchor: "middle", fontSize: "11", fill: "#202124", children: g.label })] }, g.label));
                        })] })] })) }));
}
// ---------------------------------------------------------------------------
// Stacked horizontal bars (e.g. auditor x motivo)
// ---------------------------------------------------------------------------
export function StackedBarsCard({ title, groups, order, }) {
    const W = 420;
    const labelW = 112;
    const right = 36;
    const top = 6;
    const rowH = 26;
    const gap = 12;
    const axisH = 24;
    const plotW = W - labelW - right;
    const H = top + groups.length * (rowH + gap) + axisH;
    const max = Math.max(0, ...groups.map((g) => g.total));
    const scale = niceScale(max);
    const ticks = [];
    for (let v = 0; v <= scale.top; v += scale.step)
        ticks.push(v);
    const xOf = (value) => labelW + (value / scale.top) * plotW;
    return (_jsx(ChartCard, { title: title, children: groups.length === 0 ? (_jsx(NoData, {})) : (_jsxs(_Fragment, { children: [_jsx(Legend, { order: order }), _jsxs("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": title, children: [ticks.map((v) => (_jsxs("g", { children: [_jsx("line", { x1: xOf(v), x2: xOf(v), y1: top, y2: H - axisH, stroke: GRID, strokeWidth: "1" }), _jsx("text", { x: xOf(v), y: H - 8, textAnchor: "middle", fontSize: "11", fill: "#202124", children: v })] }, v))), _jsx("line", { x1: labelW, x2: labelW, y1: top, y2: H - axisH, stroke: "#202124", strokeWidth: "1" }), groups.map((g, i) => {
                            const y = top + i * (rowH + gap) + gap / 2;
                            let acc = 0;
                            return (_jsxs("g", { children: [_jsxs("text", { x: labelW - 8, y: y + rowH / 2 + 4, textAnchor: "end", fontSize: "10.5", fill: "#202124", children: [shorten(g.label, 17), _jsx("title", { children: g.label })] }), order.map((motivo) => {
                                        const seg = g.segments.find((s) => s.label === motivo);
                                        if (!seg || seg.count === 0)
                                            return null;
                                        const x0 = xOf(acc);
                                        const w = xOf(acc + seg.count) - x0;
                                        acc += seg.count;
                                        return (_jsx("rect", { x: x0, y: y, width: w, height: rowH, fill: motivoColor(order, motivo), children: _jsx("title", { children: `${g.label} · ${motivo}: ${seg.count}` }) }, motivo));
                                    }), _jsx("text", { x: xOf(g.total) + 6, y: y + rowH / 2 + 4, fontSize: "11", fill: AXIS_TEXT, children: g.total })] }, g.label));
                        })] })] })) }));
}
