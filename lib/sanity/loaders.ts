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
import type { Recommendation } from "@/lib/data/recommendations";
import { sanityClient } from "./client";
import {
  servicesQuery,
  eventsQuery,
  insightsQuery,
  partnersQuery,
  clientsQuery,
  conferencesQuery,
  videosQuery,
  recommendationsQuery,
  publicationsQuery,
  homepageQuery,
  aboutPageQuery,
  servicesPageQuery,
  eventsPageQuery,
  onStagePageQuery,
  insightsPageQuery,
  publicationsPageQuery,
  summitBarQuery,
  contactCtaQuery,
  footerContentQuery,
  downloadPromoQuery,
  type ServiceDoc,
  type EventDoc,
  type InsightDoc,
  type PartnerDoc,
  type ClientDoc,
  type ConferenceDoc,
  type VideoDoc,
  type RecommendationDoc,
  type PublicationDoc,
  type HomepageDoc,
  type AboutPageDoc,
  type ServicesPageDoc,
  type EventsPageDoc,
  type OnStagePageDoc,
  type InsightsPageDoc,
  type PublicationsPageDoc,
  type SummitBarDoc,
  type ContactCtaDoc,
  type FooterContentDoc,
  type DownloadPromoDoc,
} from "./queries";

/** Flat row shape used by `<Services>`-style components. */
export type ServiceItem = {
  /** Matches the `SERVICE_ICONS` map key in the frontend. */
  id: string;
  title: string;
  body: string;
};

/** Flat row shape used by Events, EventsList, and the /events/[slug] page. */
export type EventItem = {
  id: string;
  /** URL path segment. Empty when author hasn't set a slug — listings then
   * fall back to a non-linked card. */
  slug: string;
  title: string;
  venue: string;
  date: string;
  startsAt: string;
  /** Optional teaser; empty when not set. */
  summary: string;
  /** Full body for the detail page; empty when not set. */
  body: string;
  youtubeId: string;
  /**
   * External URL the card links to. Empty string means "non-clickable card"
   * — Events.tsx / EventsList.tsx render a plain article when this is empty.
   */
  registrationUrl: string;
  /** Sanity CDN URL of the hero image; empty when none uploaded. */
  imageUrl: string;
  imageAlt: string;
};

/** Flat row shape used by the insights grid. */
export type InsightItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  href: string;
  /**
   * Resolved CDN URL of the Sanity-hosted card image, or empty string when
   * the author hasn't uploaded one yet. `app/[locale]/insights/page.tsx`
   * keys off truthiness here to switch between real <Image> and the
   * decorative brand-token fallback tile.
   */
  image: string;
  /** Optional alt text from Sanity; falls back to the insight title. */
  imageAlt: string;
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
        slug: row.slug ?? "",
        title: pickLoc(row.title, locale),
        venue: pickLoc(row.venue, locale),
        date: pickLoc(row.dateDisplay, locale),
        startsAt: row.startsAt,
        summary: pickLoc(row.summary, locale),
        body: pickLoc(row.body, locale),
        // `youtubeId` only embeds a player on the detail page now — the
        // homepage "On stage" grid reads from the separate `video` doc type.
        youtubeId: row.youtubeId ?? "",
        // Empty string = no external CTA. Listing cards prefer the internal
        // /events/[slug] route; the detail page's Register button uses this.
        registrationUrl: row.registrationUrl ?? "",
        imageUrl: row.imageUrl ?? "",
        imageAlt: row.imageAlt ?? "",
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
        // Sanity CDN URL (resolved in the GROQ projection via
        // `image.asset->url`). Empty string falls back to the brand-token
        // decorative tile in `app/[locale]/insights/page.tsx`.
        image: row.imageUrl ?? "",
        imageAlt: row.imageAlt ?? "",
      }))
      .filter((row) => row.title);
  } catch (err) {
    return fail("insights", err);
  }
}

/**
 * Flat row shape used by `<LogoTicker>`. The component renders the logo
 * `<img>` when `logoUrl` is set, falling back to the brand name as text so
 * partners without uploaded logos still appear in the ticker.
 */
export type PartnerItem = {
  id: string;
  name: string;
  /** Empty string when no website set — ticker treats as non-link. */
  website: string;
  /** Dark-theme logo URL. Empty when none uploaded. */
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  /** Light-theme logo URL. Empty when none uploaded — component then
   * uses the dark logo in both themes. */
  logoLightUrl: string;
  logoLightWidth: number;
  logoLightHeight: number;
};

/** Flat row shape used by the homepage `<OnStage>` video grid. */
export type VideoItem = {
  id: string;
  title: string;
  caption: string;
  /** One-sentence talk summary — maps to VideoObject `description`.
   * Empty when the author hasn't written one; schema then falls back to
   * the caption. */
  summary: string;
  youtubeId: string;
  /** ISO date the talk was published — maps to VideoObject `uploadDate`.
   * Empty when the author hasn't set it on the Sanity `video` doc. */
  publishedAt: string;
};

export async function loadVideos(locale: Locale): Promise<VideoItem[]> {
  try {
    const rows = await sanityClient.fetch<VideoDoc[]>(videosQuery);
    return rows
      .map((row) => ({
        id: row.id,
        title: pickLoc(row.title, locale),
        caption: pickLoc(row.caption, locale),
        summary: pickLoc(row.summary, locale),
        youtubeId: row.youtubeId,
        publishedAt: row.publishedAt ?? "",
      }))
      .filter((row) => row.title && row.youtubeId);
  } catch (err) {
    return fail("videos", err);
  }
}

/**
 * LinkedIn recommendations for the About page. `body` is localized (en/es with
 * en fallback); the other fields are plain strings. Returns [] on failure so
 * the page falls back to the bundled `RECOMMENDATIONS` list.
 */
export async function loadRecommendations(
  locale: Locale
): Promise<Recommendation[]> {
  try {
    const rows = await sanityClient.fetch<RecommendationDoc[]>(
      recommendationsQuery
    );
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name ?? "",
        headline: row.headline ?? "",
        date: row.date ?? "",
        relationship: row.relationship ?? "",
        body: row.body?.[locale] ?? row.body?.en ?? "",
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        linkedinUrl: row.linkedinUrl,
      }))
      .filter((row) => row.name && row.body);
  } catch (err) {
    return fail("recommendations", err);
  }
}

/** Flat row shape for the gated publications list. Matches the dict items. */
export type PublicationItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  /** Resolved Sanity CDN URL of the PDF; empty when none uploaded. */
  file: string;
  /** Conference share key (?paper=<key>); empty when unset. */
  campaignKey: string;
};

export async function loadPublications(
  locale: Locale
): Promise<PublicationItem[]> {
  try {
    const rows = await sanityClient.fetch<PublicationDoc[]>(publicationsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        title: pickLoc(row.title, locale),
        kind: pickLoc(row.kind, locale),
        date: pickLoc(row.date, locale),
        file: row.file ?? "",
        campaignKey: row.campaignKey ?? "",
      }))
      .filter((row) => row.title && row.file);
  } catch (err) {
    return fail("publications", err);
  }
}

/**
 * Resolved promoted-publication payload for the 30s download promo. Mirrors the
 * gate's `GatePublication` shape (id/title/file) plus optional kind/date for
 * the card line and resolved promo copy (empty string → component falls back to
 * its dict default). `loadDownloadPromo` returns `null` whenever the promo
 * should not show, so the layout renders nothing in every off/misconfigured
 * case.
 */
export type DownloadPromoItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  file: string;
  heading: string;
  body: string;
  ctaLabel: string;
};

/**
 * Load the single promoted publication, or `null` when the promo is disabled,
 * no publication is selected, or the selected publication has no downloadable
 * file. The single-reference singleton guarantees at most one paper here.
 */
export async function loadDownloadPromo(
  locale: Locale
): Promise<DownloadPromoItem | null> {
  try {
    const doc = await sanityClient.fetch<DownloadPromoDoc | null>(
      downloadPromoQuery
    );
    if (!doc?.enabled) return null;
    const pub = doc.publication;
    if (!pub?.file) return null;
    const title = pickLoc(pub.title, locale);
    if (!title) return null;
    return {
      id: pub.id,
      title,
      kind: pickLoc(pub.kind, locale),
      date: pickLoc(pub.date, locale),
      file: pub.file,
      heading: pickOpt(doc.heading, locale) ?? "",
      body: pickOpt(doc.body, locale) ?? "",
      ctaLabel: pickOpt(doc.ctaLabel, locale) ?? "",
    };
  } catch (err) {
    console.warn("Sanity downloadPromo fetch failed; promo hidden.", err);
    return null;
  }
}

export async function loadPartners(): Promise<PartnerItem[]> {
  try {
    const rows = await sanityClient.fetch<PartnerDoc[]>(partnersQuery);
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        website: row.website ?? "",
        logoUrl: row.logoUrl ?? "",
        // Native dimensions are useful for setting <img width/height> so the
        // ticker doesn't reflow as logos load. Default to 0 when missing —
        // the component treats 0 as "let CSS size it".
        logoWidth: row.logoWidth ?? 0,
        logoHeight: row.logoHeight ?? 0,
        logoLightUrl: row.logoLightUrl ?? "",
        logoLightWidth: row.logoLightWidth ?? 0,
        logoLightHeight: row.logoLightHeight ?? 0,
      }))
      .filter((row) => row.name);
  } catch (err) {
    return fail("partners", err);
  }
}

/** A client row is structurally identical to a partner row. */
export type ClientItem = PartnerItem;

export async function loadClients(): Promise<ClientItem[]> {
  try {
    const rows = await sanityClient.fetch<ClientDoc[]>(clientsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        website: row.website ?? "",
        logoUrl: row.logoUrl ?? "",
        logoWidth: row.logoWidth ?? 0,
        logoHeight: row.logoHeight ?? 0,
        logoLightUrl: row.logoLightUrl ?? "",
        logoLightWidth: row.logoLightWidth ?? 0,
        logoLightHeight: row.logoLightHeight ?? 0,
      }))
      .filter((row) => row.name);
  } catch (err) {
    return fail("clients", err);
  }
}

/** Flat row shape used by the `<MajorConferences>` wall on /on-stage. */
export type ConferenceItem = {
  id: string;
  name: string;
  organization: string;
  region: string;
  website: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  logoLightUrl: string;
  logoLightWidth: number;
  logoLightHeight: number;
};

export async function loadConferences(): Promise<ConferenceItem[]> {
  try {
    const rows = await sanityClient.fetch<ConferenceDoc[]>(conferencesQuery);
    return rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        organization: row.organization ?? "",
        region: row.region ?? "",
        website: row.website ?? "",
        logoUrl: row.logoUrl ?? "",
        logoWidth: row.logoWidth ?? 0,
        logoHeight: row.logoHeight ?? 0,
        logoLightUrl: row.logoLightUrl ?? "",
        logoLightWidth: row.logoLightWidth ?? 0,
        logoLightHeight: row.logoLightHeight ?? 0,
      }))
      .filter((row) => row.name);
  } catch (err) {
    return fail("conferences", err);
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
    /** Visible diagnostic cards, in document order. */
    cards?: {
      id?: string;
      title?: string;
      description?: string;
      durationLabel?: string;
      questionsLabel?: string;
      url?: string;
    }[];
    /** @deprecated legacy single card — kept as a fallback for old content. */
    featured?: {
      id?: string;
      title?: string;
      description?: string;
      durationLabel?: string;
      questionsLabel?: string;
      url?: string;
    };
  };
  onStage: { eyebrow?: string; title?: string; body?: string; linkedinUrl?: string };
  partners: { eyebrow?: string; heading?: string };
  testimonials: { eyebrow?: string; heading?: string };
  pullQuote: {
    text?: string;
    author?: string;
    role?: string;
    imageUrl?: string;
    imageAlt?: string;
  };
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
        // Visible cards from the `assessments` array (drop any flagged hidden).
        // Falls back to the legacy single `assessmentFeatured` object so old
        // content keeps rendering until it's re-authored as array items.
        cards: (() => {
          const list = Array.isArray(doc.assessments) ? doc.assessments : [];
          const visible = list
            .filter((c) => c && c.visible !== false)
            .map((c) => ({
              id: c.id,
              title: pickOpt(c.title, locale),
              description: pickOpt(c.description, locale),
              durationLabel: pickOpt(c.durationLabel, locale),
              questionsLabel: pickOpt(c.questionsLabel, locale),
              url: c.url,
            }));
          if (visible.length > 0) return visible;
          if (doc.assessmentFeatured) {
            return [
              {
                id: doc.assessmentFeatured.id,
                title: pickOpt(doc.assessmentFeatured.title, locale),
                description: pickOpt(doc.assessmentFeatured.description, locale),
                durationLabel: pickOpt(doc.assessmentFeatured.durationLabel, locale),
                questionsLabel: pickOpt(doc.assessmentFeatured.questionsLabel, locale),
                url: doc.assessmentFeatured.url,
              },
            ];
          }
          return undefined;
        })(),
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
        linkedinUrl: doc.onStageLinkedinUrl,
      },
      partners: {
        eyebrow: pickOpt(doc.partnersEyebrow, locale),
        heading: pickOpt(doc.partnersHeading, locale),
      },
      testimonials: {
        eyebrow: pickOpt(doc.testimonialsEyebrow, locale),
        heading: pickOpt(doc.testimonialsHeading, locale),
      },
      pullQuote: {
        text: pickOpt(doc.pullQuoteText, locale),
        author: pickOpt(doc.pullQuoteAuthor, locale),
        role: pickOpt(doc.pullQuoteRole, locale),
        imageUrl: doc.pullQuoteImageUrl,
        imageAlt: doc.pullQuoteImageAlt,
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
    linkedinUrl?: string;
    stats?: { value: string; label: string }[];
  };
  featuredVideo: {
    eyebrow?: string;
    title?: string;
    body?: string;
    youtubeId?: string;
    blogUrl?: string;
    blogLabel?: string;
  };
  speaking: {
    eyebrow?: string;
    title?: string;
    body?: string;
    regions?: {
      region: string;
      entries: { name: string; location: string; date?: string }[];
    }[];
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
        linkedinUrl: doc.founderLinkedinUrl,
        stats: doc.founderStats
          ?.map((s) => ({
            value: s.value ?? "",
            label: pickOpt(s.label, locale) ?? "",
          }))
          .filter((s) => s.value && s.label),
      },
      featuredVideo: {
        eyebrow: pickOpt(doc.featuredVideoEyebrow, locale),
        title: pickOpt(doc.featuredVideoTitle, locale),
        body: pickOpt(doc.featuredVideoBody, locale),
        youtubeId: doc.featuredVideoYoutubeId,
        blogUrl: doc.featuredVideoBlogUrl,
        blogLabel: pickOpt(doc.featuredVideoBlogLabel, locale),
      },
      speaking: {
        eyebrow: pickOpt(doc.speakingEyebrow, locale),
        title: pickOpt(doc.speakingTitle, locale),
        body: pickOpt(doc.speakingBody, locale),
        regions: doc.speakingRegions
          ?.map((r) => ({
            region: pickOpt(r.region, locale) ?? "",
            entries: (r.entries ?? [])
              .map((e) => ({
                name: e.name ?? "",
                location: e.location ?? "",
                date: e.date,
              }))
              .filter((e) => e.name),
          }))
          .filter((r) => r.region && r.entries.length > 0),
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
  /** Closing pull-quote (PullQuote design). Empty fields → dict fallback. */
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  quoteImageUrl?: string;
  quoteImageAlt?: string;
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
      quote: pickOpt(doc.quote, locale),
      quoteAuthor: pickOpt(doc.quoteAuthor, locale),
      quoteRole: pickOpt(doc.quoteRole, locale),
      quoteImageUrl: doc.quoteImageUrl,
      quoteImageAlt: doc.quoteImageAlt,
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
  homepage: { eyebrow?: string; title?: string };
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

export type OnStagePageContent = {
  areas: {
    eyebrow?: string;
    title?: string;
    items?: { label: string; iconKey: string }[];
  };
  speakingExp: { eyebrow?: string; title?: string; body?: string };
  cta: { eyebrow?: string; title?: string; body?: string; label?: string };
};

export async function loadOnStagePage(
  locale: Locale
): Promise<OnStagePageContent | null> {
  try {
    const doc = await sanityClient.fetch<OnStagePageDoc | null>(
      onStagePageQuery
    );
    if (!doc) return null;
    return {
      areas: {
        eyebrow: pickOpt(doc.areasEyebrow, locale),
        title: pickOpt(doc.areasTitle, locale),
        items: doc.areasItems
          ?.map((it) => ({
            label: pickOpt(it.label, locale) ?? "",
            iconKey: it.iconKey ?? "",
          }))
          .filter((it) => it.label),
      },
      speakingExp: {
        eyebrow: pickOpt(doc.speakingExpEyebrow, locale),
        title: pickOpt(doc.speakingExpTitle, locale),
        body: pickOpt(doc.speakingExpBody, locale),
      },
      cta: {
        eyebrow: pickOpt(doc.ctaEyebrow, locale),
        title: pickOpt(doc.ctaTitle, locale),
        body: pickOpt(doc.ctaBody, locale),
        label: pickOpt(doc.ctaLabel, locale),
      },
    };
  } catch (err) {
    console.warn("Sanity onStagePage fetch failed; using dict fallback.", err);
    return null;
  }
}

export type InsightsPageContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  listTitle?: string;
  readLabel?: string;
  /** LinkedIn profile URL for the hero follow button; empty hides it. */
  linkedinUrl?: string;
  linkedinLabel?: string;
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
      linkedinUrl: doc.linkedinUrl,
      linkedinLabel: pickOpt(doc.linkedinLabel, locale),
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
