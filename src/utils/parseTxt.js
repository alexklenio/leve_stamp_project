/**
 * Parses a TXT file containing seal codes.
 * Supports two formats:
 * 1. Just code: 9800010430276
 * 2. Code + convenio: 9800010430276;LIBERAÇÃO GERÊNCIA - LT12082026
 */
export function parseTxt(text) {
    const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    return lines.map((line, index) => {
        const parts = line.split(';');
        const codigo = parts[0]?.trim() || '';
        const convenio = parts[1]?.trim() || undefined;
        return {
            id: `seal-${index}-${codigo}`,
            codigo,
            convenio,
        };
    });
}
/**
 * Validates if a code is numeric and has at least 10 digits
 */
export function isValidCode(codigo) {
    return /^\d{10,}$/.test(codigo);
}
/**
 * Filters and validates seals
 */
export function validateSeals(seals) {
    const valid = [];
    const invalid = [];
    seals.forEach(seal => {
        if (isValidCode(seal.codigo)) {
            valid.push(seal);
        }
        else {
            invalid.push(seal);
        }
    });
    return { valid, invalid };
}
