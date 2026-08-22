import type { MetadataRoute } from "next";
import { fetchSitemapUrls, resolveBrandSlugForRequest, siteOriginFromHost } from "@/lib/seo-server";

export const dynamic = "force-dynamic";

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
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
