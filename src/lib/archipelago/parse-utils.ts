import type { LocalizedText } from './model.ts';

const PUBLIC_ID = /^[a-z][a-z0-9-]{1,63}$/;
const PRESENTATION_KEY = /^[a-z][a-z0-9-]{1,63}$/;
const SEMANTIC_VERSION = /^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

const FORBIDDEN_PUBLIC_TEXT = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\/Users\/|\/home\/|[A-Z]:\\)/i,
  /(?:^|[\/\\])\.env(?:\b|[./\\])/i,
  /\b[0-9a-f]{7,40}\b/i,
  /\b(?:(?:feature|hotfix|bugfix|release)\/|refs\/heads\/|worktree)\S*/i,
  /\b(?:api[_-]?key|secret|token|password|passwd|authorization)\s*[:=]\s*[^\s]+/i,
  /\b(?:sk|ghp|github_pat)-[A-Z0-9_-]{8,}\b/i,
  /\bBearer\s+[A-Z0-9._~-]{8,}\b/i,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\beyJ[A-Z0-9_-]{8,}\.[A-Z0-9_-]{8,}\.[A-Z0-9_-]{8,}\b/i,
  /(?:^|\s)\/(?:etc|opt|private|srv|tmp|var)\/\S+/i,
  /\b(?:https?:\/\/|github\.com\/)\S+/i,
  /(?:매출|사용자\s*수|고객\s*수|revenue|customer\s+count|user\s+count)/i,
  /\b(?:prompt|command)\s*[:=]/i,
  /<[^>]+>/,
  /!?\[[^\]]*\]\([^)]*\)/,
  /`/,
] as const;

export function isRecord(
  value: unknown,
): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return (
    actual.length === sortedExpected.length &&
    actual.every((key, index) => key === sortedExpected[index])
  );
}

export function readOneOf<const Options extends readonly string[]>(
  value: unknown,
  options: Options,
): Options[number] | null {
  if (typeof value !== 'string') return null;
  for (const option of options) {
    if (value === option) return option;
  }
  return null;
}

export function readPublicId(value: unknown): string | null {
  return typeof value === 'string' && PUBLIC_ID.test(value) ? value : null;
}

export function readPresentationKey(value: unknown): string | null {
  return typeof value === 'string' && PRESENTATION_KEY.test(value) ? value : null;
}

export function readSemanticVersion(value: unknown): string | null {
  return typeof value === 'string' && SEMANTIC_VERSION.test(value) ? value : null;
}

export function readInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  return Number.isInteger(value) &&
    typeof value === 'number' &&
    value >= minimum &&
    value <= maximum
    ? value
    : null;
}

export function readFiniteNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum
    ? value
    : null;
}

export function readIsoInstant(value: unknown): string | null {
  if (typeof value !== 'string' || !ISO_INSTANT.test(value)) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  const normalizedInput = value.includes('.') ? value : value.replace('Z', '.000Z');
  return new Date(timestamp).toISOString() === normalizedInput ? value : null;
}

export function readPublicText(value: unknown, maximum: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maximum) return null;
  return FORBIDDEN_PUBLIC_TEXT.some((pattern) => pattern.test(normalized))
    ? null
    : normalized;
}

export function readLocalizedText(
  value: unknown,
  maximum: number,
): LocalizedText | null {
  if (!isRecord(value) || !hasExactKeys(value, ['ko', 'en'])) return null;
  const ko = readPublicText(value.ko, maximum);
  const en = readPublicText(value.en, maximum);
  return ko === null || en === null ? null : { ko, en };
}
