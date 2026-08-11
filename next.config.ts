import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.0.110"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
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
