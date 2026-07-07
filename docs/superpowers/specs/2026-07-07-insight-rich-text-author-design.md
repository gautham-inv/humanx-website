# Insight Rich Text Body + Author

Date: 2026-07-07

## Problem

This is an addendum to [2026-07-07-insight-detail-pages-design.md](2026-07-07-insight-detail-pages-design.md).
While backfilling content for the 6 existing insights (none of which have a
`body` yet), two gaps surfaced that the original spec explicitly deferred:

1. The `body` field is plain text — no way to place an image inline within
   an article, or use bold/italic/links.
2. There's no author field — the byline is hardcoded to "Ramon Portilla" in
   `articleSchema()`, with no visible byline in the UI at all.

This spec upgrades `insight.body` to rich text (Portable Text) with inline
images and basic marks, and adds a reusable `author` document referenced
from each insight. It does **not** cover writing the actual article content
for the 6 existing insights — that's a follow-up content-authoring step
once this infrastructure exists.

## Schema changes (humanx-studio repo)

**New `schemas/objects/localizedRichText.ts`** — the rich-text analogue of
the existing `localizedText.ts` (which explicitly flagged this as a future
upgrade: "If we ever need inline emphasis or links, upgrade specific fields
to `localizedRichText` (TBD)"). Same `{ en, es }` shape, but each locale is
an `array` field instead of `text`:

- Block content (`type: "block"`) restricted to the `normal` style only (no
  headings/lists/blockquote — out of scope per this spec's scope decision),
  with `strong` and `em` marks and an annotation for links (`href`, `url`
  type).
- An `image` array member (`hotspot: true`, plus an `alt` field) for inline
  images within the article.

**New `schemas/documents/author.ts`** — reusable author profile:
- `name` (string, required).
- `photo` (image, `hotspot: true`, with an `alt` field) — optional.

**`schemas/documents/insight.ts` changes:**
- `body` field type changes from `localizedText` to `localizedRichText`.
  Since none of the 6 existing insights have any body content yet, this is
  a clean type swap with no data migration.
- New `author` field — `reference` to `author`, optional. When unset, the
  website falls back to the name "Ramon Portilla" with no photo (see Data
  layer below) rather than requiring every insight to set one.

## Data layer (humanx-website repo)

- Add the `@portabletext/react` dependency.
- New `lib/sanity/portableText.tsx`:
  - `InsightBody({ value })` — renders the Portable Text block array with
    custom components: paragraphs styled to match the existing body
    typography (font-serif, `text-ink-dim`, spacing), `strong`/`em` passed
    through, links styled as `text-accent hover:text-accent-bright`
    (matching the existing "View original on LinkedIn" link style), and
    images resolved via `sanityImageUrl` and rendered full-width with
    rounded corners (matching the existing hero image treatment).
  - `portableTextToPlainText(blocks)` — flattens block text into a single
    plain string. Replaces the old string-based logic for:
    - Reading time (`readingTime()` in `loaders.ts` now takes the flattened
      string).
    - Meta description (`generateMetadata`'s `insight.body.slice(0, 160)`
      becomes `portableTextToPlainText(insight.body).slice(0, 160)`).
    - JSON-LD `description` in `articleSchema()` (same change).

- `lib/sanity/queries.ts`: `insightsQuery` gains
  `"author": author->{name, "photoUrl": photo.asset->url, "photoAlt": photo.alt}`.
  `InsightDoc.body` type changes from `{ en?: string; es?: string }` to
  `{ en?: PortableTextBlock[]; es?: PortableTextBlock[] }` (or an equally
  loose array type — no need to pull in `@portabletext/types` for a full
  block type if a minimal local type covers what's rendered).

- `lib/sanity/loaders.ts`:
  - `InsightItem.body` becomes the raw Portable Text block array for the
    resolved locale (`PortableTextBlock[]`), not a string.
  - New `InsightItem.authorName: string` (defaults to `"Ramon Portilla"`
    when the insight has no `author` reference) and
    `InsightItem.authorPhotoUrl: string` (empty string when none).
  - `readingTime()` and any body-derived text now go through
    `portableTextToPlainText()` first.

## Detail page changes

`app/[locale]/insights/[slug]/page.tsx`:
- Replace the `bodyParagraphs.split(/\n{2,}/)...` block with
  `<InsightBody value={insight.body} />`.
- Add a byline directly below the existing kind/date/reading-time meta row:
  a small circular photo (when `authorPhotoUrl` is set) next to
  `authorName`; when no photo, just the name in the same style used
  elsewhere for secondary metadata (`text-ink-dim`, small size).
- `hasDetailPage(insight)` changes from `Boolean(insight.slug && insight.body)`
  (string truthiness) to `Boolean(insight.slug && insight.body.length > 0)`
  (array length) — used identically everywhere it's currently used
  (`InsightCard`'s link/fallback logic, `generateStaticParams`,
  `generateMetadata`, the related-insights filter).

`lib/seo/schema.ts`: `articleSchema()`'s hardcoded
`author: { "@type": "Person", name: "Ramon Portilla" }` becomes
`author: { "@type": "Person", name: insight.authorName }`.

## Out of scope

- Headings, lists, and blockquote block styles (per the earlier rich-text
  formatting question — bold/italic/links + inline images only).
- Author bio text, social links, or a dedicated author listing/page — the
  `author` document is intentionally minimal (name + photo) for now.
- Writing the actual article bodies for the 6 existing insights — a
  separate content-authoring step, using this new rich-text infrastructure,
  once it ships.
- Migrating any existing body content — none exists yet, so this is a
  clean type change with no backfill needed.

## Testing / verification

- Build both repos; confirm `insight.ts`'s schema loads in Studio with the
  new `body` (rich text) and `author` (reference) fields, and that
  `author.ts` appears as its own document type in the Studio sidebar.
- Manually create one temporary mock insight (same technique as the
  original spec) with a body containing at least: two paragraphs, one bold
  and one italic span, one link, and one inline image; and an author with
  a photo. Verify on the detail page: paragraphs render, bold/italic/link
  render correctly, the inline image renders at the correct position and
  size, and the byline shows the photo + name.
- Verify `articleSchema()`'s JSON-LD `author.name` reflects the mock
  author, not the hardcoded "Ramon Portilla".
- Verify an insight with no `author` reference falls back to "Ramon
  Portilla" with no photo, with no runtime errors.
- Revert the temporary mock before committing, same as the original spec's
  verification step.
