import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The API host's firewall blocks an IP that sends a burst of requests: prerender with one
  // worker and few pages at a time so the build reads the API gently (see lib/api.ts).
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 2,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Local escape hatch for slow connections to the CDN (the optimizer times out); never set on Vercel.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "1",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.toubkal-peaks.com" },
    ],
  },
};

export default nextConfig;
