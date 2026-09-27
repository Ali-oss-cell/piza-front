/**
 * Parse store tagline into a two-line Classic hero headline.
 * Supports newline, " · ", " — ", " / ", or " | " as separators.
 * Dashboard Tagline is the source of truth — do not hardcode brand slogans.
 */
export function parseHeroHeadline(tagline: string | null | undefined): {
  line1: string;
  line2: string | null;
} | null {
  const raw = tagline?.trim();
  if (!raw) {
    return null;
  }

  const parts = raw
    .split(/\r?\n|(?:\s*[·|/|]\s*)|(?:\s+—\s+)/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { line1: parts[0], line2: parts.slice(1).join(" ") };
  }

  return { line1: raw, line2: null };
}
