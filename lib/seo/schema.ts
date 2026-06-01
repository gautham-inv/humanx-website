import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import type { EventItem } from "@/lib/sanity/loaders";

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
