import type { Metadata } from "next";
import { apiRequest } from "@/lib/api-client";
import { resolveStoreByHost } from "@/lib/menu-api";
import { getRequestHost, isPrimaryWebHost } from "@/lib/request-host";
import type { SeoContentResponse } from "@/lib/seo-api";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

export async function resolveBrandSlugForRequest(): Promise<{
  brandSlug: string;
  host: string;
}> {
  const host = await getRequestHost();
  if (!host || isPrimaryWebHost(host)) {
    return { brandSlug: DEFAULT_BRAND_SLUG, host: host || "marinapizzas.com.au" };
  }

  try {
    const store = await resolveStoreByHost(host);
    return { brandSlug: store.slug, host };
  } catch {
    return { brandSlug: DEFAULT_BRAND_SLUG, host };
  }
}

export function siteOriginFromHost(host: string): string {
  const configured = process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "https://marinapizzas.com.au";
  if (!host || isPrimaryWebHost(host)) {
    return configured.replace(/\/$/, "");
  }
  return `https://${host}`;
}

export async function fetchSeoForPage(
  brandSlug: string,
  page: string,
  host?: string,
): Promise<SeoContentResponse> {
  const params = new URLSearchParams({ brand: brandSlug, page });
  if (host) {
    params.set("host", host);
  }
  return apiRequest<SeoContentResponse>(`/seo/content?${params.toString()}`);
}

export function buildSeoMetadata(
  seo: SeoContentResponse,
  fallback: { title: string; description: string },
  baseUrl?: string,
): Metadata {
  const title = seo.meta.title || fallback.title;
  const description = seo.meta.description || fallback.description;

  return {
    metadataBase: baseUrl ? new URL(baseUrl) : undefined,
    title,
    description,
    keywords: seo.meta.keywords ?? undefined,
    robots: seo.meta.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      images: seo.meta.ogImageUrl ? [{ url: seo.meta.ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.meta.ogImageUrl ? [seo.meta.ogImageUrl] : undefined,
    },
  };
}

export async function fetchSitemapUrls(
  brandSlug: string,
  baseUrl: string,
  host?: string,
): Promise<Array<{ loc: string; lastmod?: string }>> {
  const params = new URLSearchParams({
    brand: brandSlug,
    baseUrl,
  });
  if (host) params.set("host", host);

  const data = await apiRequest<{ urls: Array<{ loc: string; lastmod?: string }> }>(
    `/seo/sitemap-data?${params.toString()}`,
  );
  return data.urls;
}
