import type { MetadataRoute } from "next";
import { resolveBrandSlugForRequest, siteOriginFromHost } from "@/lib/seo-server";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/seo-login",
        "/seo-dashboard",
        "/admin",
        "/login",
        "/checkout",
        "/cart",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ""),
  };
}
