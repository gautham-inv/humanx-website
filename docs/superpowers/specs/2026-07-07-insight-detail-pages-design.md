# Insight Detail Pages

Date: 2026-07-07

## Problem

`/insights` cards currently link straight out to LinkedIn posts. This makes the
site dependent on LinkedIn as the source of truth, loses SEO value, and gives
no control over presentation (no reading time, no OG/social metadata, no
internal linking). The fix is to make the website the primary home for each
Insight: full on-site article pages, published there first, with the LinkedIn
post becoming a secondary pointer back to the site rather than the other way
around.

Scope is limited to this one change (full Insight article pages). Related
audit items (publication SEO metadata, HubSpot nurture workflows, contextual
CTAs across the site) are explicitly out of scope for this spec.

## Schema changes (humanx-studio repo)

`schemas/documents/insight.ts`:

- Add `slug` — `slug` type, required, `source: title.en`, `maxLength: 96`.
  Same pattern as `schemas/documents/event.ts`.
- Add `body` — plain multi-paragraph text (same `localizedText` pattern
  already used for other document bodies on this site — paragraphs are
  separated by blank lines, no rich-text/Portable Text object). Required
  going forward for new insights; existing insights need it backfilled (see
  "Content workflow" below).
- `href` stays, but its field description changes from implying it's the
  primary destination to: "Original LinkedIn post (optional) — shown as a
  secondary link on the article page." Behavior does not change structurally,
  only its role.
- `image` is reused as-is for both the article hero image and the OG/social
  share image. No new field.

## Data layer (humanx-website repo)

`lib/sanity/queries.ts`:

- `insightsQuery` (listing) gains `slug`.
- New `insightBySlugQuery` — single insight by `slug` for a given locale,
  selecting `title, kind, date, body, href, image, imageAlt, slug`.
- New `insightSlugsQuery` — all `slug` values, for static param generation.

`lib/sanity/loaders.ts`:

- `loadInsights()` — existing loader, updated to also return `slug` per item.
- `loadInsightSlugs()` — returns all slugs (mirrors the Events slug loader).
- `loadInsightBySlug(locale, slug)` — returns the full `InsightDetail` shape:
  `{ id, slug, title, kind, date, body: string[], href, image, imageAlt,
  readingTimeMinutes }`.
  - `body` is split into paragraphs (blank-line-separated) at load time, same
    as the Events body handling.
  - `readingTimeMinutes` is computed from total word count across paragraphs
    at ~200 words/minute, rounded up, minimum 1.
  - If the doc has no `body` at all, the loader returns `null` for that slug
    (see "Build-safety fallback" below) rather than throwing.

## New route: `/insights/[slug]`

`app/[locale]/insights/[slug]/page.tsx`, modeled directly on
`app/[locale]/events/[slug]/page.tsx`:

- `generateStaticParams()` — enumerates `(locale, slug)` from
  `loadInsightSlugs()`.
- `generateMetadata()` — via the existing `pageMetadata()` helper
  (`lib/seo/metadata.ts`). Uses the insight's `image` as the OG image (falls
  back to the site default `/og.png` if absent) and the first ~160 characters
  of the first body paragraph as the meta description if no separate
  description field is introduced.
- New `articleSchema()` helper in `lib/seo/schema.ts`, modeled on the existing
  `eventSchema()` — emits Schema.org `Article` JSON-LD (headline, image,
  datePublished, author reference to the existing person schema).
- Page layout, top to bottom:
  1. Back link to `/insights`.
  2. Meta row: `kind · date · "{n} min read"`.
  3. Title.
  4. Hero image (same treatment as the listing card image, or the existing
     decorative gradient-tile fallback when no image).
  5. Body paragraphs.
  6. "View original on LinkedIn" link — only rendered when `href` is set.
  7. Share row (see below).
  8. Related insights (see below).

### Share row

New small client component (e.g. `components/sections/InsightShare.tsx`):

- LinkedIn share-intent link (`https://www.linkedin.com/sharing/share-offsite/?url=...`)
  opening in a new tab.
- "Copy link" button using the Clipboard API, with a brief inline "Link
  copied" confirmation state (auto-reverts after ~2s), matching the site's
  existing microcopy/animation conventions.

### Related insights

- 2–3 cards below the share row.
- Selection: other insights with the same `kind` first; if fewer than the
  target count, backfill with the most recent remaining insights (excluding
  the current one).
- Reuses the listing page's card markup. The card markup is extracted out of
  `app/[locale]/insights/page.tsx` into a small shared component (e.g.
  `components/sections/InsightCard.tsx`) so the listing page and the related
  section don't duplicate markup.

## Listing page changes

`app/[locale]/insights/page.tsx`:

- Every card now links internally to `/insights/[slug]`.
- The current "external URL → `<a>`, else static `<article>`" branch is
  removed — replaced by the shared `InsightCard` component, which always
  links to the detail route (or renders non-clickable only in the
  build-safety fallback case below).

## Build-safety fallback

This site is a static export — a build must never produce a broken or empty
page. If an insight has no `body` at build time (bad data entry, not a
supported ongoing mode):

- `loadInsightBySlug` / `loadInsightSlugs` exclude that insight from detail
  page generation entirely (no `/insights/[slug]` page is built for it).
- The listing card for that insight falls back to linking straight to `href`
  if one is set, or renders as a non-clickable teaser if neither `body` nor
  `href` is present.
- Failures are caught and logged via `console.warn`, matching the existing
  pattern in `loaders.ts` (e.g. `loadDownloadPromo`), never thrown.

This is a safety net, not a designed feature — the intended end state is that
every insight has a body.

## Content workflow (client-facing, not code)

Existing insights need `body` backfilled in Studio before this ships fully
(full migration, not a mixed rollout). Until an individual insight has a
body, it keeps behaving exactly as it does today (external link, no detail
page) via the build-safety fallback above — this is incidental resilience,
not something the client should rely on long-term.

## i18n additions

`lib/i18n/dictionaries/{en,es}.ts`, new `insights` detail-page strings:
`readingTime` ("{n} min read"), `viewOnLinkedIn`, `share`, `copyLink`,
`linkCopied`, `moreInsights` (related section heading).

## Out of scope

- Rich text / Portable Text body (plain paragraphs only, per this spec).
- Publication SEO metadata improvements (separate audit item).
- HubSpot nurture workflows (separate audit item).
- Site-wide contextual CTA system (separate audit item).
- Backfilling existing insight bodies (client content work, not engineering).

## Testing / verification

- Build the site; confirm `/insights` lists all insights with slugs, and each
  `/insights/[slug]` page renders body, hero image, reading time, and (when
  present) the LinkedIn link.
- Verify OG tags and Article JSON-LD via browser devtools on a detail page.
- Verify share row: LinkedIn share intent opens correctly, copy link puts the
  correct URL on the clipboard and shows the confirmation state.
- Verify related insights populate correctly (same-kind-first, backfilled,
  excludes current).
- Verify the build-safety fallback: temporarily test an insight with no body
  and confirm no broken page is generated and the listing card degrades
  gracefully.
