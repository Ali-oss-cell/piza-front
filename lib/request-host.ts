import { headers } from "next/headers";

/** Request hostname behind Traefik (no port). */
export async function getRequestHost(): Promise<string> {
  const headerStore = await headers();
  const raw =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "";
  return raw.split(",")[0]?.trim().toLowerCase().split(":")[0] ?? "";
}

export function isPrimaryWebHost(host: string): boolean {
  if (!host) {
    return true;
  }
  const primary = (
    process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "https://marinapizzas.com.au"
  )
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    ?.toLowerCase();
  const www = primary?.startsWith("www.")
    ? primary.slice(4)
    : primary
      ? `www.${primary}`
      : "";
  return host === primary || host === www || host === "localhost" || host === "127.0.0.1";
}
