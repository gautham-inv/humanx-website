import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";

// Required for `output: "export"` — render this route to a static file.
export const dynamic = "force-static";

/**
 * Generated /robots.txt. Allows all crawlers and points them at the sitemap.
 *
 * Note: Cloudflare's "managed robots.txt" (AI content signals) may be enabled
 * on the Pages project and can append/override this file at the edge. If the
 * deployed /robots.txt is missing the Sitemap line, disable the managed
 * robots.txt in the Cloudflare dashboard so this generated file is served.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
