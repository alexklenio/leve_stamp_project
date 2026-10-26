import type { AudienciasConfig } from '../config/audiencias';

// ===========================================================================
// Types
// ===========================================================================

/** What is needed to read a Google Sheet. Any dashboard config that has these fields works. */
export interface SheetSource {
  sheetId: string;
  sheetName: string;
  sheetGid: string;
  columnLabels: Record<string, string>;
}

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timeofday';

export interface SheetColumn {
  /** Name used on screen and as the key of the cells (header, or the name set in the config). */
  label: string;
  type: ColumnType;
  /** 0-based position in the sheet (A = 0). Used to write, so blank headers are fine. */
  index: number;
  /** Column letter in the sheet (A, B, ... AA). */
  letter: string;
}

export interface SheetCell {
  raw: unknown;
  text: string;
}

export interface SheetRow {
  /** Line in the spreadsheet (row 1 is the header, so the first data row is 2). */
  rowNumber: number;
  cells: Record<string, SheetCell>;
}

export interface SheetData {
  columns: SheetColumn[];
  rows: SheetRow[];
}

export interface Compromisso {
  id: string;
  rowNumber: number;
  /** Local midnight of the day of the commitment. */
  date: Date;
  /** Minutes since midnight, or null when the sheet has no time for it. */
  minutes: number | null;
  title: string;
  subtitle: string;
  /** Short values shown as pills (e.g. UNA, ONLINE). */
  badges: string[];
  details: { label: string; value: string }[];
  /** Normalized text of the whole row, used by the search box. */
  searchText: string;
}

export interface ColumnMap {
  dateCol: SheetColumn | null;
  timeCol: SheetColumn | null;
  primaryCols: SheetColumn[];
}

export interface PendingGroup {
  label: string;
  count: number;
}

export interface BuildResult {
  compromissos: Compromisso[];
  /** Rows without a date in the date column, grouped by what the column says (e.g. "AG SENTENÇA"). */
  pending: PendingGroup[];
  /** Total of rows in `pending`. */
  ignored: number;
  map: ColumnMap;
}

export type InputKind = 'date' | 'time' | 'datetime' | 'text' | 'textarea' | 'number' | 'checkbox';

// ===========================================================================
// Small helpers
// ===========================================================================

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Removes zero-width characters (they hide in "empty-looking" cells) and trims. */
export function cleanText(text: string): string {
  return text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').trim();
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatMinutes(minutes: number): string {
  return `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatDayLong(d: Date): string {
  const text = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function relativeDayLabel(d: Date, today: Date): string {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(today).getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff > 1) return `Em ${diff} dias`;
  return '';
}

/** "PREPOSTO" -> "Preposto". Labels that are not ALL CAPS are left as they are. */
export function displayLabel(label: string): string {
  const hasLetters = /[a-zA-ZÀ-ÿ]/.test(label);
  if (hasLetters && label === label.toUpperCase()) {
    return label.charAt(0) + label.slice(1).toLowerCase();
  }
  return label;
}

/** 0 -> A, 25 -> Z, 26 -> AA ... */
export function columnLetter(index: number): string {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const rest = (n - 1) % 26;
    letters = String.fromCharCode(65 + rest) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

// ===========================================================================
// Reading the sheet (Google Visualization API, public "anyone with the link")
// ===========================================================================

interface GvizCol {
  id?: string;
  label?: string;
  type?: string;
}

interface GvizCell {
  v?: unknown;
  f?: string | null;
}

interface GvizResponse {
  status?: string;
  errors?: { message?: string; detailed_message?: string }[];
  table?: {
    cols: GvizCol[];
    rows: { c: (GvizCell | null)[] }[];
  };
}

const COLUMN_TYPES: string[] = ['string', 'number', 'boolean', 'date', 'datetime', 'timeofday'];

function asColumnType(type: string | undefined): ColumnType {
  return type !== undefined && COLUMN_TYPES.includes(type) ? (type as ColumnType) : 'string';
}

export function isConfigured(cfg: { sheetId: string }): boolean {
  const id = cfg.sheetId.trim();
  return id !== '' && !id.startsWith('COLE_');
}

function cellText(cell: GvizCell | null | undefined, type: ColumnType): string {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  if (type === 'timeofday' && Array.isArray(cell.v)) {
    const [h, m] = cell.v as number[];
    return formatMinutes(Number(h) * 60 + Number(m));
  }
  if (cell.f !== undefined && cell.f !== null && cell.f !== '') return cleanText(String(cell.f));
  return cleanText(String(cell.v));
}

/** Parses the body Google returns: "...setResponse({...});" */
export function parseGvizResponse(
  body: string,
  columnLabels: Record<string, string> = {}
): SheetData {
  const match = body.match(/setResponse\(([\s\S]*)\)\s*;?\s*$/);
  if (!match) {
    throw new Error(
      'Resposta inesperada do Google Sheets. Confirme que a planilha está compartilhada como "Qualquer pessoa com o link: Leitor".'
    );
  }

  let json: GvizResponse;
  try {
    json = JSON.parse(match[1]) as GvizResponse;
  } catch {
    throw new Error('Não foi possível interpretar a resposta do Google Sheets.');
  }

  if (json.status !== 'ok' || !json.table) {
    const first = json.errors && json.errors[0];
    const message = (first && (first.detailed_message || first.message)) || 'erro desconhecido';
    throw new Error(`Erro ao ler a planilha: ${message}`);
  }

  const table = json.table;

  // Fallback names set in the config for columns WITHOUT a header, keyed by column letter.
  const overrides: Record<string, string> = {};
  Object.keys(columnLabels).forEach((key) => {
    overrides[key.trim().toUpperCase()] = columnLabels[key];
  });

  // Columns with no header and no content (e.g. the empty ones at the end) are dropped,
  // but every column keeps its real position in the sheet.
  const seen = new Map<string, number>();
  const columns: SheetColumn[] = [];
  table.cols.forEach((col, index) => {
    const letter = columnLetter(index);
    const override = overrides[letter];
    const header = cleanText(col.label || '');
    const hasContent = table.rows.some((row) => {
      const cell = row.c ? row.c[index] : null;
      return cell !== null && cell !== undefined && cleanText(String(cell.v ?? '')) !== '';
    });
    if (header === '' && !override && !hasContent) return;

    // The header written in the sheet wins; the config name is only used when it is blank.
    let label = header || (override ? cleanText(override) : '') || `Coluna ${letter}`;
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    if (count > 1) label = `${label} (${count})`;
    columns.push({ label, type: asColumnType(col.type), index, letter });
  });

  const rows: SheetRow[] = [];
  table.rows.forEach((row, rowIndex) => {
    const cells: Record<string, SheetCell> = {};
    let hasContent = false;
    columns.forEach((column) => {
      const cell = row.c ? row.c[column.index] : null;
      const text = cellText(cell, column.type);
      if (text !== '') hasContent = true;
      cells[column.label] = { raw: cell ? cell.v : null, text };
    });
    if (hasContent) rows.push({ rowNumber: rowIndex + 2, cells });
  });

  return { columns, rows };
}

export async function fetchSheetData(cfg: SheetSource): Promise<SheetData> {
  const params = new URLSearchParams({ tqx: 'out:json', headers: '1' });
  if (cfg.sheetName.trim()) {
    params.set('sheet', cfg.sheetName.trim());
  } else {
    params.set('gid', cfg.sheetGid.trim() || '0');
  }
  params.set('_', String(Date.now())); // avoid stale cached responses

  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    cfg.sheetId.trim()
  )}/gviz/tq?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new Error(
      'Não foi possível acessar a planilha. Verifique a conexão e se ela está compartilhada como "Qualquer pessoa com o link: Leitor".'
    );
  }
  if (!response.ok) {
    throw new Error(`O Google respondeu com erro ${response.status} ao ler a planilha.`);
  }
  return parseGvizResponse(await response.text(), cfg.columnLabels);
}

// ===========================================================================
// Dates and times
// ===========================================================================

interface ParsedDate {
  date: Date;
  minutes: number | null;
}

/** Google's own format for date cells: "Date(2026,9,15)" or "Date(2026,9,15,14,30,0)" (month is 0-based). */
function parseGvizDate(v: unknown): ParsedDate | null {
  if (typeof v !== 'string') return null;
  const m = v.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+)(?:,(\d+))?)?\)$/);
  if (!m) return null;
  return {
    date: new Date(Number(m[1]), Number(m[2]), Number(m[3])),
    minutes: m[4] !== undefined ? Number(m[4]) * 60 + Number(m[5]) : null,
  };
}

/** Dates typed as plain text: "15/10/2026", "15/10/2026 14:30" or "2026-10-15". */
function parseTextDate(text: string): ParsedDate | null {
  const t = text.trim();
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (br) {
    let year = Number(br[3]);
    if (year < 100) year += 2000;
    return {
      date: new Date(year, Number(br[2]) - 1, Number(br[1])),
      minutes: br[4] !== undefined ? Number(br[4]) * 60 + Number(br[5]) : null,
    };
  }
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (iso) {
    return {
      date: new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])),
      minutes: iso[4] !== undefined ? Number(iso[4]) * 60 + Number(iso[5]) : null,
    };
  }
  return null;
}

/** "14:30", "14h30", "14h", "14:30:00". */
function parseTextTime(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!m) return null;
  const hours = Number(m[1]);
  const mins = m[2] !== undefined ? Number(m[2]) : 0;
  if (hours > 23 || mins > 59) return null;
  return hours * 60 + mins;
}

function readDate(row: SheetRow, col: SheetColumn): ParsedDate | null {
  const cell = row.cells[col.label];
  if (!cell || cell.text === '') return null;
  const parsed =
    col.type === 'date' || col.type === 'datetime' ? parseGvizDate(cell.raw) : null;
  const result = parsed ?? parseTextDate(cell.text);
  if (!result || isNaN(result.date.getTime())) return null;
  return result;
}

function readMinutes(row: SheetRow, col: SheetColumn): number | null {
  const cell = row.cells[col.label];
  if (!cell || cell.text === '') return null;
  if (col.type === 'timeofday' && Array.isArray(cell.raw)) {
    const [h, m] = cell.raw as number[];
    return Number(h) * 60 + Number(m);
  }
  if (col.type === 'date' || col.type === 'datetime') {
    const parsed = parseGvizDate(cell.raw);
    if (parsed && parsed.minutes !== null) return parsed.minutes;
  }
  return parseTextTime(cell.text);
}

// ===========================================================================
// Column detection
// ===========================================================================

const PRIMARY_ALIASES = [
  'processo',
  'numero',
  'autos',
  'reclamante',
  'autor',
  'parte',
  'requerente',
  'assunto',
  'tipo',
  'natureza',
  'vara',
  'tribunal',
  'comarca',
];

/**
 * True when `ref` is the column's name OR its letter.
 * With `includeNumbered`, "MODALIDADE" also matches a repeated column named "MODALIDADE (2)".
 */
export function refMatches(column: SheetColumn, ref: string, includeNumbered = false): boolean {
  const target = normalize(ref);
  if (target === '') return false;
  const label = normalize(column.label);
  if (target === label || target === normalize(column.letter)) return true;
  return includeNumbered && target === label.replace(/\s*\(\d+\)$/, '');
}

function findByRef(columns: SheetColumn[], ref: string): SheetColumn | null {
  return columns.find((c) => refMatches(c, ref)) ?? null;
}

export function detectColumns(columns: SheetColumn[], cfg: AudienciasConfig): ColumnMap {
  // ---- date ----
  let dateCol = findByRef(columns, cfg.dateColumn);
  if (!dateCol) {
    const typed = columns.filter((c) => c.type === 'date' || c.type === 'datetime');
    dateCol =
      typed.find((c) => /audienc|compromisso|prazo/.test(normalize(c.label))) ??
      columns.find((c) => /audienc/.test(normalize(c.label)) && /data/.test(normalize(c.label))) ??
      typed[0] ??
      columns.find((c) => /^data\b|\bdata\b/.test(normalize(c.label))) ??
      null;
  }

  // ---- time ----
  let timeCol = findByRef(columns, cfg.timeColumn);
  if (!timeCol && !(dateCol && dateCol.type === 'datetime')) {
    timeCol =
      columns.find((c) => c !== dateCol && c.type === 'timeofday') ??
      columns.find((c) => c !== dateCol && /hora|horario/.test(normalize(c.label))) ??
      null;
  }

  // ---- primary (highlighted) columns ----
  const excluded: SheetColumn[] = [dateCol, timeCol].filter((c): c is SheetColumn => c !== null);

  let primaryCols: SheetColumn[] = cfg.primaryColumns
    .map((ref) => findByRef(columns, ref))
    .filter((c): c is SheetColumn => c !== null)
    .slice(0, 2);

  if (primaryCols.length === 0) {
    for (const alias of PRIMARY_ALIASES) {
      const found = columns.find(
        (c) =>
          !excluded.includes(c) && !primaryCols.includes(c) && normalize(c.label).includes(alias)
      );
      if (found) primaryCols.push(found);
      if (primaryCols.length >= 2) break;
    }
    if (primaryCols.length === 0) {
      primaryCols = columns.filter((c) => !excluded.includes(c) && c.type === 'string').slice(0, 2);
    }
  }

  return { dateCol, timeCol, primaryCols };
}

// ===========================================================================
// Process number + party
// ===========================================================================

// Brazilian unified (CNJ) number: NNNNNNN-DD.AAAA.J.TR.OOOO — people type it with stray spaces.
const CNJ_NUMBER = /(\d{1,7})\s*-\s*(\d{2})\s*\.\s*(\d{4})\s*\.\s*(\d)\s*\.\s*(\d{2})\s*\.\s*(\d{4})/;

/**
 * "nº 1000808-45.2026.5.02.0050 – JONATHAN SILVA SANTOS"
 *   -> { numero: "1000808-45.2026.5.02.0050", parte: "JONATHAN SILVA SANTOS" }
 */
export function splitProcesso(text: string): { numero: string; parte: string } | null {
  const m = text.match(CNJ_NUMBER);
  if (!m || m.index === undefined) return null;

  const numero = `${m[1]}-${m[2]}.${m[3]}.${m[4]}.${m[5]}.${m[6]}`;
  const before = text
    .slice(0, m.index)
    .replace(/n[º°o]\.?\s*$/i, '')
    .replace(/[\s\-–—:]+$/, '')
    .trim();
  const after = text
    .slice(m.index + m[0].length)
    .replace(/^[\s\-–—:]+/, '')
    .trim();

  return { numero, parte: after !== '' ? after : before };
}

// ===========================================================================
// Building the agenda
// ===========================================================================

export function buildCompromissos(data: SheetData, cfg: AudienciasConfig): BuildResult {
  const map = detectColumns(data.columns, cfg);
  const isHidden = (c: SheetColumn) => cfg.hiddenColumns.some((ref) => refMatches(c, ref));
  const badgeCols: SheetColumn[] = [];
  cfg.badgeColumns.forEach((ref) => {
    data.columns.forEach((c) => {
      if (refMatches(c, ref, true) && !badgeCols.includes(c)) badgeCols.push(c);
    });
  });

  const compromissos: Compromisso[] = [];
  const pendingCount = new Map<string, number>();

  data.rows.forEach((row) => {
    const dateInfo = map.dateCol ? readDate(row, map.dateCol) : null;
    if (!dateInfo) {
      // No date: usually a situation such as "AG SENTENÇA" written in the date column.
      const said = map.dateCol ? row.cells[map.dateCol.label]?.text ?? '' : '';
      const key = said !== '' ? said : '(sem informação)';
      pendingCount.set(key, (pendingCount.get(key) ?? 0) + 1);
      return;
    }

    let minutes: number | null = null;
    if (map.timeCol) minutes = readMinutes(row, map.timeCol);
    if (minutes === null) minutes = dateInfo.minutes;

    const primaryTexts = map.primaryCols
      .map((c) => row.cells[c.label]?.text ?? '')
      .filter((t) => t !== '');

    let title = primaryTexts[0] ?? `Compromisso (linha ${row.rowNumber})`;
    let subtitle = primaryTexts[1] ?? '';
    const split = primaryTexts[0] ? splitProcesso(primaryTexts[0]) : null;
    if (split && split.parte !== '') {
      title = split.parte;
      subtitle = [`Processo ${split.numero}`, primaryTexts[1]].filter(Boolean).join(' · ');
    }

    const badges = badgeCols
      .filter((c) => !isHidden(c))
      .map((c) => row.cells[c.label]?.text ?? '')
      .filter((t) => t !== '');

    const details: { label: string; value: string }[] = [];
    data.columns.forEach((column) => {
      if (column === map.dateCol || column === map.timeCol) return;
      if (map.primaryCols.includes(column) || badgeCols.includes(column)) return;
      if (isHidden(column)) return;
      const text = row.cells[column.label]?.text ?? '';
      if (text !== '') details.push({ label: column.label, value: text });
    });

    const allText = data.columns.map((c) => row.cells[c.label]?.text ?? '').join(' ');

    compromissos.push({
      id: `row-${row.rowNumber}`,
      rowNumber: row.rowNumber,
      date: startOfDay(dateInfo.date),
      minutes,
      title,
      subtitle,
      badges,
      details,
      searchText: normalize(allText),
    });
  });

  const END_OF_DAY = 24 * 60;
  compromissos.sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      (a.minutes ?? END_OF_DAY) - (b.minutes ?? END_OF_DAY) ||
      a.rowNumber - b.rowNumber
  );

  const pending: PendingGroup[] = Array.from(pendingCount.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
  const ignored = pending.reduce((sum, group) => sum + group.count, 0);

  return { compromissos, pending, ignored, map };
}

// ===========================================================================
// Registering a new commitment (form + Apps Script)
// ===========================================================================

export function inputKindFor(col: SheetColumn, map: ColumnMap): InputKind {
  if (map.dateCol && col === map.dateCol) return col.type === 'datetime' ? 'datetime' : 'date';
  if (map.timeCol && col === map.timeCol) return 'time';
  switch (col.type) {
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime';
    case 'timeofday':
      return 'time';
    case 'number':
      return 'number';
    case 'boolean':
      return 'checkbox';
    default:
      return /observ|descri|detalh|resumo|anota|resultado/.test(normalize(col.label))
        ? 'textarea'
        : 'text';
  }
}

/** Short, repeated values already in the sheet — offered as suggestions in the form. */
export function distinctValues(data: SheetData, label: string, max = 15): string[] {
  const set = new Set<string>();
  for (const row of data.rows) {
    const text = row.cells[label]?.text ?? '';
    if (text !== '' && text.length <= 60) set.add(text);
    if (set.size > max) return [];
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/**
 * Situations written in the date column instead of a date ("AG AUDIÊNCIA", "AG SENTENÇA"...).
 * The form offers them for processes that still have no hearing date.
 */
export function situationValues(data: SheetData, map: ColumnMap): string[] {
  if (!map.dateCol) return [];
  const set = new Set<string>();
  const dateCol = map.dateCol;
  data.rows.forEach((row) => {
    const text = row.cells[dateCol.label]?.text ?? '';
    if (text !== '' && text.length <= 30 && readDate(row, dateCol) === null) set.add(text);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Converts what the form holds into the text the Apps Script expects for that column. */
export function formatForSheet(col: SheetColumn, kind: InputKind, raw: string): string {
  if (raw === '') return '';
  // A date typed as plain text in the sheet keeps the Brazilian format.
  if (kind === 'date' && col.type === 'string') {
    const [y, m, d] = raw.split('-');
    return `${d}/${m}/${y}`;
  }
  return raw; // date: yyyy-mm-dd · time: HH:mm · datetime: yyyy-mm-ddTHH:mm
}

/** What goes to the Apps Script: cells keyed by 1-based column position. */
export function buildSubmitCells(
  values: Record<string, string>,
  columns: SheetColumn[]
): Record<string, { value: string; type: string }> {
  const cells: Record<string, { value: string; type: string }> = {};
  columns.forEach((c) => {
    if (Object.prototype.hasOwnProperty.call(values, c.label)) {
      cells[String(c.index + 1)] = { value: values[c.label], type: c.type };
    }
  });
  return cells;
}

export async function submitCompromisso(
  cfg: AudienciasConfig,
  values: Record<string, string>,
  columns: SheetColumn[]
): Promise<void> {
  if (cfg.scriptUrl.trim() === '') {
    throw new Error(
      'A URL do Apps Script ainda não foi configurada (scriptUrl em src/config/audiencias.ts).'
    );
  }

  let response: Response;
  try {
    // No custom headers on purpose: a plain text body avoids the CORS preflight,
    // which Apps Script web apps do not answer.
    response = await fetch(cfg.scriptUrl.trim(), {
      method: 'POST',
      body: JSON.stringify({ token: cfg.scriptToken, cells: buildSubmitCells(values, columns) }),
    });
  } catch {
    throw new Error(
      'Não foi possível enviar para a planilha. Confira a URL do Apps Script e se a implantação permite acesso para "Qualquer pessoa".'
    );
  }

  let result: { ok?: boolean; error?: string };
  try {
    result = (await response.json()) as { ok?: boolean; error?: string };
  } catch {
    throw new Error(
      'Resposta inesperada do Apps Script. Confira se a implantação está como "Qualquer pessoa" e se a URL termina em /exec.'
    );
  }
  if (!result.ok) {
    throw new Error(result.error || 'O script recusou o registro.');
  }
}
