import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin host split (admin.* vs storefront) is disabled until DNS/domains
 * are ready. Staff use https://marinapizzas.com.au/admin/dashboard on the
 * same host as the storefront.
 *
 * To re-enable later: set NEXT_PUBLIC_ADMIN_HOST_SPLIT=true and rebuild web
 * with NEXT_PUBLIC_ADMIN_HOST / NEXT_PUBLIC_ADMIN_ORIGIN / NEXT_PUBLIC_WEB_ORIGIN.
 */
const DEFAULT_ADMIN_HOST = "admin.marinapizzas.com.au";
const DEFAULT_WEB_ORIGIN = "https://marinapizzas.com.au";
const DEFAULT_ADMIN_ORIGIN = "https://admin.marinapizzas.com.au";

function hostnameOf(request: NextRequest): string {
  const raw =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  return raw.split(":")[0]?.trim().toLowerCase() ?? "";
}

function isAdminHostname(host: string): boolean {
  const configured = (
    process.env.NEXT_PUBLIC_ADMIN_HOST ?? DEFAULT_ADMIN_HOST
  )
    .trim()
    .toLowerCase();
  return host === configured || host.startsWith("admin.");
}

function isLocalHost(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local")
  );
}

function adminOrigin(): string {
  return (process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? DEFAULT_ADMIN_ORIGIN).replace(
    /\/$/,
    "",
  );
}

function webOrigin(): string {
  return (process.env.NEXT_PUBLIC_WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN).replace(
    /\/$/,
    "",
  );
}

function isAdminAppPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

function hostSplitEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_HOST_SPLIT ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

function shouldSkipRedirectLookup(pathname: string): boolean {
  return (
    pathname.startsWith("/seo-dashboard") ||
    pathname.startsWith("/seo-login") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  );
}

async function resolveSeoRedirect(
  host: string,
  pathname: string,
): Promise<string | null> {
  if (!host || shouldSkipRedirectLookup(pathname)) {
    return null;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!apiBase) {
    return null;
  }

  try {
    const url = `${apiBase}/seo/redirects/resolve?host=${encodeURIComponent(host)}&path=${encodeURIComponent(pathname)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as { toPath?: string } | null;
    return body?.toPath ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const host = hostnameOf(request);
  const { pathname, search } = request.nextUrl;

  const legacyStorePaths = ["/bunny-boys", "/leovorno"];
  if (
    legacyStorePaths.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(bunny-boys|leovorno)/, "") || "/";
    return NextResponse.redirect(url, 301);
  }

  const redirectTo = await resolveSeoRedirect(host, pathname);
  if (redirectTo) {
    const target = redirectTo.startsWith("http")
      ? redirectTo
      : new URL(`${redirectTo}${search}`, request.url).toString();
    return NextResponse.redirect(target, 301);
  }

  // Default: same-origin admin (old domain style).
  if (!hostSplitEnabled()) {
    return NextResponse.next();
  }

  if (!host || isLocalHost(host)) {
    return NextResponse.next();
  }

  const onAdminHost = isAdminHostname(host);

  if (onAdminHost) {
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    if (!isAdminAppPath(pathname)) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, webOrigin()));
    }

    return NextResponse.next();
  }

  if (isAdminAppPath(pathname)) {
    return NextResponse.redirect(
      new URL(`${pathname}${search}`, adminOrigin()),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
