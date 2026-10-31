import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Everything public may be crawled (search engines and AI assistants alike); the team admin and the API routes not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/revalidate"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
