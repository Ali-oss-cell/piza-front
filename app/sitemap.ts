import type { MetadataRoute } from "next";
import { fetchSitemapUrls, resolveBrandSlugForRequest, siteOriginFromHost } from "@/lib/seo-server";

export const dynamic = "force-dynamic";

/** Customer-facing routes used when the SEO API is unreachable. */
const FALLBACK_PATHS = [
  "",
  "/menu",
  "/order-online",
  "/deals",
  "/catering",
  "/locations",
  "/about",
  "/contact",
  "/delivery",
  "/gallery",
  "/reviews",
  "/functions",
  "/loyalty",
  "/gift-cards",
  "/blog",
  "/careers",
  "/faq",
  "/nutrition",
  "/allergens",
  "/privacy",
  "/terms",
  "/track-order",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const baseUrl = siteOriginFromHost(host);

  try {
    const urls = await fetchSitemapUrls(brandSlug, baseUrl, host);
    return urls.map((entry) => ({
      url: entry.loc,
      lastModified: entry.lastmod ? new Date(entry.lastmod) : new Date(),
      changeFrequency: "weekly" as const,
      priority: entry.loc === baseUrl || entry.loc === `${baseUrl}/` ? 1 : 0.7,
    }));
  } catch {
    return FALLBACK_PATHS.map((path) => ({
      url: path ? `${baseUrl}${path}` : baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }));
  }
}
