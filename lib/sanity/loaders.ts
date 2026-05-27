/**
 * Build-time loaders for list documents.
 *
 * Each loader runs once per locale during `next build` (we use static export),
 * shapes the localized Sanity payload into the flat row shape the existing
 * client components already render, and returns `[]` on failure so the page
 * can fall back to its dict items without crashing the build.
 *
 * Keeping all four loaders in one file means the pages stay readable — they
 * just call `await load*(locale)` alongside the dict fetch.
 */
import type { Locale } from "@/lib/i18n/config";
import { sanityClient } from "./client";
import {
  servicesQuery,
  eventsQuery,
  insightsQuery,
  partnersQuery,
  homepageQuery,
  aboutPageQuery,
  servicesPageQuery,
  eventsPageQuery,
  insightsPageQuery,
  publicationsPageQuery,
  summitBarQuery,
  contactCtaQuery,
  footerContentQuery,
  type ServiceDoc,
  type EventDoc,
  type InsightDoc,
  type PartnerDoc,
  type HomepageDoc,
  type AboutPageDoc,
  type ServicesPageDoc,
  type EventsPageDoc,
  type InsightsPageDoc,
  type PublicationsPageDoc,
  type SummitBarDoc,
  type ContactCtaDoc,
  type FooterContentDoc,
} from "./queries";

/** Flat row shape used by `<Services>`-style components. */
export type ServiceItem = {
  /** Matches the `SERVICE_ICONS` map key in the frontend. */
  id: string;
  title: string;
  body: string;
};

/** Flat row shape used by Events, OnStage, and EventsList. */
export type EventItem = {
  id: string;
  title: string;
  venue: string;
  date: string;
  startsAt: string;
  youtubeId: string;
};

/** Flat row shape used by the insights grid. */
export type InsightItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  href: string;
  /** Unused for now — Sanity insight schema has no image field yet. */
  image: string;
};

/** Picks `field[locale]`, then `field.en`, then `fallback`. */
function pickLoc(
  field: { en?: string; es?: string } | undefined,
  locale: Locale,
  fallback = ""
): string {
  if (!field) return fallback;
  return field[locale] ?? field.en ?? fallback;
}

/** Logs once + returns []. Used so a Sanity outage falls back to dict items. */
function fail<T>(label: string, err: unknown): T[] {
  console.warn(`Sanity ${label} fetch failed; using dict fallback.`, err);
  return [];
}

export async function loadServices(locale: Locale): Promise<ServiceItem[]> {
  try {
    const rows = await sanityClient.fetch<ServiceDoc[]>(servicesQuery);
    return rows
      .map((row) => ({
        // The frontend's icon lookup uses the schema's `iconKey`, not _id —
        // we keep that key as `id` so the existing SERVICE_ICONS[item.id]
        // call site doesn't have to change.
        id: row.iconKey,
        title: pickLoc(row.title, locale),
        body: pickLoc(row.body, locale),
      }))
      .filter((row) => row.title && row.body);
  } catch (err) {
    return fail("services", err);
  }
}

export async function loadEvents(locale: Locale): Promise<EventItem[]> {
  try {
    const rows = await sanityClient.fetch<EventDoc[]>(eventsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        title: pickLoc(row.title, locale),
        venue: pickLoc(row.venue, locale),
        date: pickLoc(row.dateDisplay, locale),
        startsAt: row.startsAt,
        // Components check `youtubeId` for truthiness; empty string means
        // "no recording yet" (mirrors the dict's existing convention).
        youtubeId: row.youtubeId ?? "",
      }))
      .filter((row) => row.title && row.startsAt);
  } catch (err) {
    return fail("events", err);
  }
}

export async function loadInsights(locale: Locale): Promise<InsightItem[]> {
  try {
    const rows = await sanityClient.fetch<InsightDoc[]>(insightsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        title: pickLoc(row.title, locale),
        kind: pickLoc(row.kind, locale),
        date: pickLoc(row.date, locale),
        href: row.href ?? "",
        image: "",
      }))
      .filter((row) => row.title);
  } catch (err) {
    return fail("insights", err);
  }
}

export async function loadPartners(): Promise<string[]> {
  try {
    const rows = await sanityClient.fetch<PartnerDoc[]>(partnersQuery);
    return rows.map((row) => row.name).filter(Boolean);
  } catch (err) {
    return fail("partners", err);
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Homepage singleton
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Resolved homepage content. One slice per consuming component so each can
 * pull in just what it needs without seeing the rest of the page payload.
 * Every leaf is `string | undefined` — `undefined` means "Sanity didn't have
 * this; use the dict fallback at the call site".
 */
export type HomepageContent = {
  hero: {
    eyebrow?: string;
    /** Pre-parsed: words + indices to render in italic-accent. */
    headline?: { words: string[]; emphasis: number[] };
    clarifier?: string;
    sub?: string;
    portraitAlt?: string;
    primaryCta?: string;
    secondaryCta?: string;
  };
  whoWeAre: {
    title?: string;
    lead?: string;
    stepsHeading?: string;
    items?: { title: string; body: string }[];
  };
  assessment: {
    eyebrow?: string;
    title?: string;
    body?: string;
    cta?: string;
    featured?: {
      id?: string;
      title?: string;
      description?: string;
      durationLabel?: string;
      questionsLabel?: string;
      url?: string;
    };
  };
  onStage: { eyebrow?: string; title?: string; body?: string };
  partners: { eyebrow?: string; heading?: string };
  testimonials: { eyebrow?: string; heading?: string };
};

/**
 * Convert a marker-formatted headline string into the `{words, emphasis}`
 * shape `HeroHeadline` already takes. Marker syntax mirrors
 * `HighlightedTitle` (`<<word>>`) so a single source string drives both the
 * brand-promise H1 on the homepage AND the page H1s on /about, /services.
 *
 *   "Human <<experience>> as the operating principle."
 *     → { words: ["Human", "experience", "as", "the", "operating", "principle."],
 *         emphasis: [1] }
 *
 * If an author writes `<<two words>>`, both words become emphasised tokens —
 * the parser preserves the existing per-word reveal animation rather than
 * forcing a single visual span.
 */
function parseEmphasisMarkers(input: string): {
  words: string[];
  emphasis: number[];
} {
  const out: string[] = [];
  const emphasis: number[] = [];

  // Split on the marker pairs; odd indices are emphasised content.
  // "abc <<two words>> def" → ["abc ", "two words", " def"]
  const parts = input.split(/<<([^>]+?)>>/g);
  for (let i = 0; i < parts.length; i++) {
    const tokens = parts[i].trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    const isEmph = i % 2 === 1;
    for (const t of tokens) {
      out.push(t);
      if (isEmph) emphasis.push(out.length - 1);
    }
  }

  return { words: out, emphasis };
}

const pickOpt = (
  field: { en?: string; es?: string } | undefined,
  locale: Locale
): string | undefined => {
  if (!field) return undefined;
  const v = field[locale] ?? field.en;
  return v && v.length > 0 ? v : undefined;
};

export async function loadHomepage(
  locale: Locale
): Promise<HomepageContent | null> {
  try {
    const doc = await sanityClient.fetch<HomepageDoc | null>(homepageQuery);
    if (!doc) return null;

    const heroHeadlineString = pickOpt(doc.heroHeadline, locale);

    return {
      hero: {
        eyebrow: pickOpt(doc.heroEyebrow, locale),
        headline: heroHeadlineString
          ? parseEmphasisMarkers(heroHeadlineString)
          : undefined,
        clarifier: pickOpt(doc.heroClarifier, locale),
        sub: pickOpt(doc.heroSub, locale),
        portraitAlt: pickOpt(doc.heroPortraitAlt, locale),
        primaryCta: pickOpt(doc.heroPrimaryCta, locale),
        secondaryCta: pickOpt(doc.heroSecondaryCta, locale),
      },
      whoWeAre: {
        title: pickOpt(doc.whoWeAreTitle, locale),
        lead: pickOpt(doc.whoWeAreLead, locale),
        stepsHeading: pickOpt(doc.whoWeAreStepsHeading, locale),
        items: doc.whoWeAreItems
          ?.map((it) => ({
            title: pickOpt(it.title, locale) ?? "",
            body: pickOpt(it.body, locale) ?? "",
          }))
          .filter((it) => it.title && it.body),
      },
      assessment: {
        eyebrow: pickOpt(doc.assessmentEyebrow, locale),
        title: pickOpt(doc.assessmentTitle, locale),
        body: pickOpt(doc.assessmentBody, locale),
        cta: pickOpt(doc.assessmentCta, locale),
        featured: doc.assessmentFeatured
          ? {
              id: doc.assessmentFeatured.id,
              title: pickOpt(doc.assessmentFeatured.title, locale),
              description: pickOpt(doc.assessmentFeatured.description, locale),
              durationLabel: pickOpt(
                doc.assessmentFeatured.durationLabel,
                locale
              ),
              questionsLabel: pickOpt(
                doc.assessmentFeatured.questionsLabel,
                locale
              ),
              url: doc.assessmentFeatured.url,
            }
          : undefined,
      },
      onStage: {
        eyebrow: pickOpt(doc.onStageEyebrow, locale),
        title: pickOpt(doc.onStageTitle, locale),
        body: pickOpt(doc.onStageBody, locale),
      },
      partners: {
        eyebrow: pickOpt(doc.partnersEyebrow, locale),
        heading: pickOpt(doc.partnersHeading, locale),
      },
      testimonials: {
        eyebrow: pickOpt(doc.testimonialsEyebrow, locale),
        heading: pickOpt(doc.testimonialsHeading, locale),
      },
    };
  } catch (err) {
    console.warn("Sanity homepage fetch failed; using dict fallback.", err);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * About page singleton
 * ────────────────────────────────────────────────────────────────────────── */

export type AboutPageContent = {
  hero: {
    eyebrow?: string;
    title?: { words: string[]; emphasis: number[] };
    /** Raw marker string — kept so `HighlightedTitle` can render directly. */
    titleRaw?: string;
    body?: string;
    primaryCta?: string;
  };
  mission: { title?: string; body?: string; imageAlt?: string };
  values: {
    title?: string;
    body?: string;
    items?: { title: string; body: string }[];
  };
  experience: {
    title?: string;
    body?: string;
    statValue?: string;
    statLabel?: string;
    statNote?: string;
  };
  founder: {
    eyebrow?: string;
    name?: string;
    bio?: string;
    imageAlt?: string;
    stats?: { value: string; label: string }[];
  };
};

export async function loadAboutPage(
  locale: Locale
): Promise<AboutPageContent | null> {
  try {
    const doc = await sanityClient.fetch<AboutPageDoc | null>(aboutPageQuery);
    if (!doc) return null;

    const titleRaw = pickOpt(doc.pageTitle, locale);
    return {
      hero: {
        eyebrow: pickOpt(doc.pageEyebrow, locale),
        titleRaw,
        title: titleRaw ? parseEmphasisMarkers(titleRaw) : undefined,
        body: pickOpt(doc.pageBody, locale),
        primaryCta: pickOpt(doc.primaryCta, locale),
      },
      mission: {
        title: pickOpt(doc.missionTitle, locale),
        body: pickOpt(doc.missionBody, locale),
        imageAlt: pickOpt(doc.missionImageAlt, locale),
      },
      values: {
        title: pickOpt(doc.valuesTitle, locale),
        body: pickOpt(doc.valuesBody, locale),
        items: doc.valuesItems
          ?.map((it) => ({
            title: pickOpt(it.title, locale) ?? "",
            body: pickOpt(it.body, locale) ?? "",
          }))
          .filter((it) => it.title && it.body),
      },
      experience: {
        title: pickOpt(doc.experienceTitle, locale),
        body: pickOpt(doc.experienceBody, locale),
        statValue: doc.experienceStatValue,
        statLabel: pickOpt(doc.experienceStatLabel, locale),
        statNote: pickOpt(doc.experienceStatNote, locale),
      },
      founder: {
        eyebrow: pickOpt(doc.founderEyebrow, locale),
        name: pickOpt(doc.founderName, locale),
        bio: pickOpt(doc.founderBio, locale),
        imageAlt: pickOpt(doc.founderImageAlt, locale),
        stats: doc.founderStats
          ?.map((s) => ({
            value: s.value ?? "",
            label: pickOpt(s.label, locale) ?? "",
          }))
          .filter((s) => s.value && s.label),
      },
    };
  } catch (err) {
    console.warn("Sanity aboutPage fetch failed; using dict fallback.", err);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Smaller page singletons
 * ────────────────────────────────────────────────────────────────────────── */

export type ServicesPageContent = {
  eyebrow?: string;
  /** Raw marker string for HighlightedTitle. */
  title?: string;
  body?: string;
};

export async function loadServicesPage(
  locale: Locale
): Promise<ServicesPageContent | null> {
  try {
    const doc = await sanityClient.fetch<ServicesPageDoc | null>(
      servicesPageQuery
    );
    if (!doc) return null;
    return {
      eyebrow: pickOpt(doc.eyebrow, locale),
      title: pickOpt(doc.title, locale),
      body: pickOpt(doc.body, locale),
    };
  } catch (err) {
    console.warn("Sanity servicesPage fetch failed; using dict fallback.", err);
    return null;
  }
}

export type EventsPageContent = {
  page: { eyebrow?: string; title?: string; body?: string };
  upcomingHeading?: string;
  pastHeading?: string;
  noUpcoming?: string;
  noPast?: string;
  /** Used by the homepage events block's "view all" link. */
  viewAllLabel?: string;
  /** Section header for the homepage Events block. */
  homepage: { eyebrow?: string; title?: string; body?: string };
  /** Book-Ramon CTA shown beneath /events. */
  book: {
    eyebrow?: string;
    title?: string;
    body?: string;
    cta?: string;
  };
};

export async function loadEventsPage(
  locale: Locale
): Promise<EventsPageContent | null> {
  try {
    const doc = await sanityClient.fetch<EventsPageDoc | null>(eventsPageQuery);
    if (!doc) return null;
    return {
      page: {
        eyebrow: pickOpt(doc.eyebrow, locale),
        title: pickOpt(doc.pageTitle, locale),
        body: pickOpt(doc.pageBody, locale),
      },
      upcomingHeading: pickOpt(doc.upcomingHeading, locale),
      pastHeading: pickOpt(doc.pastHeading, locale),
      noUpcoming: pickOpt(doc.noUpcoming, locale),
      noPast: pickOpt(doc.noPast, locale),
      viewAllLabel: pickOpt(doc.viewAllLabel, locale),
      homepage: {
        eyebrow: pickOpt(doc.homepageEyebrow, locale),
        title: pickOpt(doc.homepageTitle, locale),
        body: pickOpt(doc.homepageBody, locale),
      },
      book: {
        eyebrow: pickOpt(doc.bookEyebrow, locale),
        title: pickOpt(doc.bookTitle, locale),
        body: pickOpt(doc.bookBody, locale),
        cta: pickOpt(doc.bookCta, locale),
      },
    };
  } catch (err) {
    console.warn("Sanity eventsPage fetch failed; using dict fallback.", err);
    return null;
  }
}

export type InsightsPageContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  listTitle?: string;
  readLabel?: string;
};

export async function loadInsightsPage(
  locale: Locale
): Promise<InsightsPageContent | null> {
  try {
    const doc = await sanityClient.fetch<InsightsPageDoc | null>(
      insightsPageQuery
    );
    if (!doc) return null;
    return {
      eyebrow: pickOpt(doc.eyebrow, locale),
      title: pickOpt(doc.title, locale),
      body: pickOpt(doc.body, locale),
      listTitle: pickOpt(doc.listTitle, locale),
      readLabel: pickOpt(doc.readLabel, locale),
    };
  } catch (err) {
    console.warn("Sanity insightsPage fetch failed; using dict fallback.", err);
    return null;
  }
}

export type PublicationsPageContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  listTitle?: string;
  downloadLabel?: string;
  newsletter?: { title?: string; body?: string; submit?: string };
};

export async function loadPublicationsPage(
  locale: Locale
): Promise<PublicationsPageContent | null> {
  try {
    const doc = await sanityClient.fetch<PublicationsPageDoc | null>(
      publicationsPageQuery
    );
    if (!doc) return null;
    return {
      eyebrow: pickOpt(doc.eyebrow, locale),
      title: pickOpt(doc.title, locale),
      body: pickOpt(doc.body, locale),
      listTitle: pickOpt(doc.listTitle, locale),
      downloadLabel: pickOpt(doc.downloadLabel, locale),
      newsletter: doc.newsletter
        ? {
            title: pickOpt(doc.newsletter.title, locale),
            body: pickOpt(doc.newsletter.body, locale),
            submit: pickOpt(doc.newsletter.submit, locale),
          }
        : undefined,
    };
  } catch (err) {
    console.warn(
      "Sanity publicationsPage fetch failed; using dict fallback.",
      err
    );
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Chrome singletons (loaded by the locale layout, consumed everywhere)
 * ────────────────────────────────────────────────────────────────────────── */

export type SummitBarContent = {
  enabled?: boolean;
  label?: string;
  text?: string;
  cta?: string;
  ctaUrl?: string;
};

export async function loadSummitBar(
  locale: Locale
): Promise<SummitBarContent | null> {
  try {
    const doc = await sanityClient.fetch<SummitBarDoc | null>(summitBarQuery);
    if (!doc) return null;
    return {
      enabled: doc.enabled,
      label: pickOpt(doc.label, locale),
      text: pickOpt(doc.text, locale),
      cta: pickOpt(doc.cta, locale),
      ctaUrl: doc.ctaUrl,
    };
  } catch (err) {
    console.warn("Sanity summitBar fetch failed; using dict fallback.", err);
    return null;
  }
}

export type ContactCtaContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  openModalLabel?: string;
  modalTitle?: string;
  modalClose?: string;
  topicLabel?: string;
  topicOptions?: string[];
  messageLabel?: string;
  messagePlaceholder?: string;
  submit?: string;
};

export async function loadContactCta(
  locale: Locale
): Promise<ContactCtaContent | null> {
  try {
    const doc = await sanityClient.fetch<ContactCtaDoc | null>(contactCtaQuery);
    if (!doc) return null;
    return {
      eyebrow: pickOpt(doc.eyebrow, locale),
      title: pickOpt(doc.title, locale),
      body: pickOpt(doc.body, locale),
      openModalLabel: pickOpt(doc.openModalLabel, locale),
      modalTitle: pickOpt(doc.modalTitle, locale),
      modalClose: pickOpt(doc.modalClose, locale),
      topicLabel: pickOpt(doc.topicLabel, locale),
      topicOptions: doc.topicOptions
        ?.map((o) => pickOpt(o, locale) ?? "")
        .filter(Boolean),
      messageLabel: pickOpt(doc.messageLabel, locale),
      messagePlaceholder: pickOpt(doc.messagePlaceholder, locale),
      submit: pickOpt(doc.submit, locale),
    };
  } catch (err) {
    console.warn("Sanity contactCta fetch failed; using dict fallback.", err);
    return null;
  }
}

export type FooterContent = {
  brandTagline?: string;
  kindToday?: string;
  exploreHeading?: string;
  connectHeading?: string;
  contactHeading?: string;
  contactEmail?: string;
  privacyTitle?: string;
  privacyLinkLabel?: string;
  rights?: string;
  /**
   * Resolved into a `{ platform → url }` map so the Footer can index by the
   * platform key it already uses for icon lookup.
   */
  social?: { linkedin?: string; youtube?: string; twitter?: string; instagram?: string };
};

export async function loadFooter(
  locale: Locale
): Promise<FooterContent | null> {
  try {
    const doc = await sanityClient.fetch<FooterContentDoc | null>(
      footerContentQuery
    );
    if (!doc) return null;
    const social: FooterContent["social"] = {};
    for (const link of doc.socialLinks ?? []) {
      const key = link.platform as keyof NonNullable<FooterContent["social"]>;
      if (key && link.url) social[key] = link.url;
    }
    return {
      brandTagline: pickOpt(doc.brandTagline, locale),
      kindToday: pickOpt(doc.kindToday, locale),
      exploreHeading: pickOpt(doc.exploreHeading, locale),
      connectHeading: pickOpt(doc.connectHeading, locale),
      contactHeading: pickOpt(doc.contactHeading, locale),
      contactEmail: doc.contactEmail,
      privacyTitle: pickOpt(doc.privacyTitle, locale),
      privacyLinkLabel: pickOpt(doc.privacyLinkLabel, locale),
      rights: pickOpt(doc.rights, locale),
      social: Object.keys(social).length > 0 ? social : undefined,
    };
  } catch (err) {
    console.warn("Sanity footer fetch failed; using dict fallback.", err);
    return null;
  }
}
