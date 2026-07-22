export function sanitizePublicHttpsUrl(
  value: unknown,
  allowedHosts?: ReadonlySet<string>,
): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:'
      || url.username !== ''
      || url.password !== ''
      || (allowedHosts !== undefined && !allowedHosts.has(url.hostname))
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
