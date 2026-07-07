const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const BRAND_HEADER = "x-brand-slug";

interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function resolveErrorMessage(body: ApiErrorBody, fallback: string): string {
  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  return body.message ?? fallback;
}

function appendBrandQuery(path: string, brandSlug?: string): string {
  if (!brandSlug) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}brand=${encodeURIComponent(brandSlug)}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string; brandSlug?: string } = {}
): Promise<T> {
  const { token, brandSlug, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (brandSlug) {
    headers.set(BRAND_HEADER, brandSlug);
  }

  const requestPath = brandSlug ? appendBrandQuery(path, brandSlug) : path;

  const response = await fetch(`${API_BASE}${requestPath}`, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(resolveErrorMessage(body, response.statusText), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
