import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/metadata";
import { locales } from "@/lib/i18n/config";
import { loadEvents } from "@/lib/sanity/loaders";

/**
 * Static sitemap, generated at build (`output: "export"` renders this to
 * /sitemap.xml). Emits every locale URL with its en/es/x-default hreflang
 * cluster, mirroring the on-page <link rel="alternate"> tags. Event detail
 * pages are enumerated from Sanity; a build-time outage degrades to the
 * static routes only.
 */

const STATIC_PATHS = [
  "",
  "/services",
  "/about",
  "/insights",
  "/publications",
  "/events",
  "/on-stage",
  "/privacy",
] as const;

// Required for `output: "export"` — render this route to a static file.
export const dynamic = "force-static";

function alternates(path: string) {
  return {
    languages: {
      en: `${SITE_URL}/en${path}`,
      es: `${SITE_URL}/es${path}`,
      "x-default": `${SITE_URL}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/privacy" ? 0.3 : 0.8,
        alternates: alternates(path),
      });
    }
  }

  try {
    const events = await loadEvents("en");
    for (const ev of events) {
      if (!ev.slug) continue;
      const path = `/events/${ev.slug}`;
      for (const locale of locales) {
        entries.push({
          url: `${SITE_URL}/${locale}${path}`,
          lastModified: ev.startsAt ? new Date(ev.startsAt) : now,
          changeFrequency: "yearly",
          priority: 0.6,
          alternates: alternates(path),
        });
      }
    }
  } catch {
    // Sanity unreachable at build — ship the static routes only.
  }

  return entries;
}
