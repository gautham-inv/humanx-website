# Publications Structured Data + Insight CTA Row Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `DigitalDocument` JSON-LD to the `/publications` listing page, and add a "Explore publications / See upcoming events" CTA row to the insight detail page.

**Architecture:** Two independent, small pieces. Publications structured data follows the existing `servicesSchema`-style pattern (one schema.org node per listing item, since publications have no detail page). The insight CTA row is a new stateless component with two static links, inserted into the already-shipped `/insights/[slug]` page between the share row and the related-insights section.

**Tech Stack:** Next.js/TypeScript, Sanity GROQ. No test framework configured — verification uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks, same as the prior specs in this project.

## Global Constraints

- No "join mailing list" CTA — no real signup mechanism exists to link to. (from spec §Problem)
- The publications CTA links to `/publications` (browse), not a specific "relevant" PDF — insights and publications have no linking field. (from spec §Out of scope)
- The events CTA links to `/events` (browse), not a specific inline event. (from spec §Out of scope)
- Publications schema type is `DigitalDocument`, `encodingFormat: "application/pdf"`. (from spec §Publications structured data)

---

### Task 1: `PublicationItem` gains `publishedAt`

**Files:**
- Modify: `lib/sanity/queries.ts` (the `publicationsQuery` block and `PublicationDoc` type, currently at `lib/sanity/queries.ts:182-202`)
- Modify: `lib/sanity/loaders.ts` (`PublicationItem` type and `loadPublications`, currently at `lib/sanity/loaders.ts:327-356`)

**Interfaces:**
- Produces: `PublicationItem.publishedAt: string` (ISO datetime, empty string when unset). Task 2's `publicationSchema()` consumes this.

- [ ] **Step 1: Add `publishedAt` to the query and `PublicationDoc`**

Replace (`lib/sanity/queries.ts:182-202`):

```ts
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
```

with:

```ts
export const publicationsQuery = /* groq */ `
  *[_type == "publication"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    kind,
    date,
    campaignKey,
    publishedAt,
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
  publishedAt?: string;
  /** Resolved Sanity CDN URL of the uploaded PDF, or undefined. */
  file?: string;
};
```

- [ ] **Step 2: Add `publishedAt` to `PublicationItem` and `loadPublications`**

Replace (`lib/sanity/loaders.ts:327-356`):

```ts
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
```

with:

```ts
export type PublicationItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  /** Resolved Sanity CDN URL of the PDF; empty when none uploaded. */
  file: string;
  /** Conference share key (?paper=<key>); empty when unset. */
  campaignKey: string;
  /** ISO datetime from the schema's `publishedAt`, or empty string. */
  publishedAt: string;
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
        publishedAt: row.publishedAt ?? "",
      }))
      .filter((row) => row.title && row.file);
  } catch (err) {
    return fail("publications", err);
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/sanity/queries.ts lib/sanity/loaders.ts
git commit -m "feat: add publishedAt to publication query/loader"
```

---

### Task 2: `publicationSchema()` + render on `/publications`

**Files:**
- Modify: `lib/seo/schema.ts` (add the function after `articleSchema`, currently ending at `lib/seo/schema.ts:96`)
- Modify: `app/[locale]/publications/page.tsx`

**Interfaces:**
- Consumes: `PublicationItem.publishedAt` (Task 1).
- Produces: `publicationSchema(items, locale)` — array of `DigitalDocument` nodes.

- [ ] **Step 1: Add `publicationSchema()` to `lib/seo/schema.ts`**

Insert after `articleSchema` (`lib/seo/schema.ts:96`, before the `servicesSchema` comment block):

```ts
/**
 * One `DigitalDocument` node per publication on /publications. Accepts the
 * same loose `{ title, file, publishedAt }` shape the page already
 * renders, so it works whether the list came from Sanity or the dict
 * fallback (whose items have no `publishedAt`).
 */
export function publicationSchema(
  items: ReadonlyArray<{ title: string; file?: string; publishedAt?: string }>,
  locale: string
) {
  return items.map((item) => ({
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: item.title,
    ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
    ...(item.file ? { url: item.file } : {}),
    encodingFormat: "application/pdf",
    author: { "@type": "Person", name: "Ramon Portilla" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    inLanguage: locale === "es" ? "es" : "en",
  }));
}
```

- [ ] **Step 2: Render it on the publications page**

In `app/[locale]/publications/page.tsx`, update the import block:

```ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadPublicationsPage, loadPublications } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { GatedPublications } from "@/components/sections/GatedPublications";
import { JsonLd } from "@/components/seo/JsonLd";
import { publicationSchema } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
```

Then replace the opening of the returned JSX:

```tsx
  return (
    <main id="main">
      <section className="relative px-6 pt-14 pb-8 md:pt-24 md:pb-14 lg:pt-32 lg:pb-20">
```

with:

```tsx
  return (
    <main id="main">
      <JsonLd data={publicationSchema(items, locale)} />
      <section className="relative px-6 pt-14 pb-8 md:pt-24 md:pb-14 lg:pt-32 lg:pb-20">
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors/warnings referencing `app/[locale]/publications/page.tsx` or `lib/seo/schema.ts`.

- [ ] **Step 4: Manual browser verification**

Start the dev server (preview tooling), open `/en/publications`, and inspect the `<script type="application/ld+json">` tags. Confirm one array of `DigitalDocument` nodes is present — one per publication card currently shown (dict fallback items, since no real Sanity publication has been checked yet) — each with `name` and `url` set.

- [ ] **Step 5: Commit**

```bash
git add lib/seo/schema.ts "app/[locale]/publications/page.tsx"
git commit -m "feat: add DigitalDocument JSON-LD to /publications"
```

---

### Task 3: i18n strings for the CTA row

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (inside the `insights` block, after the `moreInsights` key at `lib/i18n/dictionaries/en.ts:425`)
- Modify: `lib/i18n/dictionaries/es.ts` (inside the `insights` block, after the `moreInsights` key at `lib/i18n/dictionaries/es.ts:408`)

**Interfaces:**
- Produces: `dict.insights.explorePublications`, `dict.insights.seeEvents` — consumed by Task 4/5.

- [ ] **Step 1: Add the keys to `en.ts`**

In `lib/i18n/dictionaries/en.ts`, right after `moreInsights: "More insights",` (line 425), add:

```ts
    explorePublications: "Explore our publications",
    seeEvents: "See upcoming events",
```

- [ ] **Step 2: Add the matching keys to `es.ts`**

In `lib/i18n/dictionaries/es.ts`, right after `moreInsights: "Más insights",` (line 408), add:

```ts
    explorePublications: "Explora nuestras publicaciones",
    seeEvents: "Ver próximos eventos",
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/es.ts
git commit -m "feat: add i18n strings for insight CTA row"
```

---

### Task 4: `InsightCtaRow` component + wire into the detail page

**Files:**
- Create: `components/sections/InsightCtaRow.tsx`
- Modify: `app/[locale]/insights/[slug]/page.tsx`

**Interfaces:**
- Consumes: `dict.insights.explorePublications`/`.seeEvents` (Task 3).
- Produces: `InsightCtaRow` component — no other task depends on it.

- [ ] **Step 1: Create `components/sections/InsightCtaRow.tsx`**

```tsx
import Link from "next/link";

/**
 * Two static "where to go next" links on the insight detail page:
 * publications and events. Both link to their listing pages rather than a
 * specific item — insights aren't linked to a specific publication or
 * event by any schema field, so guessing "the relevant one" would be
 * arbitrary.
 */
export function InsightCtaRow({
  locale,
  labels,
}: {
  locale: string;
  labels: { explorePublications: string; seeEvents: string };
}) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link
        href={`/${locale}/publications`}
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {labels.explorePublications} →
      </Link>
      <Link
        href={`/${locale}/events`}
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {labels.seeEvents} →
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the detail page**

In `app/[locale]/insights/[slug]/page.tsx`, add the import alongside the other component imports:

```ts
import { InsightCtaRow } from "@/components/sections/InsightCtaRow";
```

Insert the CTA row right after the `<InsightShare>` block and before the closing `</article>` tag (`app/[locale]/insights/[slug]/page.tsx:184-194`):

```tsx
            <Reveal direction="up" delay={0.3}>
              <InsightShare
                url={canonicalUrl}
                labels={{
                  share: t.share,
                  copyLink: t.copyLink,
                  linkCopied: t.linkCopied,
                }}
              />
            </Reveal>

            <Reveal direction="up" delay={0.35}>
              <InsightCtaRow
                locale={locale}
                labels={{
                  explorePublications: t.explorePublications,
                  seeEvents: t.seeEvents,
                }}
              />
            </Reveal>
          </article>
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors/warnings referencing `components/sections/InsightCtaRow.tsx` or `app/[locale]/insights/[slug]/page.tsx`.

- [ ] **Step 4: Manual browser verification**

Using the same temporary-mock-insight technique from the prior plan (append one mock row to `loadInsights`'s return in `lib/sanity/loaders.ts`, verify, then `git checkout -- lib/sanity/loaders.ts` to revert — see the parent plan's Task 8 for the full mock shape if needed), open the mock insight's detail page and confirm: the CTA row appears after the share row and before "More insights" (or in place of it, if there are no related insights), with both links present, both landing on `/en/publications` and `/en/events` respectively.

- [ ] **Step 5: Commit**

```bash
git add components/sections/InsightCtaRow.tsx "app/[locale]/insights/[slug]/page.tsx"
git commit -m "feat: add publications/events CTA row to insight detail page"
```

---

### Task 5: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors/warnings beyond the pre-existing unrelated ones already present in this repo before this plan.

- [ ] **Step 3: Full static build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: `git status` sanity check**

Run: `git status`
Expected: clean working tree (everything committed); no leftover mock data in `lib/sanity/loaders.ts`.

- [ ] **Step 5: Report to the user**

Confirm both pieces shipped: `/publications` now emits `DigitalDocument` JSON-LD per publication, and the insight detail page now has a CTA row linking to `/publications` and `/events`. Restate that "join mailing list" remains unimplemented pending a HubSpot form GUID, and that the HubSpot workflow-automation item (welcome emails, new-publication notifications) is entirely HubSpot admin-side work with no code component.
