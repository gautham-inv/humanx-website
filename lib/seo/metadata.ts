import type { Metadata } from "next";

/**
 * Canonical production origin. Every canonical + hreflang + og:url resolves
 * against this, NOT the deployment host — so the staging *.pages.dev build
 * still points search engines at the production domain. Keep in sync with the
 * domain the site is actually promoted to.
 */
export const SITE_URL = "https://humanxinsights.com";
export const SITE_NAME = "HumanX Insights";

/** Site-wide social share card (public/og.png, 1200×630). */
const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og.png`,
  alt: "HumanX — Human experience as the operating principle",
  width: 1200,
  height: 630,
};

type PageMetaArgs = {
  locale: string;
  /** Path under the locale, with leading slash. "" for the locale homepage. */
  path?: string;
  title: string;
  description: string;
  /** Page-specific social images. Omit to inherit the site-wide og image. */
  images?: { url: string; alt?: string }[];
};

/**
 * Single source of truth for per-page metadata. Produces title, description,
 * the canonical + en/es/x-default hreflang cluster, and matching OpenGraph +
 * Twitter tags. When `images` is omitted the route inherits the site-wide
 * `app/opengraph-image` / `app/twitter-image` generated card.
 */
export function pageMetadata({
  locale,
  path = "",
  title,
  description,
  images,
}: PageMetaArgs): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;
  const ogImages = images ?? [DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        en: `/en${path}`,
        es: `/es${path}`,
        "x-default": `/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title,
      description,
      locale: locale === "es" ? "es_ES" : "en_US",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}
