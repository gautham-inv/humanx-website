# Insight Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/insights` cards from LinkedIn-only links into full on-site article pages (`/insights/[slug]`) with reading time, SEO metadata, Article JSON-LD, sharing, and related content, while keeping the LinkedIn post as a secondary "view original" link.

**Architecture:** Two repos. `humanx-studio` gets two new fields on the existing `insight` document type (`slug`, `body`). `humanx-website` extends the existing `insightsQuery`/`loadInsights` data layer (same pattern as `EventDoc`/`loadEvents`) to carry `slug`, `body`, `publishedAt`, and a computed `readingTimeMinutes`, then adds a new `/insights/[slug]` route modeled directly on the existing `/events/[slug]` route. The listing page's card markup is extracted into a shared `InsightCard` component so the listing page and the new "related insights" section render identically.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), TypeScript, Sanity (GROQ), Tailwind CSS. No test framework is configured in either repo (`npm run lint` = ESLint is the only repo-level check) — verification in this plan uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks via the preview tooling instead of unit tests.

## Global Constraints

- Studio schema changes only — do not touch unrelated schema files. (from spec §Schema changes)
- Body is plain paragraphs (blank-line separated), no Portable Text / rich text object. (from spec §Schema changes)
- `href` remains on the schema; its role changes to "secondary LinkedIn link", never the primary card destination once a slug+body exist. (from spec §Schema changes)
- Reuse the existing `image` field for both hero and OG image — no new image field. (from spec §Schema changes)
- Static export (`output: "export"`) — every route must be enumerable at build time via `generateStaticParams`; a build must never produce a broken/empty page. (from spec §Build-safety fallback)
- Share row = LinkedIn share-intent link + "Copy link" button only (no X/Twitter). (from spec §Share row)
- Related insights = same-`kind` first, backfilled with most recent, excluding current, cap at 3. (from spec §Related insights)
- Never run `npm run seed:content` (wipes hand-uploaded images) — not needed for this work anyway.
- Do not commit unless explicitly asked; do commit after each task per the steps below only because the user has already approved this plan for implementation (confirm this is still the user's intent if picking this plan up cold).

---

### Task 1: Studio schema — add `slug` and `body` to `insight`

**Files:**
- Modify: `/Users/gautham/Documents/projects/humanx-studio/schemas/documents/insight.ts`

**Interfaces:**
- Produces: two new fields on the `insight` document type — `slug` (Sanity `slug` type, required) and `body` (Sanity `localizedText` type, optional). Later tasks' GROQ queries read these by name.

- [ ] **Step 1: Add the `slug` field, following the exact pattern in `schemas/documents/event.ts:21-35`**

Edit `schemas/documents/insight.ts`, inserting a new field right after `title` (before `kind`):

```ts
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "URL path segment — e.g. 'ai-rollouts-that-stick' for " +
        "/insights/ai-rollouts-that-stick. Required so the dedicated insight " +
        "page can be statically generated at build time.",
      type: "slug",
      options: {
        source: (doc) =>
          (doc as { title?: { en?: string } }).title?.en ?? "",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
```

- [ ] **Step 2: Add the `body` field, right after `date` (before `publishedAt`)**

```ts
    defineField({
      name: "body",
      title: "Body",
      description:
        "Full article text for the dedicated /insights/[slug] page. Plain " +
        "paragraphs separated by blank lines — newlines are preserved. " +
        "Insights without a body keep behaving as teaser-only cards (no " +
        "dedicated page is generated for them).",
      type: "localizedText",
    }),
```

- [ ] **Step 3: Update the `href` field's title/description to reflect its new secondary role**

Replace:

```ts
    defineField({
      name: "href",
      title: "External link (optional)",
      type: "url",
    }),
```

with:

```ts
    defineField({
      name: "href",
      title: "Original LinkedIn post (optional)",
      description:
        "Shown as a secondary \"View original on LinkedIn\" link on the " +
        "insight's dedicated page. Not the card's primary destination once " +
        "the insight has a slug + body — the card links to the on-site " +
        "page instead.",
      type: "url",
    }),
```

- [ ] **Step 4: Update the file's top-of-file comment (lines 3-8) — it currently says slug/body are a future upgrade**

Replace the comment block:

```ts
/**
 * One insights card on /insights. Currently the dict stored these as
 * teaser-only items (no body), so we mirror that shape: title + kind +
 * date + optional external href. Promote to full articles later by adding
 * a `body` field and a per-insight route.
 */
```

with:

```ts
/**
 * One insights card on /insights, and — once `slug` + `body` are filled in
 * — a full article at /insights/[slug]. Insights without a body still
 * render as teaser-only cards (see the website's build-safety fallback in
 * `loadInsights`), but the intended end state is every insight has one.
 */
```

- [ ] **Step 5: Verify the schema loads — run the Studio dev server and confirm no errors**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output (clean exit code 0).

Then start Studio (`npm run dev` in that repo, or use the preview tooling if already running) and open the "Insight" document type — confirm the "Slug" and "Body" fields appear, and "Original LinkedIn post" shows the new description.

- [ ] **Step 6: Commit**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/documents/insight.ts
git commit -m "feat: add slug + body fields to insight schema"
```

---

### Task 2: Website data layer — extend the insights query/loader

**Files:**
- Modify: `lib/sanity/queries.ts:125-147` (the `insightsQuery` block and `InsightDoc` type)
- Modify: `lib/sanity/loaders.ts:91-107` (the `InsightItem` type) and `lib/sanity/loaders.ts:171-191` (`loadInsights`)

**Interfaces:**
- Consumes: nothing new — same `sanityClient`, `pickLoc`, `fail` helpers already in `loaders.ts`.
- Produces: `InsightItem` now carries `slug: string`, `body: string`, `publishedAt: string`, `readingTimeMinutes: number`. Task 5 (listing page), Task 7 (detail page), and Task 3 (`articleSchema`) all consume this shape.

- [ ] **Step 1: Extend `insightsQuery` and `InsightDoc` in `lib/sanity/queries.ts`**

Replace the existing block (`lib/sanity/queries.ts:125-147`):

```ts
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
```

with:

```ts
/** Insights ordered newest-first by the `publishedAt` timestamp. */
export const insightsQuery = /* groq */ `
  *[_type == "insight"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    "slug": slug.current,
    title,
    kind,
    date,
    body,
    href,
    publishedAt,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt
  }
`;

export type InsightDoc = {
  id: string;
  /** URL path segment from the slug field. Undefined if author hasn't set one. */
  slug?: string;
  title: { en?: string; es?: string };
  kind?: { en?: string; es?: string };
  date?: { en?: string; es?: string };
  body?: { en?: string; es?: string };
  href?: string;
  publishedAt?: string;
  /** Resolved Sanity CDN URL of the uploaded card image, or undefined. */
  imageUrl?: string;
  imageAlt?: string;
};
```

- [ ] **Step 2: Extend `InsightItem` in `lib/sanity/loaders.ts`**

Replace (`lib/sanity/loaders.ts:91-107`):

```ts
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
```

with:

```ts
/** Flat row shape used by the insights grid and the /insights/[slug] page. */
export type InsightItem = {
  id: string;
  /**
   * URL path segment, or empty string when the author hasn't set one yet.
   * A dedicated /insights/[slug] page is only generated when both `slug`
   * and `body` are non-empty — see `loadInsights`'s build-safety fallback.
   */
  slug: string;
  title: string;
  kind: string;
  date: string;
  /** Full article text, paragraphs separated by blank lines. Empty string
   * when the author hasn't written one yet (teaser-only insight). */
  body: string;
  /** ~200 words/minute estimate from `body`, minimum 1. 0 when body is empty. */
  readingTimeMinutes: number;
  /** ISO datetime from the schema's `publishedAt`, or empty string. */
  publishedAt: string;
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
```

- [ ] **Step 3: Add a reading-time helper and update `loadInsights`**

Add this helper right above `loadInsights` (`lib/sanity/loaders.ts`, just before line 171):

```ts
/** ~200 words/minute estimate, rounded up, minimum 1 (0 for empty body). */
function readingTime(body: string): number {
  if (!body.trim()) return 0;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

Replace `loadInsights` (`lib/sanity/loaders.ts:171-191`):

```ts
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
```

with:

```ts
export async function loadInsights(locale: Locale): Promise<InsightItem[]> {
  try {
    const rows = await sanityClient.fetch<InsightDoc[]>(insightsQuery);
    return rows
      .map((row) => {
        const body = pickLoc(row.body, locale);
        return {
          id: row.id,
          slug: row.slug ?? "",
          title: pickLoc(row.title, locale),
          kind: pickLoc(row.kind, locale),
          date: pickLoc(row.date, locale),
          body,
          readingTimeMinutes: readingTime(body),
          publishedAt: row.publishedAt ?? "",
          href: row.href ?? "",
          // Sanity CDN URL (resolved in the GROQ projection via
          // `image.asset->url`). Empty string falls back to the brand-token
          // decorative tile in `app/[locale]/insights/page.tsx`.
          image: row.imageUrl ?? "",
          imageAlt: row.imageAlt ?? "",
        };
      })
      .filter((row) => row.title);
  } catch (err) {
    return fail("insights", err);
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If errors reference `app/[locale]/insights/page.tsx` accessing `item.image`/`item.imageAlt` on a union with the dict fallback type, that's expected until Task 5 — note it and continue; Task 5 fixes the page's consumption of this type.

- [ ] **Step 5: Commit**

```bash
git add lib/sanity/queries.ts lib/sanity/loaders.ts
git commit -m "feat: extend insight query/loader with slug, body, reading time"
```

---

### Task 3: `articleSchema()` JSON-LD helper

**Files:**
- Modify: `lib/seo/schema.ts`

**Interfaces:**
- Consumes: `InsightItem` from `lib/sanity/loaders.ts` (Task 2) — needs `title`, `body`, `image`, `slug`, `publishedAt`.
- Produces: `articleSchema(insight, locale)` — used by Task 7's detail page.

- [ ] **Step 1: Add the import and the function**

In `lib/seo/schema.ts`, update the top import line:

```ts
import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";
import type { EventItem, InsightItem, VideoItem } from "@/lib/sanity/loaders";
```

Add this function after `eventSchema` (after `lib/seo/schema.ts` line 75, before the `servicesSchema` block):

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/schema.ts
git commit -m "feat: add articleSchema JSON-LD helper for insight pages"
```

---

### Task 4: i18n strings for the insight detail page

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (inside the `insights` block, `lib/i18n/dictionaries/en.ts:412-...`)
- Modify: `lib/i18n/dictionaries/es.ts` (inside the `insights` block, `lib/i18n/dictionaries/es.ts:395-...`)

**Interfaces:**
- Produces: `dict.insights.readingTime` (contains a literal `"{n}"` placeholder — callers do `t.readingTime.replace("{n}", String(n))`), `dict.insights.viewOnLinkedIn`, `dict.insights.share`, `dict.insights.copyLink`, `dict.insights.linkCopied`, `dict.insights.moreInsights`, `dict.insights.backToInsights`. Task 6 (`InsightShare`) and Task 7 (detail page) consume these.

- [ ] **Step 1: Add the new keys to `en.ts`**

In `lib/i18n/dictionaries/en.ts`, inside the `insights: { ... }` block, right after the existing `linkedinUrl: "https://www.linkedin.com/in/ramon-portilla-627b064/",` line (`lib/i18n/dictionaries/en.ts:418`), add:

```ts
    backToInsights: "← Back to insights",
    readingTime: "{n} min read",
    viewOnLinkedIn: "View original on LinkedIn",
    share: "Share",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    moreInsights: "More insights",
```

- [ ] **Step 2: Add the matching keys to `es.ts`**

In `lib/i18n/dictionaries/es.ts`, inside the `insights: { ... }` block (starts at `lib/i18n/dictionaries/es.ts:395`), add the equivalent keys in the same position (right after that block's `linkedinUrl` line):

```ts
    backToInsights: "← Volver a insights",
    readingTime: "{n} min de lectura",
    viewOnLinkedIn: "Ver publicación original en LinkedIn",
    share: "Compartir",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    moreInsights: "Más insights",
```

- [ ] **Step 3: Typecheck — confirms `es.ts`'s structure still matches the `Dictionary` type derived from `en.ts`**

Run: `npx tsc --noEmit`
Expected: no errors. If `es.ts` reports a missing/extra key, fix it so both files declare exactly the same key set inside `insights`.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/es.ts
git commit -m "feat: add i18n strings for insight detail page"
```

---

### Task 5: Extract `InsightCard`, update the listing page

**Files:**
- Create: `components/sections/InsightCard.tsx`
- Modify: `app/[locale]/insights/page.tsx`

**Interfaces:**
- Consumes: `InsightItem` shape from Task 2 (structurally — see `InsightCardData` below, which is intentionally looser so the dict-fallback items in `en.ts`'s `insights.items` still satisfy it).
- Produces: `InsightCard` component — also consumed by Task 7's "related insights" section. Exports `InsightCardData` type and `TILE_ROLES`.

- [ ] **Step 1: Create `components/sections/InsightCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";

/**
 * Loose shape so both real `InsightItem` rows (lib/sanity/loaders.ts) and
 * the dict-fallback teaser objects in lib/i18n/dictionaries/en.ts's
 * `insights.items` satisfy this type — the fallback objects don't carry
 * `slug`/`body`/`imageAlt`, which is fine since those are optional here.
 */
export type InsightCardData = {
  id: string;
  title: string;
  kind: string;
  date: string;
  href?: string;
  slug?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
};

// Decorative fallback when an item has no image yet. Each card pulls a brand
// token (orange/violet/magenta) so the grid looks composed instead of empty.
// Using design tokens means a theme flip recolours these naturally.
export const TILE_ROLES = [
  { hue: "var(--color-accent)", angle: 130 },
  { hue: "var(--color-violet)", angle: 25 },
  { hue: "var(--color-magenta)", angle: 215 },
  { hue: "var(--color-accent)", angle: 305 },
  { hue: "var(--color-violet)", angle: 95 },
  { hue: "var(--color-magenta)", angle: 165 },
] as const;

/**
 * One insight card. Links to the on-site /insights/[slug] page when the
 * insight has both a slug and a body (i.e. a dedicated page was actually
 * generated for it at build time — see loadInsights's build-safety
 * fallback). Otherwise falls back to an external `href` if present, or
 * renders non-interactive.
 */
export function InsightCard({
  item,
  index,
  locale,
}: {
  item: InsightCardData;
  index: number;
  locale: string;
}) {
  const role = TILE_ROLES[index % TILE_ROLES.length];
  const hasImage = Boolean(item.image);
  const imageAlt = item.imageAlt || item.title;
  const hasDetailPage = Boolean(item.slug && item.body);
  const externalHref =
    !hasDetailPage && item.href && /^https?:\/\//.test(item.href)
      ? item.href
      : "";

  const cardInner = (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
        {hasImage ? (
          <Image
            src={item.image as string}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 90% at ${30 + (index % 3) * 20}% ${30 + (index % 2) * 30}%, color-mix(in oklch, ${role.hue} 35%, transparent), transparent 65%), linear-gradient(${role.angle}deg, var(--color-bg-elev), var(--color-bg))`,
            }}
          />
        )}
        {!hasImage && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        )}
        <span
          aria-hidden
          className="absolute left-5 top-5 font-display text-2xl tabular-nums text-ink/80 mix-blend-difference"
          style={{ fontVariationSettings: '"SHRP" 80' }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-4 px-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
          {item.kind} · {item.date}
        </div>
        <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl transition group-hover:text-accent">
          {item.title}
        </h3>
      </div>
    </article>
  );

  if (hasDetailPage) {
    return (
      <Link
        href={`/${locale}/insights/${item.slug}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {cardInner}
      </Link>
    );
  }

  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {cardInner}
      </a>
    );
  }

  return cardInner;
}
```

- [ ] **Step 2: Update `app/[locale]/insights/page.tsx` to use it**

Add the import (near the other imports at the top):

```ts
import { InsightCard } from "@/components/sections/InsightCard";
```

Replace the entire card-grid `<ul>` block (`app/[locale]/insights/page.tsx:112-193`, from `<ul className="mt-10 grid ...">` through its closing `</ul>`) with:

```tsx
          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <li key={item.id}>
                <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                  <InsightCard item={item} index={idx} locale={locale} />
                </Reveal>
              </li>
            ))}
          </ul>
```

Now remove the now-unused `TILE_ROLES` constant and `Image` import from this file (`app/[locale]/insights/page.tsx:2` and `:34-41`) — both moved into `InsightCard.tsx`. Also remove the now-dead comment above the section at `app/[locale]/insights/page.tsx:100-103` ("Card grid. When item.image is provided...") since the logic it describes now lives in `InsightCard`; replace it with a one-line pointer:

```tsx
      {/* Card grid — see components/sections/InsightCard.tsx for the
       * link/fallback logic. */}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors (in particular, no "unused import" for `Image`/`TILE_ROLES` in `page.tsx`).

- [ ] **Step 4: Manual browser check**

Start the dev server (preview tooling) and open `/en/insights`. Confirm the grid renders exactly as before (dict-fallback items, since no real insight has a slug+body yet) — cards should look and behave identically to before this change (non-clickable, since the dict items' `href` values are `#i1`-style anchors, not `http`).

- [ ] **Step 5: Commit**

```bash
git add components/sections/InsightCard.tsx app/[locale]/insights/page.tsx
git commit -m "refactor: extract InsightCard, link insights to on-site detail pages"
```

---

### Task 6: `InsightShare` component

**Files:**
- Create: `components/sections/InsightShare.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks directly — takes `url` and `labels` as props.
- Produces: `InsightShare` component, consumed by Task 7's detail page.

- [ ] **Step 1: Create `components/sections/InsightShare.tsx`**

```tsx
"use client";

import { useState } from "react";

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

/**
 * Share row for an /insights/[slug] page: a LinkedIn share-intent link plus
 * a "copy link" button. `url` must be the absolute canonical URL of the
 * page (built by the caller from SITE_URL).
 */
export function InsightShare({
  url,
  labels,
}: {
  url: string;
  labels: { share: string; copyLink: string; linkCopied: string };
}) {
  const [copied, setCopied] = useState(false);
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-line pt-8">
      <span className="text-xs uppercase tracking-[0.3em] text-ink-dim">
        {labels.share}
      </span>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        <LinkedInIcon />
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="text-sm text-ink-dim transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {copied ? labels.linkCopied : labels.copyLink}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/InsightShare.tsx
git commit -m "feat: add InsightShare component (LinkedIn share + copy link)"
```

---

### Task 7: `/insights/[slug]` detail page

**Files:**
- Create: `app/[locale]/insights/[slug]/page.tsx`

**Interfaces:**
- Consumes: `loadInsights` + `InsightItem` (Task 2), `articleSchema` (Task 3), `dict.insights.*` (Task 4), `InsightCard`/`InsightCardData` (Task 5), `InsightShare` (Task 6), `pageMetadata` (`lib/seo/metadata.ts`, existing), `sanityImageUrl` (`lib/sanity/image-loader.ts`, existing), `JsonLd` (`components/seo/JsonLd.tsx`, existing).
- Produces: the route itself — no other task depends on this file.

- [ ] **Step 1: Create the file, modeled directly on `app/[locale]/events/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadInsights } from "@/lib/sanity/loaders";
import { sanityImageUrl } from "@/lib/sanity/image-loader";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema } from "@/lib/seo/schema";
import { InsightCard } from "@/components/sections/InsightCard";
import { InsightShare } from "@/components/sections/InsightShare";
import { pageMetadata, SITE_URL } from "@/lib/seo/metadata";

/**
 * Dedicated insight article at /[locale]/insights/[slug].
 *
 * `output: "export"` means every (locale, slug) pair has to be enumerated
 * by `generateStaticParams` at build time. Only insights with BOTH a slug
 * and a body get a page — see loadInsights's build-safety fallback in
 * lib/sanity/loaders.ts. Mirrors app/[locale]/events/[slug]/page.tsx.
 */

type Params = { locale: string; slug: string };

function hasDetailPage(insight: { slug: string; body: string }) {
  return Boolean(insight.slug && insight.body);
}

export async function generateStaticParams() {
  // English as the source of truth for slug enumeration — slugs aren't
  // localized (same URL segment in every locale).
  const insights = await loadInsights("en");
  const params: Params[] = [];
  for (const locale of locales) {
    for (const insight of insights) {
      if (hasDetailPage(insight)) params.push({ locale, slug: insight.slug });
    }
  }
  // `output: "export"` requires at least one param to pre-render the route.
  // When no insight has a slug+body yet (fresh schema rollout), register a
  // placeholder so the build can resolve the route; the page calls
  // notFound() so it renders a 404.
  if (params.length === 0) {
    for (const locale of locales) {
      params.push({ locale, slug: "_placeholder" });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const insights = await loadInsights(locale as Locale);
  const insight = insights.find((i) => i.slug === slug && hasDetailPage(i));
  if (!insight) return {};
  const description = insight.body.slice(0, 160);
  return pageMetadata({
    locale,
    path: `/insights/${slug}`,
    title: `${insight.title} · HumanX Insights`,
    description,
    images: insight.image
      ? [{ url: insight.image, alt: insight.imageAlt || insight.title }]
      : undefined,
  });
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const [dict, insights] = await Promise.all([
    getDictionary(locale as Locale),
    loadInsights(locale as Locale),
  ]);
  const t = dict.insights;

  const insight = insights.find((i) => i.slug === slug && hasDetailPage(i));
  if (!insight) notFound();

  // Related insights: same `kind` first, backfilled with the most recent
  // remaining ones (insights is already ordered newest-first by the
  // query), excluding the current one, capped at 3. Only insights with a
  // dedicated page are eligible.
  const candidates = insights.filter(
    (i) => i.slug !== insight.slug && hasDetailPage(i)
  );
  const sameKind = candidates.filter((i) => i.kind === insight.kind);
  const rest = candidates.filter((i) => i.kind !== insight.kind);
  const related = [...sameKind, ...rest].slice(0, 3);

  const bodyParagraphs = insight.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const readingLabel = t.readingTime.replace(
    "{n}",
    String(insight.readingTimeMinutes)
  );
  const canonicalUrl = `${SITE_URL}/${locale}/insights/${slug}`;

  return (
    <main id="main" className="relative">
      <JsonLd data={articleSchema(insight, locale)} />
      <section className="relative px-6 pt-10 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-32">
        <div className="mx-auto max-w-3xl">
          <Reveal direction="up">
            <Link
              href={`/${locale}/insights`}
              className="inline-flex items-center text-xs uppercase tracking-[0.3em] text-ink-dim hover:text-ink transition"
            >
              {t.backToInsights}
            </Link>
          </Reveal>

          <article className="mt-8">
            <Reveal direction="up" delay={0.05}>
              <div className="text-xs uppercase tracking-[0.3em] text-accent">
                {[insight.kind, insight.date, readingLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tight">
                {insight.title}
              </h1>
            </Reveal>

            {insight.image ? (
              <Reveal direction="up" delay={0.15}>
                <img
                  src={sanityImageUrl(insight.image, 900)}
                  alt={insight.imageAlt || insight.title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="mt-8 w-full rounded-2xl border border-line object-cover"
                />
              </Reveal>
            ) : null}

            {bodyParagraphs.length > 0 ? (
              <Reveal direction="up" delay={0.2}>
                <div className="mt-8 space-y-5 font-serif text-base leading-relaxed text-ink-dim md:text-lg">
                  {bodyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {insight.href ? (
              <Reveal direction="up" delay={0.25}>
                <a
                  href={insight.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-bright"
                >
                  {t.viewOnLinkedIn}
                  <span aria-hidden>↗</span>
                </a>
              </Reveal>
            ) : null}

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
          </article>

          {related.length > 0 ? (
            <aside className="mt-16 border-t border-line pt-10">
              <Reveal direction="up" delay={0.1}>
                <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
                  {t.moreInsights}
                </h2>
                <span aria-hidden className="mt-3 inline-block h-px w-8 bg-accent" />
              </Reveal>

              <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item, idx) => (
                  <li key={item.id}>
                    <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                      <InsightCard item={item} index={idx} locale={locale} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Build (static export) — proves `generateStaticParams` resolves cleanly with zero real insights**

Run: `npm run build`
Expected: build succeeds. Since no real insight has a slug+body yet, this exercises the `_placeholder` fallback path — confirm the build output includes `out/en/insights/_placeholder/index.html` (or equivalent) and does not error.

- [ ] **Step 4: Manual browser verification with temporary mock data**

This mirrors how the `DownloadPromo` feature was verified earlier in this project: temporarily inject one fake insight so the new page is visually testable, then revert.

In `lib/sanity/loaders.ts`, temporarily change the `return rows...` line inside `loadInsights` to append one mock row for local testing only:

```ts
      .filter((row) => row.title)
      .concat([
        {
          id: "mock-1",
          slug: "mock-insight",
          title: "Mock insight for manual QA",
          kind: "Field note",
          date: "July 2026",
          body: "This is a temporary mock insight used only to verify the detail page renders correctly.\n\nIt has two paragraphs so the reading-time and paragraph-split logic can both be checked visually. Remove this mock before committing.",
          readingTimeMinutes: 1,
          publishedAt: new Date().toISOString(),
          href: "https://www.linkedin.com/company/humanx-insights",
          image: "",
          imageAlt: "",
        },
      ]);
```

Start the dev server (preview tooling), then:
- Open `/en/insights` — confirm the mock card appears and links to `/en/insights/mock-insight`.
- Open `/en/insights/mock-insight` directly — confirm: back link, kind/date/reading-time row, title, body paragraphs, the "View original on LinkedIn" link (opens the href in a new tab), the share row (LinkedIn icon + "Copy link" — click it and confirm the button briefly shows "Link copied"), and no related-insights section (since the mock is the only detail-page-eligible insight).
- Inspect the page source or devtools for the `<script type="application/ld+json">` tag and confirm it contains `"@type": "Article"` with the mock's title.
- Check `<title>`/OG tags in devtools match the mock insight's title.

- [ ] **Step 5: Revert the temporary mock**

```bash
git diff lib/sanity/loaders.ts
git checkout -- lib/sanity/loaders.ts
```

Confirm `git status` shows `lib/sanity/loaders.ts` clean (no pending changes) before proceeding.

- [ ] **Step 6: Commit the detail page**

```bash
git add app/\[locale\]/insights/\[slug\]/page.tsx
git commit -m "feat: add /insights/[slug] detail page"
```

---

### Task 8: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Typecheck both repos**

```bash
cd /Users/gautham/Documents/projects/humanx-website && npx tsc --noEmit
cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit
```

Expected: both clean.

- [ ] **Step 2: Lint the website repo**

```bash
cd /Users/gautham/Documents/projects/humanx-website && npm run lint
```

Expected: clean.

- [ ] **Step 3: Full static build**

```bash
cd /Users/gautham/Documents/projects/humanx-website && npm run build
```

Expected: succeeds, no broken-page errors.

- [ ] **Step 4: `git status` sanity check on both repos**

```bash
cd /Users/gautham/Documents/projects/humanx-website && git status
cd /Users/gautham/Documents/projects/humanx-studio && git status
```

Expected: only the files listed in this plan's tasks are modified/added; no leftover mock/test edits (in particular, re-confirm `lib/sanity/loaders.ts` has no mock insight left in it from Task 7 Step 4).

- [ ] **Step 5: Report to the user**

Summarize what shipped, and flag the two manual/non-code follow-ups:
1. Existing insights need `body` (and `slug`) filled in via Studio before their cards start linking on-site — until then they keep behaving exactly as today (per the build-safety fallback).
2. Static export means adding/editing an insight's slug/body requires a redeploy to appear live.
