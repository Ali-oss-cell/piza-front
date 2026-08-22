import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

function apiImagePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "lh3.googleusercontent.com" },
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "tb-static.uber.com" },
    { protocol: "https", hostname: "api.marinapizzas.com.au" },
    { protocol: "https", hostname: "marinapizzas.com.au" },
    { protocol: "https", hostname: "www.marinapizzas.com.au" },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const { hostname, protocol } = new URL(apiUrl.replace(/\/api\/?$/, ""));
      if (hostname && !patterns.some((p) => p.hostname === hostname)) {
        patterns.push({
          protocol: protocol.replace(":", "") as "http" | "https",
          hostname,
        });
      }
    } catch {
      // ignore invalid env at build time
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.0.110"],
  images: {
    remotePatterns: apiImagePatterns(),
  },
};

export default withSentryConfig(nextConfig, {
  // Error capture works with DSN alone; source maps need SENTRY_AUTH_TOKEN later.
  silent: true,
  sourcemaps: {
    disable: true,
  },
  widenClientFileUpload: false,
});
