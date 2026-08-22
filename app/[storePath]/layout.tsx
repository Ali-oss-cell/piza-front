import type { Metadata } from "next";
import { resolveStoreByPath } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  siteOriginFromHost,
} from "@/lib/seo-server";
import { getRequestHost } from "@/lib/request-host";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ storePath: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storePath: string }>;
}): Promise<Metadata> {
  const { storePath } = await params;
  const host = await getRequestHost();

  try {
    const store = await resolveStoreByPath(storePath);
    const seo = await fetchSeoForPage(store.slug, "home", host || undefined);
    return buildSeoMetadata(
      seo,
      {
        title: `${store.name}${store.tagline ? ` | ${store.tagline}` : ""}`,
        description: store.tagline ?? `Order from ${store.name}`,
      },
      siteOriginFromHost(host),
    );
  } catch {
    return {
      title: "Store not found",
    };
  }
}

export default async function StorefrontLayout({
  children,
}: StorefrontLayoutProps): Promise<React.ReactElement> {
  return <>{children}</>;
}
