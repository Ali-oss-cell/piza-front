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
        "/admin",
        "/login",
        "/seo-login",
        "/seo-dashboard",
        "/checkout",
        "/cart",
        "/account",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ""),
  };
}
