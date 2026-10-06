export interface PassportField {
    key: string
    label: string
    value: string
}

/** Content size caps, enforced on every write and shared across routes. */
export const FIELD_LIMITS = {
    maxFields: 50,
    maxKeyLength: 120,
    maxLabelLength: 200,
    maxValueLength: 8000,
    maxTitleLength: 200,
} as const

/**
 * Parse a stored `fields` value (stringified JSON, or an already-parsed
 * array) into a normalized array. Every returned field is guaranteed to
 * have a string key/label/value, so callers (export, formatters) can call
 * `.trim()` without a type guard. Never throws.
 */
export function parseFields(fields: unknown): PassportField[] {
    let arr: unknown = fields
    if (typeof fields === 'string') {
        try {
            arr = JSON.parse(fields)
        } catch {
            return []
        }
    }
    if (!Array.isArray(arr)) return []

    const out: PassportField[] = []
    for (const raw of arr) {
        if (!raw || typeof raw !== 'object') continue
        const f = raw as Record<string, unknown>
        out.push({
            key: typeof f.key === 'string' ? f.key : '',
            label: typeof f.label === 'string' ? f.label : '',
            value: f.value == null ? '' : String(f.value),
        })
    }
    return out
}

export function stringifyFields(fields: unknown): string {
    if (typeof fields === 'string') return fields
    return JSON.stringify(fields ?? [])
}

/**
 * Validate untrusted `fields` input from a request body. Rejects wrong
 * shapes and oversized content so bad data never reaches the DB (where it
 * would later crash export). Returns normalized fields or an error message.
 */
export function validateFields(
    input: unknown
): { ok: true; fields: PassportField[] } | { ok: false; error: string } {
    if (input == null) return { ok: true, fields: [] }
    if (!Array.isArray(input)) {
        return { ok: false, error: 'fields must be an array' }
    }
    if (input.length > FIELD_LIMITS.maxFields) {
        return { ok: false, error: `Too many fields (max ${FIELD_LIMITS.maxFields})` }
    }

    const fields: PassportField[] = []
    for (const raw of input) {
        if (!raw || typeof raw !== 'object') {
            return { ok: false, error: 'Each field must be an object' }
        }
        const f = raw as Record<string, unknown>
        if (typeof f.key !== 'string' || typeof f.label !== 'string') {
            return { ok: false, error: 'Field key and label must be strings' }
        }
        const value = f.value == null ? '' : f.value
        if (typeof value !== 'string') {
            return { ok: false, error: 'Field value must be a string' }
        }
        if (
            f.key.length > FIELD_LIMITS.maxKeyLength ||
            f.label.length > FIELD_LIMITS.maxLabelLength ||
            value.length > FIELD_LIMITS.maxValueLength
        ) {
            return { ok: false, error: 'Field content exceeds the allowed length' }
        }
        fields.push({ key: f.key, label: f.label, value })
    }
    return { ok: true, fields }
}
