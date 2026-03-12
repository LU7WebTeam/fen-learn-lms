const STRING_KEYS = new Set(['type', 'text', 'href', 'url', 'src', 'id']);
const ARRAY_KEYS = new Set(['content', 'children']);

function sanitizeValue(value, key = '') {
    if (value === null || value === undefined) {
        if (ARRAY_KEYS.has(key)) return [];
        if (STRING_KEYS.has(key)) return '';
        return undefined;
    }

    if (Array.isArray(value)) {
        const next = value
            .map((item) => sanitizeValue(item))
            .filter((item) => item !== undefined);
        return next;
    }

    if (typeof value === 'object') {
        const out = {};
        for (const [childKey, childValue] of Object.entries(value)) {
            const sanitized = sanitizeValue(childValue, childKey);
            if (sanitized !== undefined) {
                out[childKey] = sanitized;
            }
        }
        return out;
    }

    if (STRING_KEYS.has(key) && typeof value !== 'string') {
        return String(value);
    }

    return value;
}

function parseArrayLikeContent(raw) {
    if (Array.isArray(raw)) return raw;

    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed || trimmed[0] !== '[') return undefined;

        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return undefined;
        }
    }

    return undefined;
}

export function normalizeBlockNoteInitialContent(raw) {
    const parsed = parseArrayLikeContent(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return undefined;

    const sanitized = parsed
        .map((block) => sanitizeValue(block))
        .filter((block) => block && typeof block === 'object' && typeof block.type === 'string' && block.type.trim());

    return sanitized.length > 0 ? sanitized : undefined;
}
