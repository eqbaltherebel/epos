/** Small helpers shared across components. */

export interface Option {
  value: string;
  label: string;
}

/**
 * Normalise the many shapes the Spring dropdown endpoints return
 * (arrays of strings, or objects with code/name-ish keys) into {value,label}.
 */
export function normalizeOptions(raw: unknown[] | null | undefined): Option[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (item == null) return { value: '', label: '' };
    if (typeof item === 'string' || typeof item === 'number') {
      return { value: String(item), label: String(item) };
    }
    const obj = item as Record<string, unknown>;
    const keys = Object.keys(obj);
    const valueKey =
      keys.find((k) => /code|id|value|_cd$/i.test(k)) ?? keys[0];
    const labelKey =
      keys.find((k) => /name|label|text|desc/i.test(k)) ?? keys[keys.length - 1];
    return {
      value: String(obj[valueKey] ?? ''),
      label: String(obj[labelKey] ?? obj[valueKey] ?? ''),
    };
  });
}

/** Detect a base64-encoded image and return a data-URI, else null. */
export function toImageDataUri(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (s.startsWith('data:image')) return s;
  if (s.length < 200) return null;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(s)) return null;
  const cleaned = s.replace(/\s+/g, '');
  if (cleaned.startsWith('iVBORw0')) return `data:image/png;base64,${cleaned}`;
  if (cleaned.startsWith('/9j/')) return `data:image/jpeg;base64,${cleaned}`;
  if (cleaned.startsWith('R0lGOD')) return `data:image/gif;base64,${cleaned}`;
  if (cleaned.startsWith('PHN2Zy') || cleaned.startsWith('PD94bWw'))
    return `data:image/svg+xml;base64,${cleaned}`;
  if (cleaned.startsWith('UklGR')) return `data:image/webp;base64,${cleaned}`;
  return null;
}

/** Extract every base64 image field from a header/footer object, in key order. */
export function extractLogos(info: Record<string, unknown> | undefined | null): string[] {
  if (!info) return [];
  const out: string[] = [];
  for (const key of Object.keys(info)) {
    const uri = toImageDataUri(info[key]);
    if (uri) out.push(uri);
  }
  return out;
}

/** Normalise a report response into { columns, rows }. */
export function toTable(data: unknown): { columns: string[]; rows: Array<Record<string, unknown>> } {
  let rows: Array<Record<string, unknown>> = [];
  if (Array.isArray(data)) {
    rows = data.filter((r) => r && typeof r === 'object') as Array<Record<string, unknown>>;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    // Common envelopes: { data: [...] } or first array-valued property.
    const arr =
      (Array.isArray(obj['data']) && (obj['data'] as unknown[])) ||
      Object.values(obj).find((v) => Array.isArray(v));
    if (Array.isArray(arr)) {
      rows = arr.filter((r) => r && typeof r === 'object') as Array<Record<string, unknown>>;
    }
  }
  const columns: string[] = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!columns.includes(k)) columns.push(k);
  return { columns, rows };
}

/** Prettify a snake/camel case key into a table header label. */
export function humanize(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
