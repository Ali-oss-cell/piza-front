const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const BRAND_HEADER = "x-brand-slug";
const NETWORK_RETRY_ATTEMPTS = 3;
const NETWORK_RETRY_BASE_MS = 350;

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** True for dropped connections / Wi‑Fi blips — not HTTP 4xx/5xx from the API. */
function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return false;
  }

  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    if (error.name === "AbortError") {
      return false;
    }
  }

  if (error instanceof TypeError) {
    return true;
  }

  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return /failed to fetch|networkerror|network changed|err_network|load failed|fetch failed|network interrupted/i.test(
    message,
  );
}

async function withNetworkRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < NETWORK_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const shouldRetry =
        isTransientNetworkError(error) && attempt < NETWORK_RETRY_ATTEMPTS - 1;
      if (!shouldRetry) {
        break;
      }
      await sleep(NETWORK_RETRY_BASE_MS * 2 ** attempt);
    }
  }

  if (isTransientNetworkError(lastError)) {
    throw new TypeError(
      "Network interrupted. Check your connection and try again.",
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries.");
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string; brandSlug?: string } = {},
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

  return withNetworkRetry(async () => {
    const response = await fetch(`${API_BASE}${requestPath}`, {
      ...rest,
      headers,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
      throw new ApiError(
        resolveErrorMessage(body, response.statusText),
        response.status,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  });
}

/** Binary download (PDF, etc.) — same auth/brand headers as apiRequest. */
export async function apiRequestBlob(
  path: string,
  options: RequestInit & { token?: string; brandSlug?: string } = {},
): Promise<Blob> {
  const { token, brandSlug, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (brandSlug) {
    headers.set(BRAND_HEADER, brandSlug);
  }

  const requestPath = brandSlug ? appendBrandQuery(path, brandSlug) : path;

  return withNetworkRetry(async () => {
    const response = await fetch(`${API_BASE}${requestPath}`, {
      ...rest,
      headers,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
      throw new ApiError(
        resolveErrorMessage(body, response.statusText),
        response.status,
      );
    }

    return response.blob();
  });
}
