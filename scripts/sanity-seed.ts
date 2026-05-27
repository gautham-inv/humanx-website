/* eslint-disable no-console */
/**
 * One-shot seed script: pushes every list-document entry from the current
 * dict files into Sanity using deterministic IDs so re-running the script
 * is idempotent (the same row gets overwritten, never duplicated).
 *
 * Scope (this pass):
 *   - testimonial × 3      (homepage carousel)
 *   - service     × 6      (/services list)
 *   - event       × 5      (homepage block + /events archive)
 *   - insight     × 6      (/insights list)
 *   - partner     × 8      (homepage partners ticker)
 *   - homepage    × 1      (singleton: hero + whoWeAre + assessment + onStage
 *                          + partners/testimonials section headers)
 *   - aboutPage   × 1      (singleton: 5-section /about content)
 *   - servicesPage× 1      (singleton: /services hero copy)
 *   - eventsPage  × 1      (singleton: /events page + homepage block headers
 *                          + Book Ramon CTA)
 *   - insightsPage× 1      (singleton: /insights hero)
 *   - publicationsPage × 1 (singleton: /publications hero + newsletter)
 *   - summitBar   × 1      (singleton: top live-banner copy)
 *   - contactCta  × 1      (singleton: GlobalCTA + modal copy + topic options)
 *   - footerContent × 1    (singleton: site footer copy + social links)
 *
 * Skipped: publication. The schema requires a PDF file asset and
 * public/pdfs/ is empty — upload the real PDFs, then run a follow-up
 * seed (or just create those 3 docs by hand in the studio).
 *
 * Usage:
 *   1. sanity.io/manage → project r3bmhb31 → API → Tokens → Add token
 *      with the "Editor" role. Copy the token.
 *   2. Run from humanx-website/:
 *        SANITY_WRITE_TOKEN=skXXXX npm run seed
 *
 * The script prints what it created/updated and (for testimonials) also
 * lists any extra docs already in the dataset so you can decide whether
 * to delete leftover test entries in the studio.
 */
import { createClient } from "@sanity/client";
import { en } from "../lib/i18n/dictionaries/en";
import { es } from "../lib/i18n/dictionaries/es";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Create an Editor-role token at " +
      "sanity.io/manage → project " +
      projectId +
      " → API → Tokens, then run:\n\n" +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed\n"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-01",
  token,
  useCdn: false, // CDN is read-only and stale; writes must hit the API
});

// ---------- helpers --------------------------------------------------------

/** `{ en, es }` shape used by every localizedString / localizedText field. */
const loc = (enValue: string, esValue: string) => ({
  _type: "localizedString" as const,
  en: enValue,
  es: esValue,
});
const locText = (enValue: string, esValue: string) => ({
  _type: "localizedText" as const,
  en: enValue,
  es: esValue,
});

/**
 * Sanity rejects ids that look like a `_type` prefix path. We namespace ids
 * with the type so multiple seed runs across types can't collide, but stop
 * short of using dots that Sanity treats as path separators.
 */
const idFor = (type: string, slug: string) => `${type}-${slug}`;

// ---------- build documents -------------------------------------------------

type Doc = Record<string, unknown> & { _id: string; _type: string };

function buildTestimonials(): Doc[] {
  return en.testimonials.items.map((row, i) => {
    const esRow = es.testimonials.items[i];
    return {
      _id: idFor("testimonial", row.id),
      _type: "testimonial",
      quote: locText(row.quote, esRow.quote),
      author: loc(row.author, esRow.author),
      org: row.org ? loc(row.org, esRow.org) : undefined,
      order: i + 1,
    };
  });
}

function buildServices(): Doc[] {
  return en.services.items.map((row, i) => {
    const esRow = es.services.items[i];
    return {
      _id: idFor("service", row.id),
      _type: "service",
      title: loc(row.title, esRow.title),
      body: locText(row.body, esRow.body),
      iconKey: row.id, // 1:1 with the SERVICE_ICONS map in the frontend
      order: i + 1,
    };
  });
}

function buildEvents(): Doc[] {
  return en.events.items.map((row, i) => {
    const esRow = es.events.items[i];
    return {
      _id: idFor("event", row.id),
      _type: "event",
      title: loc(row.title, esRow.title),
      venue: loc(row.venue, esRow.venue),
      dateDisplay: loc(row.date, esRow.date),
      startsAt: row.startsAt,
      youtubeId: row.youtubeId || undefined,
      order: i + 1,
    };
  });
}

function buildInsights(): Doc[] {
  return en.insights.items.map((row, i) => {
    const esRow = es.insights.items[i];
    // Treat dict date string ("May 2026") as the 1st of that month, UTC, so
    // newest-first sorts work without an author-entered timestamp.
    const monthMap: Record<string, number> = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sep: 8, sept: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11,
    };
    const parts = row.date.split(" ");
    const m = monthMap[parts[0]?.toLowerCase() ?? ""];
    const y = Number(parts[1]);
    const publishedAt =
      Number.isFinite(y) && m !== undefined
        ? new Date(Date.UTC(y, m, 1, 9, 0, 0)).toISOString()
        : undefined;
    return {
      _id: idFor("insight", row.id),
      _type: "insight",
      title: loc(row.title, esRow.title),
      kind: loc(row.kind, esRow.kind),
      date: loc(row.date, esRow.date),
      publishedAt,
      // The dict uses hash anchors ("#i1") which aren't valid URLs.
      // Leave href empty for now; authors can fill in once real
      // permalinks exist.
      href: undefined,
    };
  });
}

/**
 * Convert the dict's headline word array into the marker-formatted string
 * the homepage schema expects. The EN/ES dicts hardcode emphasis on index 1
 * ("experience" / "experiencia"); we mirror that here so the seeded copy
 * renders identically to the current dict-driven hero.
 */
function headlineWithMarker(words: readonly string[], emphasisIdx = 1): string {
  return words
    .map((w, i) => (i === emphasisIdx ? `<<${w}>>` : w))
    .join(" ");
}

/**
 * The dict already includes `<<…>>` markers in some titles (e.g. `services.title`
 * and `about.pageTitle`). Pass those through unchanged so the marker placement
 * survives the round-trip into Sanity and back out.
 */
const passthrough = (s: string) => s;

function buildAboutPage(): Doc[] {
  const a = en.about;
  const sa = es.about;
  const v = en.values;
  const sv = es.values;
  const r = en.ramon;
  const sr = es.ramon;

  return [
    {
      _id: "aboutPage",
      _type: "aboutPage",
      pageEyebrow: loc(a.pageEyebrow, sa.pageEyebrow),
      pageTitle: loc(passthrough(a.pageTitle), passthrough(sa.pageTitle)),
      pageBody: locText(a.pageBody, sa.pageBody),
      primaryCta: loc(a.primaryCta, sa.primaryCta),

      missionTitle: loc(a.missionTitle, sa.missionTitle),
      missionBody: locText(a.missionBody, sa.missionBody),
      missionImageAlt: loc(a.missionImageAlt, sa.missionImageAlt),

      valuesTitle: loc(v.title, sv.title),
      valuesBody: locText(v.body, sv.body),
      valuesItems: v.items.map((it, i) => ({
        _type: "valueItem",
        _key: `value-${i}`,
        title: loc(it.title, sv.items[i].title),
        body: locText(it.body, sv.items[i].body),
      })),

      experienceTitle: loc(a.experienceTitle, sa.experienceTitle),
      experienceBody: locText(a.experienceBody, sa.experienceBody),
      experienceStatValue: a.experienceStatValue,
      experienceStatLabel: loc(a.experienceStatLabel, sa.experienceStatLabel),
      experienceStatNote: locText(a.experienceStatNote, sa.experienceStatNote),

      founderEyebrow: loc(a.founderEyebrow, sa.founderEyebrow),
      founderName: loc(r.title, sr.title),
      founderBio: locText(r.body, sr.body),
      founderImageAlt: loc(r.title, sr.title),
      founderStats: r.stats.map((s, i) => ({
        _type: "statItem",
        _key: `stat-${i}`,
        value: s.value,
        label: loc(s.label, sr.stats[i].label),
      })),
    },
  ];
}

function buildServicesPage(): Doc[] {
  const s = en.services;
  const ss = es.services;
  return [
    {
      _id: "servicesPage",
      _type: "servicesPage",
      eyebrow: loc(s.eyebrow, ss.eyebrow),
      // Dict title already carries the `<<…>>` marker — pass it straight through.
      title: loc(s.title, ss.title),
      body: locText(s.body, ss.body),
    },
  ];
}

function buildEventsPage(): Doc[] {
  const e = en.events;
  const se = es.events;
  return [
    {
      _id: "eventsPage",
      _type: "eventsPage",
      eyebrow: loc(e.eyebrow, se.eyebrow),
      pageTitle: loc(e.pageTitle, se.pageTitle),
      pageBody: locText(e.pageBody, se.pageBody),
      upcomingHeading: loc(e.upcomingHeading, se.upcomingHeading),
      pastHeading: loc(e.pastHeading, se.pastHeading),
      noUpcoming: loc(e.noUpcoming, se.noUpcoming),
      noPast: loc(e.noPast, se.noPast),
      viewAllLabel: loc(e.viewAll, se.viewAll),
      homepageEyebrow: loc(e.eyebrow, se.eyebrow),
      homepageTitle: loc(e.title, se.title),
      homepageBody: locText(e.body, se.body),
      bookEyebrow: loc(e.bookEyebrow, se.bookEyebrow),
      bookTitle: loc(e.bookTitle, se.bookTitle),
      bookBody: locText(e.bookBody, se.bookBody),
      bookCta: loc(e.bookCta, se.bookCta),
    },
  ];
}

function buildInsightsPage(): Doc[] {
  const i = en.insights;
  const si = es.insights;
  return [
    {
      _id: "insightsPage",
      _type: "insightsPage",
      eyebrow: loc(i.eyebrow, si.eyebrow),
      title: loc(i.title, si.title),
      body: locText(i.body, si.body),
      listTitle: loc(i.listTitle, si.listTitle),
      readLabel: loc(i.read, si.read),
    },
  ];
}

function buildPublicationsPage(): Doc[] {
  const p = en.publications;
  const sp = es.publications;
  return [
    {
      _id: "publicationsPage",
      _type: "publicationsPage",
      eyebrow: loc(p.eyebrow, sp.eyebrow),
      title: loc(p.title, sp.title),
      body: locText(p.body, sp.body),
      listTitle: loc(p.listTitle, sp.listTitle),
      downloadLabel: loc(p.download, sp.download),
      // No newsletter copy in the dict yet — seed a sensible default so the
      // block isn't empty when an author opens the studio.
      newsletter: {
        _type: "newsletterBlock",
        title: loc(
          "Get the next one in your inbox",
          "Recibe el próximo en tu correo"
        ),
        body: locText(
          "Quarterly notes from the field. No spam.",
          "Notas trimestrales desde el terreno. Sin spam."
        ),
        submit: loc("Subscribe", "Suscribirme"),
      },
    },
  ];
}

function buildSummitBar(): Doc[] {
  const s = en.summit;
  const ss = es.summit;
  return [
    {
      _id: "summitBar",
      _type: "summitBar",
      enabled: true,
      label: loc(s.label, ss.label),
      text: loc(s.text, ss.text),
      cta: loc(s.cta, ss.cta),
      ctaUrl: "https://humanxinsights.com/en/events#humanx-summit",
    },
  ];
}

function buildContactCta(): Doc[] {
  const c = en.cta;
  const sc = es.cta;
  return [
    {
      _id: "contactCta",
      _type: "contactCta",
      eyebrow: loc(c.eyebrow, sc.eyebrow),
      title: loc(c.title, sc.title),
      body: locText(c.body, sc.body),
      openModalLabel: loc(c.openModalLabel, sc.openModalLabel),
      modalTitle: loc(c.modalTitle, sc.modalTitle),
      modalClose: loc(c.modalClose, sc.modalClose),
      topicLabel: loc(c.topicLabel, sc.topicLabel),
      topicOptions: c.topicOptions.map((o, i) => ({
        _type: "localizedString",
        _key: `topic-${i}`,
        en: o,
        es: sc.topicOptions[i],
      })),
      messageLabel: loc(c.messageLabel, sc.messageLabel),
      messagePlaceholder: loc(c.messagePlaceholder, sc.messagePlaceholder),
      submit: loc(c.submit, sc.submit),
    },
  ];
}

function buildFooterContent(): Doc[] {
  const f = en.footer;
  const sf = es.footer;
  // Sanity socialLink object: { platform, url }. The dict stores them as a
  // flat record keyed by platform name; expand into the array form here.
  const platforms = ["linkedin", "youtube", "twitter", "instagram"] as const;
  return [
    {
      _id: "footerContent",
      _type: "footerContent",
      brandTagline: loc(f.brandTagline, sf.brandTagline),
      kindToday: loc(f.kindToday, sf.kindToday),
      exploreHeading: loc(f.exploreHeading, sf.exploreHeading),
      connectHeading: loc(f.connectHeading, sf.connectHeading),
      contactHeading: loc(f.contactHeading, sf.contactHeading),
      contactEmail: f.contactEmail,
      privacyTitle: loc(f.privacyTitle, sf.privacyTitle),
      privacyLinkLabel: loc(f.privacyLinkLabel, sf.privacyLinkLabel),
      rights: loc(f.rights, sf.rights),
      socialLinks: platforms.map((p, i) => ({
        _type: "socialLink",
        _key: `social-${i}`,
        platform: p,
        url: f.social[p],
      })),
    },
  ];
}

function buildHomepage(): Doc[] {
  const h = en.hero;
  const sh = es.hero;
  const w = en.whoWeAre;
  const sw = es.whoWeAre;
  const a = en.assessment;
  const sa = es.assessment;
  const o = en.onStage;
  const so = es.onStage;
  const p = en.partnersTicker;
  const sp = es.partnersTicker;
  const t = en.testimonials;
  const st = es.testimonials;
  const af = en.assessment.featured;
  const saf = es.assessment.featured;

  return [
    {
      _id: "homepage",
      _type: "homepage",
      heroEyebrow: loc(h.eyebrow, sh.eyebrow),
      heroHeadline: loc(
        headlineWithMarker(h.headline, 1),
        headlineWithMarker(sh.headline, 1)
      ),
      heroClarifier: locText(h.clarifier, sh.clarifier),
      heroSub: locText(h.sub, sh.sub),
      heroPortraitAlt: loc(h.portraitAlt, sh.portraitAlt),
      heroPrimaryCta: loc(h.primary, sh.primary),
      heroSecondaryCta: loc(h.secondary, sh.secondary),

      whoWeAreTitle: loc(w.title, sw.title),
      whoWeAreLead: locText(w.lead, sw.lead),
      whoWeAreStepsHeading: loc(w.stepsHeading, sw.stepsHeading),
      whoWeAreItems: w.items.map((it, i) => ({
        _type: "whoWeAreStep",
        _key: `step-${i}`,
        title: loc(it.title, sw.items[i].title),
        body: locText(it.body, sw.items[i].body),
      })),

      assessmentEyebrow: loc(a.eyebrow, sa.eyebrow),
      assessmentTitle: loc(a.title, sa.title),
      assessmentBody: locText(a.body, sa.body),
      assessmentCta: loc(a.cta, sa.cta),
      assessmentFeatured: {
        _type: "assessmentFeatured",
        id: af.id,
        title: loc(af.title, saf.title),
        description: locText(af.description, saf.description),
        durationLabel: loc(af.durationLabel, saf.durationLabel),
        questionsLabel: loc(af.questionsLabel, saf.questionsLabel),
        url: af.url,
      },

      onStageEyebrow: loc(o.eyebrow, so.eyebrow),
      onStageTitle: loc(o.title, so.title),
      onStageBody: locText(o.body, so.body),

      partnersEyebrow: loc(p.eyebrow, sp.eyebrow),
      partnersHeading: loc(p.heading, sp.heading),

      testimonialsEyebrow: loc(t.eyebrow, st.eyebrow),
      testimonialsHeading: loc(t.heading, st.heading),
    },
  ];
}

function buildPartners(): Doc[] {
  // Partner names aren't localized in the dict (brand names) — schema's
  // `name` field is a plain string, so we only emit one entry per partner.
  return en.partnersTicker.items.map((name, i) => ({
    _id: idFor(
      "partner",
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    ),
    _type: "partner",
    name,
    order: i + 1,
  }));
}

// ---------- run -------------------------------------------------------------

async function seed() {
  const groups: { label: string; docs: Doc[] }[] = [
    { label: "testimonials", docs: buildTestimonials() },
    { label: "services", docs: buildServices() },
    { label: "events", docs: buildEvents() },
    { label: "insights", docs: buildInsights() },
    { label: "partners", docs: buildPartners() },
    { label: "homepage", docs: buildHomepage() },
    { label: "aboutPage", docs: buildAboutPage() },
    { label: "servicesPage", docs: buildServicesPage() },
    { label: "eventsPage", docs: buildEventsPage() },
    { label: "insightsPage", docs: buildInsightsPage() },
    { label: "publicationsPage", docs: buildPublicationsPage() },
    { label: "summitBar", docs: buildSummitBar() },
    { label: "contactCta", docs: buildContactCta() },
    { label: "footerContent", docs: buildFooterContent() },
  ];

  console.log(
    `→ Seeding project ${projectId} / dataset ${dataset}\n` +
      `  ${groups.reduce((n, g) => n + g.docs.length, 0)} documents total\n`
  );

  // Single transaction per group keeps each list atomic — either every
  // testimonial lands or none of them do, so a partial failure doesn't
  // leave the carousel half-updated.
  for (const group of groups) {
    const tx = client.transaction();
    for (const doc of group.docs) {
      // Drop undefined keys so Sanity doesn't store `"org": null` etc.
      const clean = Object.fromEntries(
        Object.entries(doc).filter(([, v]) => v !== undefined)
      ) as Doc;
      tx.createOrReplace(clean);
    }
    await tx.commit();
    console.log(`  ✓ ${group.label.padEnd(13)} ${group.docs.length} docs`);
  }

  // Surface leftover testimonials (e.g. the test entry the user typed before
  // we wired the seed) so they know to clean up in the studio.
  const ourTestimonialIds = buildTestimonials().map((d) => d._id);
  const stray = await client.fetch<{ _id: string; quote?: { en?: string } }[]>(
    `*[_type == "testimonial" && !(_id in $ids)]{ _id, quote }`,
    { ids: ourTestimonialIds }
  );
  if (stray.length) {
    console.log(
      `\n⚠  ${stray.length} testimonial doc(s) in the dataset don't match the ` +
        `seed IDs and were left alone. Open the studio and delete if no longer needed:`
    );
    for (const s of stray) {
      console.log(
        `   - ${s._id}  "${(s.quote?.en ?? "").slice(0, 60).replace(/\s+/g, " ")}"`
      );
    }
  }

  console.log("\n✓ Done. Open the studio to verify, then publish.");
}

seed().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
