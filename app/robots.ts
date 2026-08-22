import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/seo-login", "/seo-dashboard", "/admin", "/login", "/checkout", "/cart"],
    },
  };
}
