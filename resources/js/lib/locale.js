/**
 * Return the localized value for a field.
 * Falls back to the English (default) field if the BM translation is empty.
 */
export function tl(record, field, locale) {
    if (!record) return '';
    if (locale === 'ms') {
        const msVal = record[field + '_ms'];
        if (msVal !== null && msVal !== undefined) {
            if (Array.isArray(msVal) && msVal.length > 0) return msVal;
            if (typeof msVal === 'string' && msVal.trim()) return msVal;
        }
    }
    return record[field] ?? '';
}
