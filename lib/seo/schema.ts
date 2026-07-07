import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import type { EventItem, InsightItem, VideoItem } from "@/lib/sanity/loaders";

/**
 * Schema.org JSON-LD builders. Rendered via <JsonLd> as
 * <script type="application/ld+json"> blocks. Org + Person + WebSite go
 * site-wide in the locale layout; Event goes on each event detail page.
 */

const SAME_AS = [
  "https://www.linkedin.com/company/humanx-insights",
  "https://www.youtube.com/@humanxinsights",
  "https://twitter.com/humanxinsights",
  "https://www.instagram.com/humanxinsights",
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    sameAs: SAME_AS,
    founder: { "@type": "Person", name: "Ramon Portilla" },
  };
}

export function personSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ramon Portilla",
    jobTitle: "Founder, Speaker & Advisor",
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    url: `${SITE_URL}/${locale}/about`,
    description:
      "30+ years of CX/EX and analytics expertise across retail, social media and various industries. Pioneer of human-experience strategy with proven business results.",
    knowsAbout: [
      "Customer Experience",
      "Employee Experience",
      "Data & Analytics",
      "Human-centered AI strategy",
    ],
  };
}

export function websiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "es" ? "es" : "en",
  };
}

export function eventSchema(event: EventItem, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    ...(event.startsAt ? { startDate: event.startsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.venue
      ? { location: { "@type": "Place", name: event.venue } }
      : {}),
    ...(event.summary ? { description: event.summary } : {}),
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    url: `${SITE_URL}/${locale}/events/${event.slug}`,
    organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    performer: { "@type": "Person", name: "Ramon Portilla" },
  };
}

/**
 * `Article` JSON-LD for an /insights/[slug] page. `description` truncates
 * the body to ~200 chars — search engines re-truncate anyway, this just
 * keeps the emitted JSON small.
 */
export function articleSchema(insight: InsightItem, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.body.slice(0, 200),
    ...(insight.image ? { image: insight.image } : {}),
    ...(insight.publishedAt ? { datePublished: insight.publishedAt } : {}),
    url: `${SITE_URL}/${locale}/insights/${insight.slug}`,
    inLanguage: locale === "es" ? "es" : "en",
    author: { "@type": "Person", name: "Ramon Portilla" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/**
 * One `Service` node per practice on /services. Accepts the same flat
 * `{ title, body }` rows the page already renders, so it works whether the
 * list came from Sanity or the dict fallback.
 */
export function servicesSchema(
  items: ReadonlyArray<{ title: string; body: string }>,
  locale: string
) {
  return items.map((item) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: item.title,
    description: item.body,
    serviceType: item.title,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "Worldwide",
    url: `${SITE_URL}/${locale}/services`,
  }));
}

/**
 * `VideoObject` for a YouTube-hosted talk. Thumbnail + embed/content URLs are
 * derived from the YouTube id. `uploadDate` is only emitted when the video doc
 * carries `publishedAt` — it's the one field Google requires for video rich
 * results, so authors should set it in Sanity to unlock eligibility.
 */
export function videoObjectSchema(video: VideoItem) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.summary || video.caption || video.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    ...(video.publishedAt ? { uploadDate: video.publishedAt } : {}),
  };
}
