import { NextResponse, type NextRequest } from "next/server";

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

/** Paths that belong on the admin host (dashboard + staff login). */
function isAdminAppPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export function middleware(request: NextRequest): NextResponse {
  const host = hostnameOf(request);
  const { pathname, search } = request.nextUrl;

  // Local dev: keep /admin and /login on the same origin.
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
      // Customer pages don't live on admin.* — send them to the storefront.
      return NextResponse.redirect(new URL(`${pathname}${search}`, webOrigin()));
    }

    return NextResponse.next();
  }

  // Storefront host: keep customers here; move staff tools to admin.*.
  if (isAdminAppPath(pathname)) {
    return NextResponse.redirect(
      new URL(`${pathname}${search}`, adminOrigin()),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
