import { normalize, refMatches } from './audienciasSheet';
export const EMPTY_FILTERS = { auditors: [], motivos: [], months: [], years: [] };
export const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];
const MONTH_KEYS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const BLANK_LABEL = '(Sem informação)';
/** Same blue / red / yellow / green order used by Google Sheets charts. */
export const PALETTE = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#AB47BC', '#00ACC1', '#FF7043', '#8D6E63'];
export function motivoColor(order, label) {
    const index = order.indexOf(label);
    return index < 0 ? '#9AA0A6' : PALETTE[index % PALETTE.length];
}
// ===========================================================================
// Parsing
// ===========================================================================
function parseMonth(raw, text) {
    if (typeof raw === 'number' && raw >= 1 && raw <= 12)
        return Math.round(raw);
    const t = normalize(text);
    if (t === '')
        return null;
    if (/^\d{1,2}$/.test(t)) {
        const n = Number(t);
        return n >= 1 && n <= 12 ? n : null;
    }
    // "01/2026", "1-2026"
    const numeric = t.match(/^(\d{1,2})[/\-.]\d{2,4}$/);
    if (numeric) {
        const n = Number(numeric[1]);
        return n >= 1 && n <= 12 ? n : null;
    }
    // "janeiro", "Jan", "jan/26", "março"
    const index = MONTH_KEYS.indexOf(t.slice(0, 3));
    return index >= 0 ? index + 1 : null;
}
function parseYear(raw, text) {
    if (typeof raw === 'number' && raw >= 1900 && raw <= 2200)
        return Math.round(raw);
    const t = text.replace(/[.\s]/g, '');
    const full = t.match(/(?:19|20)\d{2}/);
    if (full)
        return Number(full[0]);
    if (/^\d{2}$/.test(t))
        return 2000 + Number(t);
    return null;
}
/** Reads a date from a Google date cell ("Date(2026,9,15)") or from text ("15/10/2026"). */
function parseDateParts(raw, text) {
    if (typeof raw === 'string') {
        const g = raw.match(/^Date\((\d+),(\d+),\d+/);
        if (g)
            return { year: Number(g[1]), month: Number(g[2]) + 1 };
    }
    const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (br) {
        const year = Number(br[3]) < 100 ? 2000 + Number(br[3]) : Number(br[3]);
        return { year, month: Number(br[2]) };
    }
    const iso = text.match(/^(\d{4})-(\d{2})-\d{2}/);
    if (iso)
        return { year: Number(iso[1]), month: Number(iso[2]) };
    return null;
}
// ===========================================================================
// Column detection
// ===========================================================================
function findByConfigOrPattern(columns, ref, patterns) {
    if (ref.trim() !== '') {
        const configured = columns.find((c) => refMatches(c, ref));
        if (configured)
            return configured;
    }
    for (const pattern of patterns) {
        const found = columns.find((c) => pattern.test(normalize(c.label)));
        if (found)
            return found;
    }
    return null;
}
export function detectProdColumns(columns, cfg) {
    const auditor = findByConfigOrPattern(columns, cfg.auditorColumn, [/auditor/]);
    const motivo = findByConfigOrPattern(columns, cfg.motivoColumn, [/motivo/, /alinea/, /justa/]);
    const month = findByConfigOrPattern(columns, cfg.monthColumn, [/^mes$/, /\bmes\b/]);
    const year = findByConfigOrPattern(columns, cfg.yearColumn, [/^ano$/, /\bano\b/]);
    let date = null;
    if (cfg.dateColumn.trim() !== '') {
        date = columns.find((c) => refMatches(c, cfg.dateColumn)) ?? null;
    }
    if (!date) {
        date =
            columns.find((c) => c.type === 'date' || c.type === 'datetime') ??
                columns.find((c) => /^data\b|\bdata\b/.test(normalize(c.label))) ??
                null;
    }
    return { auditor, motivo, month, year, date };
}
// ===========================================================================
// Building rows
// ===========================================================================
/**
 * Same value written in different ways ("MAU PROCEDIMENTO", "Mau  procedimento")
 * must count as one. The first spelling found is the one displayed.
 */
function makeCanonicalizer() {
    const seen = new Map();
    return (text) => {
        const clean = text.replace(/\s+/g, ' ').trim();
        if (clean === '')
            return BLANK_LABEL;
        const key = normalize(clean);
        const existing = seen.get(key);
        if (existing !== undefined)
            return existing;
        seen.set(key, clean);
        return clean;
    };
}
export function buildProdRows(data, cfg) {
    const map = detectProdColumns(data.columns, cfg);
    const canonAuditor = makeCanonicalizer();
    const canonMotivo = makeCanonicalizer();
    const columns = data.columns.filter((c) => !cfg.hiddenColumns.some((ref) => refMatches(c, ref)));
    const rows = data.rows.map((row) => {
        const cells = {};
        data.columns.forEach((c) => {
            cells[c.label] = row.cells[c.label]?.text ?? '';
        });
        const cell = (col) => (col ? row.cells[col.label] : undefined);
        let year = null;
        let month = null;
        const yearCell = cell(map.year);
        const monthCell = cell(map.month);
        if (yearCell)
            year = parseYear(yearCell.raw, yearCell.text);
        if (monthCell)
            month = parseMonth(monthCell.raw, monthCell.text);
        // MÊS / ANO missing or empty on this row: derive them from the date column.
        if ((year === null || month === null) && map.date) {
            const dateCell = cell(map.date);
            const parts = dateCell ? parseDateParts(dateCell.raw, dateCell.text) : null;
            if (parts) {
                if (year === null)
                    year = parts.year;
                if (month === null)
                    month = parts.month;
            }
        }
        return {
            id: `row-${row.rowNumber}`,
            rowNumber: row.rowNumber,
            cells,
            auditor: canonAuditor(cell(map.auditor)?.text ?? ''),
            motivo: canonMotivo(cell(map.motivo)?.text ?? ''),
            year,
            month,
        };
    });
    return { rows, columns, map };
}
// ===========================================================================
// Filters
// ===========================================================================
function sortedStrings(values) {
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}
export function filterOptions(rows) {
    const months = new Set();
    const years = new Set();
    rows.forEach((r) => {
        if (r.month !== null)
            months.add(r.month);
        if (r.year !== null)
            years.add(r.year);
    });
    return {
        auditors: sortedStrings(rows.map((r) => r.auditor)),
        motivos: sortedStrings(rows.map((r) => r.motivo)),
        months: Array.from(months).sort((a, b) => a - b),
        years: Array.from(years).sort((a, b) => a - b),
    };
}
export function applyFilters(rows, f) {
    return rows.filter((r) => (f.auditors.length === 0 || f.auditors.includes(r.auditor)) &&
        (f.motivos.length === 0 || f.motivos.includes(r.motivo)) &&
        (f.months.length === 0 || (r.month !== null && f.months.includes(r.month))) &&
        (f.years.length === 0 || (r.year !== null && f.years.includes(r.year))));
}
export function hasActiveFilters(f) {
    return f.auditors.length + f.motivos.length + f.months.length + f.years.length > 0;
}
// ===========================================================================
// Aggregations (every chart is computed from the already filtered rows)
// ===========================================================================
function stackGroups(rows, motivoOrder, groupOf, labelOf, sortKeys) {
    const counts = new Map();
    rows.forEach((r) => {
        const key = groupOf(r);
        if (key === null)
            return;
        const inner = counts.get(key) ?? new Map();
        inner.set(r.motivo, (inner.get(r.motivo) ?? 0) + 1);
        counts.set(key, inner);
    });
    return sortKeys(Array.from(counts.keys())).map((key) => {
        const inner = counts.get(key) ?? new Map();
        const segments = motivoOrder.map((motivo) => ({ label: motivo, count: inner.get(motivo) ?? 0 }));
        return {
            label: labelOf(key),
            segments,
            total: segments.reduce((sum, s) => sum + s.count, 0),
        };
    });
}
export function aggregate(rows, motivoOrder) {
    const byMotivo = motivoOrder
        .map((motivo) => ({ label: motivo, count: rows.filter((r) => r.motivo === motivo).length }))
        .filter((s) => s.count > 0);
    const byYear = stackGroups(rows, motivoOrder, (r) => (r.year === null ? null : String(r.year)), (key) => key, (keys) => keys.sort((a, b) => Number(a) - Number(b)));
    const byAuditor = stackGroups(rows, motivoOrder, (r) => r.auditor, (key) => key, (keys) => keys.sort((a, b) => a.localeCompare(b, 'pt-BR')));
    return { total: rows.length, byMotivo, byYear, byAuditor };
}
/** Axis with "nice" whole numbers (these are counts): 99 -> 0..100 every 25; 72 -> 0..80 every 20. */
export function niceScale(max) {
    if (max <= 0)
        return { top: 4, step: 1 };
    const rough = max / 4;
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const candidates = [1, 2, 2.5, 5, 10]
        .map((m) => m * pow)
        .filter((c) => Number.isInteger(c) && c >= 1);
    const step = candidates.find((c) => c >= rough) ?? Math.max(1, Math.ceil(rough));
    return { top: Math.ceil(max / step) * step, step };
}
