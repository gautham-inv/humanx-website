# Homepage "Latest news" Section

Date: 2026-08-06

## Problem

Ramon's keynote at Retail Media Summit Chile 2026 was covered by the Chilean
marketing publication BULB! in two articles. He wants these surfaced on the
homepage as a "Latest news" box, and wants a URL he can link to from a
LinkedIn post — publishing the first article one day and the second two days
later.

Nothing like this exists today: the homepage has no news/press section, and
press mentions have no home in the CMS. `insight` documents were considered
and explicitly rejected — press coverage *about* Ramon should stay separate
from Ramon's own writing.

## Decisions

- **Separate `news` document type**, not reused `insight` documents.
- **No detail pages.** The LinkedIn post links to a homepage anchor
  (`/en#news`, `/es#news`). Chosen over per-item `/news/[slug]` pages.
- **Latest 3, newest first.** Older items roll off automatically.
- **Placed immediately after the Hero** on the homepage.
- **Per-item `enabled` toggle**, default off — this is what allows both
  articles to be seeded now and published on separate days.
- **Images uploaded in Studio** by the client, not committed to the repo.
- **Article copy seeded by script** from the exact EN/ES text supplied.

## Schema changes (humanx-studio repo)

New `schemas/documents/news.ts`:

- `title` — `localizedString`, required.
- `body` — `localizedText` (the blurb). Plain paragraphs; the supplied
  blurbs contain no emphasis, links, or inline images, so `localizedRichText`
  is unnecessary here.
- `source` — `string`, the publication name (e.g. `BULB! Marketing Magazine`).
- `articleUrl` — `url`, required, the external article link.
- `date` — `localizedString`, human-readable display label.
- `publishedAt` — `datetime`, sort key (newest first).
- `image` — `image` (`hotspot: true`) with an `alt` sub-field.
- `enabled` — `boolean`, `initialValue: false`. When off, the item is
  excluded from the site entirely.

Registered in `schemas/index.ts` under the "lists" section. Not a singleton.

## Data layer (humanx-website repo)

`lib/sanity/queries.ts`:

```
newsQuery = *[_type == "news" && enabled == true]
  | order(publishedAt desc, _createdAt desc) {
    "id": _id, title, body, source, articleUrl, date, publishedAt,
    "imageUrl": image.asset->url, "imageAlt": image.alt
  }
```

plus a `NewsDoc` type mirroring it.

`lib/sanity/loaders.ts`: `NewsItem` flat row shape
(`{ id, title, body, source, articleUrl, date, publishedAt, imageUrl, imageAlt }`)
and `loadNews(locale)`, following the existing loader pattern — `pickLoc`
for localized fields, `.filter(row => row.title && row.articleUrl)`, and
`fail("news", err)` on error so a Sanity outage can never break the build.

The `enabled == true` filter lives in the GROQ query, so disabled items
never reach the frontend at all.

## Homepage section

New `components/sections/LatestNews.tsx` — server component, no client
interactivity needed:

- Wrapping `<section id="news">` so `/en#news` and `/es#news` scroll to it.
- Renders nothing at all when the list is empty (no empty-state box on the
  homepage before the first article is published).
- Shows up to 3 items (`items.slice(0, 3)`), newest first.
- Each card: image (Sanity CDN, via the existing image loader), a
  `source · date` eyebrow, the title, the blurb, and a "Read the article ↗"
  link opening the external article in a new tab
  (`target="_blank" rel="noopener noreferrer"`).
- Uses the existing `<Reveal>` motion wrapper and the site's card
  conventions (`rounded-2xl`, `border-line`, accent eyebrow) so it reads as
  part of the existing design system.

Mounted in `app/[locale]/page.tsx` directly after `<Hero>`, with
`loadNews(locale)` added to the page's existing parallel data fetch.

New i18n strings in `lib/i18n/dictionaries/{en,es}.ts` under a `news` key:
`eyebrow`, `title`, `readArticle`.

## Seed script

New `scripts/seed-news.ts`, registered as `npm run seed:news`, following the
surgical-seed pattern established by `scripts/seed-events-only.ts`.

**It must never use `createOrReplace`.** The client uploads images in Studio
*after* seeding, and `createOrReplace` would wipe them on any re-run. Instead:

1. `createIfNotExists` with the full document (so the first run creates it).
2. `patch(id).set({ ...text fields only })` — explicitly excluding `image`
   and `enabled` — so re-running updates copy without touching uploaded
   images or flipping a live item off.

Both documents are seeded with `enabled: false`.

### Document 1 — `news-retail-media-summit-chile-2026`

- `source`: `BULB! Marketing Magazine`
- `articleUrl`: `https://bulb.cl/marketing/el-nuevo-oro-utilizacion-del-1st-party-data-del-retailer/`
- `title.en`: `Retail Media Summit Chile 2026`
- `title.es`: `Retail Media Summit Chile 2026`
- `body.en`: "At the Retail Media Summit Chile 2026, Ramón Portilla closed
  the conference with a keynote challenging the industry to look beyond
  algorithms and first-party data. Through his E.I.A. framework (Emotion,
  Intelligence & Action), he emphasized that while AI and data have
  transformed Retail Media, lasting customer loyalty is built through
  empathy, trust, and genuine human connection. His message reinforced that
  the future competitive advantage will belong not only to retailers with
  the best data, but to those who best understand the people behind it
  (Spanish read)."
- `body.es`: "La prestigiada publicación Chilena Bulb!, destaca en su
  artículo Retail Media Summit Chile 2026, a Ramón Portilla cerrando el
  evento con una conferencia magistral que invitó a la industria a mirar más
  allá de los algoritmos y los datos de primera fuente. A través de su marco
  E.I.A. (Emoción, Inteligencia y Acción), destacó que, si bien la
  inteligencia artificial y los datos han transformado el Retail Media, la
  lealtad de los clientes se construye a partir de la empatía, la confianza
  y las conexiones humanas genuinas. Su mensaje reforzó que la verdadera
  ventaja competitiva del futuro no pertenecerá únicamente a quienes tengan
  más datos, sino a quienes mejor comprendan a las personas que hay detrás
  de ellos."

### Document 2 — `news-bulb-human-vision-retail-media`

- `source`: `BULB! Marketing Magazine`
- `articleUrl`: `https://bulb.cl/articulos/e-i-a-la-apuesta-humana-del-retail-media/`
- `title.en`: `BULB! Highlights Ramón Portilla's Human Vision for Retail Media`
- `title.es`: `BULB! destaca la visión humana de Ramón Portilla para el futuro del Retail Media`
- `body.en`: "Leading Chilean marketing publication BULB! Marketing Magazine
  featured Ramón Portilla's closing keynote at Retail Media Summit Chile
  2026, where he challenged the industry to rethink its future. Rather than
  asking how much data retailers can collect, he posed a different question:
  What relationships would never exist if your brand didn't exist?
  \n\n
  Introducing ideas such as Human Incrementality, Portilla argued that the
  next competitive advantage in Retail Media will not come from more
  technology alone, but from creating stronger human connections. Read the
  full article to discover why this perspective is resonating across the
  industry."
- `body.es`: "La reconocida publicación chilena de marketing BULB! Marketing
  Magazine destacó la conferencia de clausura de Ramón Portilla en el Retail
  Media Summit Chile 2026, donde invitó a la industria a replantear su
  futuro. Más que preguntarse cuántos datos puede recopilar un retailer,
  propuso una reflexión distinta: ¿Qué relaciones no existirían si tu marca
  no existiera?
  \n\n
  Presentando conceptos como la Incrementalidad Humana, Portilla sostuvo que
  la próxima gran ventaja competitiva del Retail Media no vendrá únicamente
  de la tecnología, sino de la capacidad de construir conexiones humanas más
  profundas. Descubre por qué esta visión está generando conversación en la
  industria leyendo el artículo completo."

Both documents are seeded with a `date` display label of "August 2026" /
"Agosto 2026". Document 2 gets a `publishedAt` two days later than document
1, matching the intended publish order, so that once both are enabled
document 2 sorts above document 1 as the newer item.

## Publishing workflow (operational, not code)

The site is a static export, so toggling `enabled` in Sanity does not update
the live site on its own. Each publish is:

1. Flip `enabled` on for the target article in Studio, publish the document.
2. Run `npm run deploy` (build + wrangler deploy).

Note that **no work from the current development cycle is deployed yet** —
there are unpushed commits on `main` covering insight detail pages, rich
text, author bylines, publications structured data, and insight CTAs. All of
that ships together with the first news deploy.

## Out of scope

- Per-item `/news/[slug]` detail pages — explicitly rejected in favour of
  the homepage anchor.
- A dedicated `/news` archive page — the homepage section is the only
  surface for now.
- Rich text (bold/links/inline images) in the news blurb.
- Any change to `insight` documents or the existing
  `scripts/seed-retail-media-summit.ts` (an unrelated pre-existing script
  that seeds the summit *event* document).
- Automating the redeploy on publish (scheduled rebuilds, deploy hooks).

## Testing / verification

- Studio: confirm `news` appears as a document type with all fields, and
  that `enabled` defaults to off.
- Run the seed script; confirm both documents exist in Sanity with correct
  EN/ES copy and `enabled: false`.
- Re-run the seed script and confirm it does **not** error and does not
  clear a manually-set image or `enabled` value (the whole point of the
  `createIfNotExists` + partial-`patch` approach).
- With both items disabled, confirm the homepage renders no news section and
  no empty box.
- Temporarily enable one item locally; confirm the section appears after the
  Hero with image, source, date, title, blurb, and a working external link,
  and that `/en#news` scrolls to it.
- Confirm the Spanish locale renders the ES copy at `/es#news`.
- Typecheck, lint, and a full static build, in both repos.
