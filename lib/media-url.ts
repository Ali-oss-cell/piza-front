const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/** Resolve API-relative media paths (e.g. /api/uploads/logos/…) for <img src>. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) {
    return null;
  }

  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function storeMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
