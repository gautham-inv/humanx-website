/**
 * GROQ queries for the humanx-website build.
 *
 * Each query is a plain template string; we fetch the localized field shape
 * (`{ en, es }`) and let the page component pick the right locale before
 * handing data to render-only components. That keeps the schema query
 * agnostic to which locale is being built.
 */

/**
 * Every testimonial, ordered by editorial `order` field then creation date.
 * Returns localized `quote / author / org` so the homepage can fan out to
 * both `/en` and `/es` builds from a single fetch.
 */
export const testimonialsQuery = /* groq */ `
  *[_type == "testimonial"] | order(order asc, _createdAt asc) {
    "id": _id,
    quote,
    author,
    org,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    linkedinUrl
  }
`;

/** Shape of a single testimonial row returned by `testimonialsQuery`. */
export type TestimonialDoc = {
  id: string;
  quote: { en?: string; es?: string };
  author: { en?: string; es?: string };
  org?: { en?: string; es?: string };
  /** Resolved Sanity CDN URL of the uploaded headshot, or undefined. */
  imageUrl?: string;
  imageAlt?: string;
  /** LinkedIn profile — makes the attribution clickable when set. */
  linkedinUrl?: string;
};

/** LinkedIn recommendations shown on the About page. */
export const recommendationsQuery = /* groq */ `
  *[_type == "recommendation"] | order(order asc, _createdAt asc) {
    "id": _id,
    name,
    headline,
    date,
    relationship,
    body,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    linkedinUrl
  }
`;

/** Shape of a single recommendation row returned by `recommendationsQuery`. */
export type RecommendationDoc = {
  id: string;
  name?: string;
  headline?: string;
  date?: string;
  relationship?: string;
  body?: { en?: string; es?: string };
  imageUrl?: string;
  imageAlt?: string;
  linkedinUrl?: string;
};

/* ─────────────────────────────────────────────────────────────────────────────
 * The rest of the list queries below all follow the same recipe: project a
 * stable `id` (Sanity's `_id`) plus whatever localized fields the page needs,
 * ordered by an editorial `order` field where it makes sense.
 * ────────────────────────────────────────────────────────────────────────── */

/** All services, ordered by the editorial `order` field then creation date. */
export const servicesQuery = /* groq */ `
  *[_type == "service"] | order(order asc, _createdAt asc) {
    "id": _id,
    iconKey,
    title,
    body
  }
`;

export type ServiceDoc = {
  id: string;
  iconKey: string;
  title: { en?: string; es?: string };
  body: { en?: string; es?: string };
};

/** All events. Upcoming/past split is done client-side based on startsAt. */
export const eventsQuery = /* groq */ `
  *[_type == "event"] | order(startsAt asc) {
    "id": _id,
    "slug": slug.current,
    title,
    venue,
    dateDisplay,
    startsAt,
    summary,
    body,
    youtubeId,
    registrationUrl,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt
  }
`;

export type EventDoc = {
  id: string;
  /** URL path segment from the slug field. Empty if author hasn't set one. */
  slug?: string;
  title: { en?: string; es?: string };
  venue?: { en?: string; es?: string };
  dateDisplay?: { en?: string; es?: string };
  startsAt: string;
  summary?: { en?: string; es?: string };
  body?: { en?: string; es?: string };
  youtubeId?: string;
  registrationUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
};

/** Insights ordered newest-first by the `publishedAt` timestamp. */
export const insightsQuery = /* groq */ `
  *[_type == "insight"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    kind,
    date,
    href,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt
  }
`;

export type InsightDoc = {
  id: string;
  title: { en?: string; es?: string };
  kind?: { en?: string; es?: string };
  date?: { en?: string; es?: string };
  href?: string;
  /** Resolved Sanity CDN URL of the uploaded card image, or undefined. */
  imageUrl?: string;
  imageAlt?: string;
};

/** Downloadable publications (gated PDFs) for the Publications page. */
export const publicationsQuery = /* groq */ `
  *[_type == "publication"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    kind,
    date,
    campaignKey,
    "file": file.asset->url
  }
`;

export type PublicationDoc = {
  id: string;
  title: { en?: string; es?: string };
  kind?: { en?: string; es?: string };
  date?: { en?: string; es?: string };
  /** Conference share key matched against `?paper=<key>`. */
  campaignKey?: string;
  /** Resolved Sanity CDN URL of the uploaded PDF, or undefined. */
  file?: string;
};

/**
 * Standalone homepage "On stage" videos. Ordered by the manual `order` field
 * first, then `publishedAt` newest-first as a tiebreaker. Decoupled from
 * past-events-with-youtubeId so a video can exist without a corresponding
 * event doc (interviews, panels) and a past event can omit a recording.
 */
export const videosQuery = /* groq */ `
  *[_type == "video"] | order(coalesce(order, 9999) asc, publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    caption,
    summary,
    youtubeId,
    publishedAt
  }
`;

export type VideoDoc = {
  id: string;
  title: { en?: string; es?: string };
  caption?: { en?: string; es?: string };
  summary?: { en?: string; es?: string };
  youtubeId: string;
  publishedAt?: string;
};

/** Partners ordered by manual `order`. Names aren't localized. */
export const partnersQuery = /* groq */ `
  *[_type == "partner"] | order(order asc, _createdAt asc) {
    "id": _id,
    name,
    website,
    "logoUrl": logo.asset->url,
    "logoWidth": logo.asset->metadata.dimensions.width,
    "logoHeight": logo.asset->metadata.dimensions.height,
    "logoLightUrl": logoLight.asset->url,
    "logoLightWidth": logoLight.asset->metadata.dimensions.width,
    "logoLightHeight": logoLight.asset->metadata.dimensions.height
  }
`;

export type PartnerDoc = {
  id: string;
  name: string;
  /** External URL — when set, ticker entry becomes a link. */
  website?: string;
  /** Dark-theme logo. Resolved Sanity CDN URL. */
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  /** Light-theme logo. Empty if the author hasn't uploaded a variant —
   * frontend then falls back to the dark logo for both themes. */
  logoLightUrl?: string;
  logoLightWidth?: number;
  logoLightHeight?: number;
};

/** Clients ordered by manual `order`. Same shape as partners. */
export const clientsQuery = /* groq */ `
  *[_type == "client"] | order(order asc, _createdAt asc) {
    "id": _id,
    name,
    website,
    "logoUrl": logo.asset->url,
    "logoWidth": logo.asset->metadata.dimensions.width,
    "logoHeight": logo.asset->metadata.dimensions.height,
    "logoLightUrl": logoLight.asset->url,
    "logoLightWidth": logoLight.asset->metadata.dimensions.width,
    "logoLightHeight": logoLight.asset->metadata.dimensions.height
  }
`;

/** A client row is structurally identical to a partner row. */
export type ClientDoc = PartnerDoc;

/** Major conferences for the /on-stage wall, ordered by `featuredOrder`. */
export const conferencesQuery = /* groq */ `
  *[_type == "conference"] | order(coalesce(featuredOrder, 9999) asc, _createdAt asc) {
    "id": _id,
    name,
    organization,
    region,
    website,
    "logoUrl": logo.asset->url,
    "logoWidth": logo.asset->metadata.dimensions.width,
    "logoHeight": logo.asset->metadata.dimensions.height,
    "logoLightUrl": logoLight.asset->url,
    "logoLightWidth": logoLight.asset->metadata.dimensions.width,
    "logoLightHeight": logoLight.asset->metadata.dimensions.height
  }
`;

export type ConferenceDoc = {
  id: string;
  name: string;
  /** Organising body, e.g. "AECOC". */
  organization?: string;
  /** Country or region label, e.g. "Spain". */
  region?: string;
  /** External URL — when set, the card becomes a link. */
  website?: string;
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoLightUrl?: string;
  logoLightWidth?: number;
  logoLightHeight?: number;
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Singletons. Each singleton is pinned in the studio to a deterministic _id,
 * so the queries fetch by id directly — no array, no ordering.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Homepage singleton. Covers every section header + body block the homepage
 * renders. Item lists (testimonials, events, partners) come from their own
 * documents and are joined at the page level — they're not projected here.
 */
export const homepageQuery = /* groq */ `
  *[_type == "homepage" && _id == "homepage"][0] {
    heroEyebrow, heroHeadline, heroClarifier, heroSub,
    heroPortraitAlt, heroPrimaryCta, heroSecondaryCta,
    whoWeAreTitle, whoWeAreLead, whoWeAreStepsHeading,
    whoWeAreItems[]{ title, body },
    assessmentEyebrow, assessmentTitle, assessmentBody, assessmentCta,
    assessments[]{
      visible, id, title, description, durationLabel, questionsLabel, url
    },
    assessmentFeatured{
      id, title, description, durationLabel, questionsLabel, url
    },
    onStageEyebrow, onStageTitle, onStageBody,
    partnersEyebrow, partnersHeading,
    testimonialsEyebrow, testimonialsHeading,
    pullQuoteText, pullQuoteAuthor, pullQuoteRole,
    "pullQuoteImageUrl": pullQuoteImage.asset->url,
    "pullQuoteImageAlt": pullQuoteImage.alt
  }
`;

type LocStr = { en?: string; es?: string } | undefined;
type LocText = LocStr;

export type HomepageDoc = {
  heroEyebrow?: LocStr;
  heroHeadline?: LocStr;
  heroClarifier?: LocText;
  heroSub?: LocText;
  heroPortraitAlt?: LocStr;
  heroPrimaryCta?: LocStr;
  heroSecondaryCta?: LocStr;

  whoWeAreTitle?: LocStr;
  whoWeAreLead?: LocText;
  whoWeAreStepsHeading?: LocStr;
  whoWeAreItems?: { title: LocStr; body: LocText }[];

  assessmentEyebrow?: LocStr;
  assessmentTitle?: LocStr;
  assessmentBody?: LocText;
  assessmentCta?: LocStr;
  assessments?: {
    visible?: boolean;
    id?: string;
    title?: LocStr;
    description?: LocText;
    durationLabel?: LocStr;
    questionsLabel?: LocStr;
    url?: string;
  }[];
  assessmentFeatured?: {
    id?: string;
    title?: LocStr;
    description?: LocText;
    durationLabel?: LocStr;
    questionsLabel?: LocStr;
    url?: string;
  };

  onStageEyebrow?: LocStr;
  onStageTitle?: LocStr;
  onStageBody?: LocText;

  partnersEyebrow?: LocStr;
  partnersHeading?: LocStr;

  testimonialsEyebrow?: LocStr;
  testimonialsHeading?: LocStr;

  pullQuoteText?: LocText;
  pullQuoteAuthor?: LocStr;
  pullQuoteRole?: LocStr;
  pullQuoteImageUrl?: string;
  pullQuoteImageAlt?: string;
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Page singletons. Each maps to exactly one route in the website. The
 * homepage singleton above also lives in this category but is large enough
 * to warrant its own section.
 * ────────────────────────────────────────────────────────────────────────── */

export const aboutPageQuery = /* groq */ `
  *[_type == "aboutPage" && _id == "aboutPage"][0] {
    pageEyebrow, pageTitle, pageBody, primaryCta,
    missionTitle, missionBody, missionImageAlt,
    valuesTitle, valuesBody,
    valuesItems[]{ title, body },
    experienceTitle, experienceBody,
    experienceStatValue, experienceStatLabel, experienceStatNote,
    founderEyebrow, founderName, founderBio, founderImageAlt,
    founderStats[]{ value, label },
    featuredVideoEyebrow, featuredVideoTitle, featuredVideoBody,
    featuredVideoYoutubeId, featuredVideoBlogUrl, featuredVideoBlogLabel,
    speakingEyebrow, speakingTitle, speakingBody,
    speakingRegions[]{ region, entries[]{ name, location, date } }
  }
`;

export type AboutPageDoc = {
  pageEyebrow?: LocStr;
  pageTitle?: LocStr;
  pageBody?: LocText;
  primaryCta?: LocStr;
  missionTitle?: LocStr;
  missionBody?: LocText;
  missionImageAlt?: LocStr;
  valuesTitle?: LocStr;
  valuesBody?: LocText;
  valuesItems?: { title: LocStr; body: LocText }[];
  experienceTitle?: LocStr;
  experienceBody?: LocText;
  experienceStatValue?: string;
  experienceStatLabel?: LocStr;
  experienceStatNote?: LocText;
  founderEyebrow?: LocStr;
  founderName?: LocStr;
  founderBio?: LocText;
  founderImageAlt?: LocStr;
  founderStats?: { value: string; label: LocStr }[];
  featuredVideoEyebrow?: LocStr;
  featuredVideoTitle?: LocStr;
  featuredVideoBody?: LocText;
  featuredVideoYoutubeId?: string;
  featuredVideoBlogUrl?: string;
  featuredVideoBlogLabel?: LocStr;
  speakingEyebrow?: LocStr;
  speakingTitle?: LocStr;
  speakingBody?: LocText;
  speakingRegions?: {
    region?: LocStr;
    entries?: { name?: string; location?: string; date?: string }[];
  }[];
};

export const servicesPageQuery = /* groq */ `
  *[_type == "servicesPage" && _id == "servicesPage"][0] {
    eyebrow, title, body,
    quote, quoteAuthor, quoteRole,
    "quoteImageUrl": quoteImage.asset->url,
    "quoteImageAlt": quoteImage.alt
  }
`;

export type ServicesPageDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
  quote?: LocText;
  quoteAuthor?: LocStr;
  quoteRole?: LocStr;
  quoteImageUrl?: string;
  quoteImageAlt?: string;
};

export const eventsPageQuery = /* groq */ `
  *[_type == "eventsPage" && _id == "eventsPage"][0] {
    eyebrow, pageTitle, pageBody,
    upcomingHeading, pastHeading,
    noUpcoming, noPast,
    viewAllLabel,
    homepageEyebrow, homepageTitle,
    bookEyebrow, bookTitle, bookBody, bookCta
  }
`;

export type EventsPageDoc = {
  eyebrow?: LocStr;
  pageTitle?: LocStr;
  pageBody?: LocText;
  upcomingHeading?: LocStr;
  pastHeading?: LocStr;
  noUpcoming?: LocStr;
  noPast?: LocStr;
  viewAllLabel?: LocStr;
  homepageEyebrow?: LocStr;
  homepageTitle?: LocStr;
  bookEyebrow?: LocStr;
  bookTitle?: LocStr;
  bookBody?: LocText;
  bookCta?: LocStr;
};

export const insightsPageQuery = /* groq */ `
  *[_type == "insightsPage" && _id == "insightsPage"][0] {
    eyebrow, title, body, listTitle, readLabel,
    linkedinUrl, linkedinLabel
  }
`;

export type InsightsPageDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
  listTitle?: LocStr;
  readLabel?: LocStr;
  /** LinkedIn profile URL — when set, the hero shows a follow button. */
  linkedinUrl?: string;
  linkedinLabel?: LocStr;
};

export const onStagePageQuery = /* groq */ `
  *[_type == "onStagePage" && _id == "onStagePage"][0] {
    areasEyebrow, areasTitle,
    areasItems[]{ label, iconKey },
    speakingExpEyebrow, speakingExpTitle, speakingExpBody,
    ctaEyebrow, ctaTitle, ctaBody, ctaLabel
  }
`;

export type OnStagePageDoc = {
  areasEyebrow?: LocStr;
  areasTitle?: LocStr;
  areasItems?: { label?: LocStr; iconKey?: string }[];
  speakingExpEyebrow?: LocStr;
  speakingExpTitle?: LocStr;
  speakingExpBody?: LocText;
  ctaEyebrow?: LocStr;
  ctaTitle?: LocStr;
  ctaBody?: LocText;
  ctaLabel?: LocStr;
};

export const publicationsPageQuery = /* groq */ `
  *[_type == "publicationsPage" && _id == "publicationsPage"][0] {
    eyebrow, title, body, listTitle, downloadLabel,
    newsletter{ title, body, submit }
  }
`;

export type PublicationsPageDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
  listTitle?: LocStr;
  downloadLabel?: LocStr;
  newsletter?: { title?: LocStr; body?: LocText; submit?: LocStr };
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Chrome singletons. Each is loaded once by the locale layout (or homepage)
 * and resolved into a content slice every consuming component reads.
 * ────────────────────────────────────────────────────────────────────────── */

export const summitBarQuery = /* groq */ `
  *[_type == "summitBar" && _id == "summitBar"][0] {
    enabled, label, text, cta, ctaUrl
  }
`;

export type SummitBarDoc = {
  enabled?: boolean;
  label?: LocStr;
  text?: LocStr;
  cta?: LocStr;
  ctaUrl?: string;
};

export const contactCtaQuery = /* groq */ `
  *[_type == "contactCta" && _id == "contactCta"][0] {
    eyebrow, title, body,
    openModalLabel, modalTitle, modalClose,
    topicLabel, topicOptions,
    messageLabel, messagePlaceholder, submit
  }
`;

export type ContactCtaDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
  openModalLabel?: LocStr;
  modalTitle?: LocStr;
  modalClose?: LocStr;
  topicLabel?: LocStr;
  topicOptions?: LocStr[];
  messageLabel?: LocStr;
  messagePlaceholder?: LocStr;
  submit?: LocStr;
};

export const footerContentQuery = /* groq */ `
  *[_type == "footerContent" && _id == "footerContent"][0] {
    brandTagline, kindToday,
    exploreHeading, connectHeading, contactHeading,
    contactEmail, privacyTitle, privacyLinkLabel, rights,
    socialLinks[]{ platform, url }
  }
`;

export type FooterContentDoc = {
  brandTagline?: LocStr;
  kindToday?: LocStr;
  exploreHeading?: LocStr;
  connectHeading?: LocStr;
  contactHeading?: LocStr;
  contactEmail?: string;
  privacyTitle?: LocStr;
  privacyLinkLabel?: LocStr;
  rights?: LocStr;
  socialLinks?: { platform: string; url: string }[];
};
