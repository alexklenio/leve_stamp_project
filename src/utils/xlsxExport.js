// Minimal, dependency-free .xlsx writer.
// An .xlsx is a ZIP of XML files; here the ZIP is written without compression ("store"),
// which every version of Excel, LibreOffice and Google Sheets opens normally.
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const encoder = new TextEncoder();
// ---------------------------------------------------------------------------
// ZIP (store)
// ---------------------------------------------------------------------------
let crcTable = null;
function crc32(bytes) {
    if (crcTable === null) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTable[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++)
        crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}
function zipStore(files) {
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    files.forEach((file) => {
        const name = encoder.encode(file.name);
        const crc = crc32(file.data);
        const size = file.data.length;
        const local = new Uint8Array(30 + name.length);
        const lv = new DataView(local.buffer);
        lv.setUint32(0, 0x04034b50, true); // local file header
        lv.setUint16(4, 20, true); // version needed
        lv.setUint16(6, 0x0800, true); // flags: UTF-8 names
        lv.setUint16(8, 0, true); // method: store
        lv.setUint16(10, dosTime, true);
        lv.setUint16(12, dosDate, true);
        lv.setUint32(14, crc, true);
        lv.setUint32(18, size, true);
        lv.setUint32(22, size, true);
        lv.setUint16(26, name.length, true);
        lv.setUint16(28, 0, true); // extra length
        local.set(name, 30);
        const central = new Uint8Array(46 + name.length);
        const cv = new DataView(central.buffer);
        cv.setUint32(0, 0x02014b50, true); // central directory header
        cv.setUint16(4, 20, true); // version made by
        cv.setUint16(6, 20, true); // version needed
        cv.setUint16(8, 0x0800, true);
        cv.setUint16(10, 0, true);
        cv.setUint16(12, dosTime, true);
        cv.setUint16(14, dosDate, true);
        cv.setUint32(16, crc, true);
        cv.setUint32(20, size, true);
        cv.setUint32(24, size, true);
        cv.setUint16(28, name.length, true);
        cv.setUint32(42, offset, true); // offset of the local header
        central.set(name, 46);
        localParts.push(local, file.data);
        centralParts.push(central);
        offset += local.length + size;
    });
    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); // end of central directory
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    const all = [...localParts, ...centralParts, end];
    const result = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
    let position = 0;
    all.forEach((part) => {
        result.set(part, position);
        position += part.length;
    });
    return result;
}
// ---------------------------------------------------------------------------
// SpreadsheetML
// ---------------------------------------------------------------------------
function escapeXml(text) {
    return text
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '') // characters XML forbids
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function columnName(index) {
    let n = index + 1;
    let letters = '';
    while (n > 0) {
        const rest = (n - 1) % 26;
        letters = String.fromCharCode(65 + rest) + letters;
        n = Math.floor((n - 1) / 26);
    }
    return letters;
}
/** Excel sheet names: up to 31 characters, without \ / ? * [ ] : and unique. */
function safeSheetNames(sheets) {
    const used = new Set();
    return sheets.map((sheet, index) => {
        let name = sheet.name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || `Planilha${index + 1}`;
        let candidate = name;
        let counter = 2;
        while (used.has(candidate.toLowerCase())) {
            const suffix = ` (${counter})`;
            candidate = name.slice(0, 31 - suffix.length) + suffix;
            counter += 1;
        }
        name = candidate;
        used.add(name.toLowerCase());
        return name;
    });
}
function textCell(ref, text, style = '') {
    return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
}
function sheetXml(sheet) {
    const columnCount = sheet.header.length;
    // Column width: the longest of the header and the first rows, within reasonable limits.
    const widths = sheet.header.map((title, c) => {
        let longest = title.length;
        for (let r = 0; r < Math.min(sheet.rows.length, 300); r++) {
            longest = Math.max(longest, String(sheet.rows[r][c] ?? '').length);
        }
        return Math.min(60, Math.max(10, longest + 2));
    });
    const cols = widths
        .map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`)
        .join('');
    const headerRow = `<row r="1" ht="22" customHeight="1">` +
        sheet.header.map((title, c) => textCell(`${columnName(c)}1`, title, ' s="1"')).join('') +
        `</row>`;
    const bodyRows = sheet.rows
        .map((row, r) => {
        const rowNumber = r + 2;
        const cells = row
            .map((value, c) => {
            const ref = `${columnName(c)}${rowNumber}`;
            if (typeof value === 'number' && isFinite(value))
                return `<c r="${ref}"><v>${value}</v></c>`;
            const text = String(value ?? '');
            return text === '' ? '' : textCell(ref, text);
        })
            .join('');
        return `<row r="${rowNumber}">${cells}</row>`;
    })
        .join('');
    const lastCell = `${columnName(Math.max(columnCount - 1, 0))}${sheet.rows.length + 1}`;
    return (`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
        `<dimension ref="A1:${lastCell}"/>` +
        `<sheetViews><sheetView workbookViewId="0">` +
        `<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>` +
        `<selection pane="bottomLeft"/></sheetView></sheetViews>` +
        `<sheetFormatPr defaultRowHeight="15"/>` +
        `<cols>${cols}</cols>` +
        `<sheetData>${headerRow}${bodyRows}</sheetData>` +
        `<autoFilter ref="A1:${lastCell}"/>` +
        `</worksheet>`);
}
const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="2">` +
    `<font><sz val="11"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>` +
    `</fonts>` +
    `<fills count="3">` +
    `<fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FF003366"/><bgColor indexed="64"/></patternFill></fill>` +
    `</fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="2">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>` +
    `</cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
    `</styleSheet>`;
/** Builds the bytes of an .xlsx workbook. The header row is blue with white text, frozen, with filters. */
export function buildXlsx(sheets) {
    const names = safeSheetNames(sheets);
    const NS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    const XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
    const contentTypes = XML +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        sheets
            .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
            .join('') +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `</Types>`;
    const rootRels = XML +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`;
    const workbook = XML +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${NS_REL}">` +
        `<sheets>` +
        names.map((name, i) => `<sheet name="${escapeXml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
        `</sheets></workbook>`;
    const workbookRels = XML +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        sheets
            .map((_, i) => `<Relationship Id="rId${i + 1}" Type="${NS_REL}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
            .join('') +
        `<Relationship Id="rId${sheets.length + 1}" Type="${NS_REL}/styles" Target="styles.xml"/>` +
        `</Relationships>`;
    const files = [
        { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
        { name: '_rels/.rels', data: encoder.encode(rootRels) },
        { name: 'xl/workbook.xml', data: encoder.encode(workbook) },
        { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRels) },
        { name: 'xl/styles.xml', data: encoder.encode(STYLES_XML) },
        ...sheets.map((sheet, i) => ({
            name: `xl/worksheets/sheet${i + 1}.xml`,
            data: encoder.encode(sheetXml(sheet)),
        })),
    ];
    return zipStore(files);
}
/** Starts the download of an .xlsx in the browser. */
export function downloadXlsx(bytes, filename) {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const blob = new Blob([buffer], { type: MIME_XLSX });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
