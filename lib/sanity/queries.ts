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
    org
  }
`;

/** Shape of a single testimonial row returned by `testimonialsQuery`. */
export type TestimonialDoc = {
  id: string;
  quote: { en?: string; es?: string };
  author: { en?: string; es?: string };
  org?: { en?: string; es?: string };
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
    title,
    venue,
    dateDisplay,
    startsAt,
    youtubeId
  }
`;

export type EventDoc = {
  id: string;
  title: { en?: string; es?: string };
  venue?: { en?: string; es?: string };
  dateDisplay?: { en?: string; es?: string };
  startsAt: string;
  youtubeId?: string;
};

/** Insights ordered newest-first by the `publishedAt` timestamp. */
export const insightsQuery = /* groq */ `
  *[_type == "insight"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    kind,
    date,
    href
  }
`;

export type InsightDoc = {
  id: string;
  title: { en?: string; es?: string };
  kind?: { en?: string; es?: string };
  date?: { en?: string; es?: string };
  href?: string;
};

/** Partners ordered by manual `order`. Names aren't localized. */
export const partnersQuery = /* groq */ `
  *[_type == "partner"] | order(order asc, _createdAt asc) {
    "id": _id,
    name
  }
`;

export type PartnerDoc = {
  id: string;
  name: string;
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
    assessmentFeatured{
      id, title, description, durationLabel, questionsLabel, url
    },
    onStageEyebrow, onStageTitle, onStageBody,
    partnersEyebrow, partnersHeading,
    testimonialsEyebrow, testimonialsHeading
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
    founderStats[]{ value, label }
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
};

export const servicesPageQuery = /* groq */ `
  *[_type == "servicesPage" && _id == "servicesPage"][0] {
    eyebrow, title, body
  }
`;

export type ServicesPageDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
};

export const eventsPageQuery = /* groq */ `
  *[_type == "eventsPage" && _id == "eventsPage"][0] {
    eyebrow, pageTitle, pageBody,
    upcomingHeading, pastHeading,
    noUpcoming, noPast,
    viewAllLabel,
    homepageEyebrow, homepageTitle, homepageBody,
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
  homepageBody?: LocText;
  bookEyebrow?: LocStr;
  bookTitle?: LocStr;
  bookBody?: LocText;
  bookCta?: LocStr;
};

export const insightsPageQuery = /* groq */ `
  *[_type == "insightsPage" && _id == "insightsPage"][0] {
    eyebrow, title, body, listTitle, readLabel
  }
`;

export type InsightsPageDoc = {
  eyebrow?: LocStr;
  title?: LocStr;
  body?: LocText;
  listTitle?: LocStr;
  readLabel?: LocStr;
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
