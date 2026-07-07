# Publications Structured Data + Insight CTA Row

Date: 2026-07-07

## Problem

Two remaining items from the original site audit, both independently small
and non-overlapping in files, so they're covered by one spec:

1. **Publications SEO** — the `/publications` listing page has titles, meta
   descriptions, and OG images (via `pageMetadata()`), but no structured
   data at all. Events and Insights both have JSON-LD; Publications don't.
2. **Contextual CTAs on Insights** — the insight detail page already has a
   "More insights" related-content section, but no CTA pointing at other
   parts of the site (publications, events). A third proposed CTA, "join
   mailing list," is dropped from scope: no mailing-list signup mechanism
   exists anywhere on the site today (no HubSpot form GUID configured for
   it, no component renders the unused `newsletterBlock` Sanity content),
   so there's nothing real to link to yet.

## Publications structured data

**`lib/sanity/queries.ts` / `lib/sanity/loaders.ts`:** `publicationsQuery`
doesn't currently select `publishedAt` (only the human-readable `date`
display string). Add it, mirroring the pattern already used for events and
insights:
- `publicationsQuery` gains `publishedAt`.
- `PublicationDoc.publishedAt?: string`.
- `PublicationItem.publishedAt: string` (ISO datetime, empty string when
  unset) — set in `loadPublications`.

**`lib/seo/schema.ts`:** new `publicationSchema(items, locale)`, modeled on
the existing `servicesSchema(items, locale)` (same "one node per listing
item" shape, since publications have no detail page to attach per-item
schema to individually):

```ts
export function publicationSchema(items: PublicationItem[], locale: string) {
  return items.map((item) => ({
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: item.title,
    ...(item.publishedAt ? { datePublished: item.publishedAt } : {}),
    ...(item.file ? { url: item.file } : {}),
    encodingFormat: "application/pdf",
    author: { "@type": "Person", name: "Ramon Portilla" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  }));
}
```

**`app/[locale]/publications/page.tsx`:** render
`<JsonLd data={publicationSchema(items, locale)} />` — `items` is whatever
list the page already renders (Sanity-sourced or dict fallback, same
pattern as the Insights listing page).

## Insight CTA row

**New `components/sections/InsightCtaRow.tsx`** — two static link-cards,
no data-fetching:

```tsx
import Link from "next/link";

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
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta"
      >
        {labels.explorePublications} →
      </Link>
      <Link
        href={`/${locale}/events`}
        className="rounded-2xl border border-line px-6 py-5 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta"
      >
        {labels.seeEvents} →
      </Link>
    </div>
  );
}
```

(Exact copy/styling refined during implementation to match the site's
existing card conventions — this is the shape, not final pixel values.)

**`app/[locale]/insights/[slug]/page.tsx`:** render `<InsightCtaRow>`
right after the `<InsightShare>` row and before the "More insights"
`<aside>` block.

**i18n:** new `dict.insights.explorePublications` and
`dict.insights.seeEvents` strings in `en.ts`/`es.ts`.

## Out of scope

- "Join mailing list" CTA — no real signup mechanism exists; adding one
  requires a new HubSpot form GUID from the client, which is a separate,
  client-driven follow-up, not this spec.
- Per-insight "relevant" publication matching — insights and publications
  have no linking field; the CTA goes to the publications listing instead
  of guessing which single PDF is "relevant."
- Per-insight "soonest upcoming event" enrichment — the CTA links to the
  events listing instead of pulling a specific event inline.

## Testing / verification

- Build the site; confirm `/publications` renders valid `DigitalDocument`
  JSON-LD (one node per publication) via browser devtools.
- Confirm an insight detail page shows the CTA row with working links to
  `/publications` and `/events` in the correct locale.
- Typecheck, lint, build — same verification bar as the prior specs in
  this project (no test framework configured).
