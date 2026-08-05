# Homepage "Latest news" Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `news` document type and a homepage "Latest news" section (anchored at `#news`) showing the 3 most recent enabled press mentions, plus a seed script carrying the two BULB! articles.

**Architecture:** New Sanity `news` document type in the studio repo, mirrored by a `newsQuery`/`loadNews` pair in the website's existing query+loader layer. A new server-rendered `LatestNews` section component mounts on the homepage directly after `<Hero>`, filtered to `enabled == true` in GROQ so disabled items never reach the frontend. A standalone seed script populates both articles' EN/ES copy without touching images.

**Tech Stack:** Sanity Studio (schema), Next.js 16 App Router with `output: "export"`, TypeScript, Tailwind CSS, `tsx` for the seed script. No test framework configured — verification uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks, same as the prior plans in this project.

## Global Constraints

- Separate `news` document type — do NOT reuse or modify `insight`. (from spec §Decisions)
- No `/news/[slug]` detail pages; the LinkedIn link target is the homepage anchor `#news`. (from spec §Decisions)
- Show at most 3 items, newest first by `publishedAt`. (from spec §Decisions)
- Section mounts immediately after `<Hero>` on the homepage. (from spec §Decisions)
- `enabled` defaults to `false`; both seeded articles start disabled. (from spec §Decisions)
- The seed script MUST NOT use `createOrReplace` — it uses `createIfNotExists` plus a text-only `patch`, so re-running never wipes a Studio-uploaded image or flips a live item off. (from spec §Seed script)
- Do NOT run `npm run seed:content` at any point — it uses `createOrReplace` across all content and wipes hand-uploaded images.
- Do NOT modify the pre-existing untracked `scripts/seed-retail-media-summit.ts` — it seeds an unrelated *event* document. (from spec §Out of scope)
- Article copy must be reproduced verbatim from the spec, including accents (á é í ó ú ñ) and Spanish punctuation (¿ ¡).

---

### Task 1: Studio — `news` document type

**Files:**
- Create: `/Users/gautham/Documents/projects/humanx-studio/schemas/documents/news.ts`
- Modify: `/Users/gautham/Documents/projects/humanx-studio/schemas/index.ts`

**Interfaces:**
- Produces: the `news` document type with fields `title` (localizedString), `body` (localizedText), `source` (string), `articleUrl` (url), `date` (localizedString), `publishedAt` (datetime), `image` (image + `alt`), `enabled` (boolean). Task 2's GROQ query reads these exact field names.

- [ ] **Step 1: Create `schemas/documents/news.ts`**

```ts
import { defineType, defineField } from "sanity";

/**
 * One press mention — an external article written *about* Ramon, surfaced
 * in the homepage "Latest news" section. Deliberately separate from
 * `insight` (Ramon's own writing): these link out to the publisher and
 * have no detail page of their own.
 *
 * `enabled` is the publish switch. It defaults to off so an item can be
 * seeded and reviewed ahead of time, then flipped live on the day. Note
 * the site is a static export — flipping this requires a redeploy to take
 * effect.
 */
export default defineType({
  name: "news",
  title: "News / Press",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Publication",
      description: "Name of the outlet that published the article, e.g. 'BULB! Marketing Magazine'.",
      type: "string",
    }),
    defineField({
      name: "articleUrl",
      title: "Article URL",
      description: "Link to the article on the publisher's site. Opens in a new tab.",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Display date string",
      description: "Human-readable date label, e.g. 'August 2026'.",
      type: "localizedString",
    }),
    defineField({
      name: "body",
      title: "Blurb",
      description:
        "Short summary shown on the homepage card. Plain paragraphs " +
        "separated by blank lines.",
      type: "localizedText",
    }),
    defineField({
      name: "image",
      title: "Image",
      description: "Shown at the top of the news card, cropped to 16:9.",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Short description for screen readers. Defaults to the title when empty.",
        },
      ],
    }),
    defineField({
      name: "publishedAt",
      title: "Published at (sort)",
      description: "Controls ordering — newest first on the homepage.",
      type: "datetime",
    }),
    defineField({
      name: "enabled",
      title: "Show on site",
      description:
        "Off by default. Turn on to publish this item to the homepage. " +
        "The site is a static export, so a redeploy is required for this " +
        "to take effect.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Published, newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title.en", source: "source", enabled: "enabled", media: "image" },
    prepare: ({ title, source, enabled, media }) => ({
      title,
      subtitle: [enabled ? "Live" : "Hidden", source].filter(Boolean).join(" · "),
      media,
    }),
  },
});
```

- [ ] **Step 2: Register it in `schemas/index.ts`**

Add the import in the "Lists" section, right after the existing `insight` import:

```ts
import insight from "./documents/insight";
import author from "./documents/author";
import news from "./documents/news";
```

Add it to the `schemaTypes` array's "lists" section, right after `author`:

```ts
  insight,
  author,
  news,
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output (clean exit 0).

- [ ] **Step 4: Commit**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/documents/news.ts schemas/index.ts
git commit -m "feat: add news document type for press mentions"
```

---

### Task 2: Website — `newsQuery` + `loadNews`

**Files:**
- Modify: `lib/sanity/queries.ts` (add after the `insightsQuery`/`InsightDoc` block)
- Modify: `lib/sanity/loaders.ts` (add `NewsItem` type + `loadNews` after `loadInsights`)

**Interfaces:**
- Consumes: the `news` schema field names from Task 1.
- Produces: `newsQuery`, `NewsDoc` (from `lib/sanity/queries.ts`); `NewsItem` and `loadNews(locale: Locale): Promise<NewsItem[]>` (from `lib/sanity/loaders.ts`). `NewsItem` shape:
  `{ id: string; title: string; body: string; source: string; articleUrl: string; date: string; publishedAt: string; imageUrl: string; imageAlt: string }`.
  Task 4 consumes `NewsItem`.

- [ ] **Step 1: Add `newsQuery` and `NewsDoc` to `lib/sanity/queries.ts`**

Insert immediately after the `InsightDoc` type definition (which ends with the `author?: { name?: string; photoUrl?: string; photoAlt?: string } | null;` field and its closing `};`):

```ts
/**
 * Press mentions for the homepage "Latest news" section. The
 * `enabled == true` filter lives here so disabled items never reach the
 * frontend at all.
 */
export const newsQuery = /* groq */ `
  *[_type == "news" && enabled == true] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    title,
    body,
    source,
    articleUrl,
    date,
    publishedAt,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt
  }
`;

export type NewsDoc = {
  id: string;
  title: { en?: string; es?: string };
  body?: { en?: string; es?: string };
  source?: string;
  articleUrl?: string;
  date?: { en?: string; es?: string };
  publishedAt?: string;
  /** Resolved Sanity CDN URL of the uploaded image, or undefined. */
  imageUrl?: string;
  imageAlt?: string;
};
```

- [ ] **Step 2: Add `newsQuery` + `type NewsDoc` to the `./queries` import block in `lib/sanity/loaders.ts`**

In the large `import { ... } from "./queries";` block at the top of `lib/sanity/loaders.ts`, add `newsQuery,` alongside the other query imports and `type NewsDoc,` alongside the other type imports.

- [ ] **Step 3: Add `NewsItem` + `loadNews` to `lib/sanity/loaders.ts`**

Insert immediately after the `loadInsights` function's closing brace:

```ts
/** Flat row shape used by the homepage `<LatestNews>` section. */
export type NewsItem = {
  id: string;
  title: string;
  /** Blurb; paragraphs separated by blank lines. Empty when unset. */
  body: string;
  /** Publication name, e.g. "BULB! Marketing Magazine". Empty when unset. */
  source: string;
  /** External article URL. Guaranteed non-empty (rows without it are dropped). */
  articleUrl: string;
  /** Human-readable display date, e.g. "August 2026". Empty when unset. */
  date: string;
  /** ISO datetime used for ordering, or empty string. */
  publishedAt: string;
  /** Sanity CDN URL of the card image; empty when none uploaded. */
  imageUrl: string;
  /** Optional alt text from Sanity; falls back to the title. */
  imageAlt: string;
};

/**
 * Press mentions for the homepage news section, newest first. Only
 * `enabled` items are returned — that filter lives in the GROQ query.
 */
export async function loadNews(locale: Locale): Promise<NewsItem[]> {
  try {
    const rows = await sanityClient.fetch<NewsDoc[]>(newsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        title: pickLoc(row.title, locale),
        body: pickLoc(row.body, locale),
        source: row.source ?? "",
        articleUrl: row.articleUrl ?? "",
        date: pickLoc(row.date, locale),
        publishedAt: row.publishedAt ?? "",
        imageUrl: row.imageUrl ?? "",
        imageAlt: row.imageAlt ?? "",
      }))
      .filter((row) => row.title && row.articleUrl);
  } catch (err) {
    return fail("news", err);
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/sanity/queries.ts lib/sanity/loaders.ts
git commit -m "feat: add news query and loader"
```

---

### Task 3: Website — i18n strings

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts` (add a `news` block before the closing `} as const;` at line 553)
- Modify: `lib/i18n/dictionaries/es.ts` (add the matching block before the closing `};`)

**Interfaces:**
- Produces: `dict.news.eyebrow`, `dict.news.title`, `dict.news.readArticle`. Task 4 consumes these.

- [ ] **Step 1: Add the `news` block to `en.ts`**

In `lib/i18n/dictionaries/en.ts`, immediately before the final `} as const;`, add:

```ts
  news: {
    eyebrow: "Latest news",
    title: "In the press",
    readArticle: "Read the article",
  },
```

- [ ] **Step 2: Add the matching block to `es.ts`**

In `lib/i18n/dictionaries/es.ts`, immediately before the final `};`, add:

```ts
  news: {
    eyebrow: "Últimas noticias",
    title: "En la prensa",
    readArticle: "Leer el artículo",
  },
```

- [ ] **Step 3: Typecheck — confirms `es.ts` still structurally matches the `Dictionary` type derived from `en.ts`**

Run: `npx tsc --noEmit`
Expected: no errors. If a key mismatch is reported, make both files declare exactly the same keys inside `news`.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/es.ts
git commit -m "feat: add i18n strings for homepage news section"
```

---

### Task 4: Website — `LatestNews` component + homepage mount

**Files:**
- Create: `components/sections/LatestNews.tsx`
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `NewsItem` and `loadNews` (Task 2), `dict.news.*` (Task 3), `aspectCropLoader` from `lib/sanity/image-loader.ts` (existing), `Reveal` from `components/motion/Reveal` (existing).
- Produces: the `LatestNews` component — no other task depends on it.

- [ ] **Step 1: Create `components/sections/LatestNews.tsx`**

```tsx
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { aspectCropLoader } from "@/lib/sanity/image-loader";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { NewsItem } from "@/lib/sanity/loaders";

// News cards render in a fixed 16:9 frame; crop author uploads to that ratio
// at the CDN so every card is framed identically (see image-loader).
const NEWS_CARD_LOADER = aspectCropLoader(16, 9);

/** Most recent items to surface. Older ones roll off automatically. */
const MAX_ITEMS = 3;

/**
 * Homepage "Latest news" section — press mentions linking out to the
 * publisher. Anchored at `#news` so it can be linked directly from social
 * posts (e.g. humanxinsights.com/en#news).
 *
 * Renders nothing when no news item is enabled, so the homepage shows no
 * empty box before the first article is published.
 */
export function LatestNews({
  dict,
  items,
}: {
  dict: Dictionary;
  items: NewsItem[];
}) {
  const t = dict.news;
  const visible = items.slice(0, MAX_ITEMS);
  if (visible.length === 0) return null;

  return (
    <section
      id="news"
      className="relative scroll-mt-24 border-t border-line px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {t.eyebrow}
          </div>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight">
            {t.title}
          </h2>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, idx) => {
            const meta = [item.source, item.date].filter(Boolean).join(" · ");
            const paragraphs = item.body
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
              <li key={item.id}>
                <Reveal direction="up" delay={Math.min(idx * 0.05, 0.2)}>
                  <article className="group flex h-full flex-col">
                    {item.imageUrl ? (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
                        <Image
                          loader={NEWS_CARD_LOADER}
                          src={item.imageUrl}
                          alt={item.imageAlt || item.title}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}

                    <div className={item.imageUrl ? "mt-5" : ""}>
                      {meta ? (
                        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
                          {meta}
                        </div>
                      ) : null}
                      <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl">
                        {item.title}
                      </h3>
                      {paragraphs.length > 0 ? (
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-dim">
                          {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <a
                      href={item.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                    >
                      {t.readArticle}
                      <span aria-hidden>↗</span>
                    </a>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire it into `app/[locale]/page.tsx`**

Add `loadNews,` to the existing `@/lib/sanity/loaders` import block (alongside `loadPublications`, `loadAboutPage`, etc.):

```ts
import {
  loadEvents,
  loadPartners,
  loadClients,
  loadHomepage,
  loadAboutPage,
  loadEventsPage,
  loadContactCta,
  loadPublications,
  loadNews,
} from "@/lib/sanity/loaders";
```

Add the component import alongside the other section imports:

```ts
import { LatestNews } from "@/components/sections/LatestNews";
```

Add `news` as an 11th element of the `Promise.all` destructure and `loadNews(locale)` as its fetch — the destructured array becomes:

```ts
  const [
    dict,
    testimonials,
    events,
    partners,
    clients,
    homepage,
    eventsPage,
    contactCta,
    publications,
    about,
    news,
  ] = await Promise.all([
    getDictionary(locale),
    loadTestimonials(locale),
    loadEvents(locale),
    loadPartners(),
    loadClients(),
    loadHomepage(locale),
    loadEventsPage(locale),
    loadContactCta(locale),
    loadPublications(locale),
    loadAboutPage(locale),
    loadNews(locale),
  ]);
```

Mount the section directly after `<Hero>`:

```tsx
      <Hero dict={dict} locale={locale} content={homepage?.hero} />
      {/* Press mentions — renders nothing until a news item is enabled in
          Sanity. Anchored at #news for direct linking from social posts. */}
      <LatestNews dict={dict} items={news} />
      <OnStageTeaser
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors/warnings referencing `components/sections/LatestNews.tsx` or `app/[locale]/page.tsx`. (This repo has ~198 pre-existing unrelated lint problems; the count must not increase.)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds. With no news item enabled in Sanity yet, the section renders nothing — the homepage must build and look exactly as before.

- [ ] **Step 5: Commit**

```bash
git add components/sections/LatestNews.tsx "app/[locale]/page.tsx"
git commit -m "feat: add homepage Latest news section"
```

---

### Task 5: Seed script for the two BULB! articles

**Files:**
- Create: `scripts/seed-news.ts`
- Modify: `package.json` (add a `seed:news` script)

**Interfaces:**
- Consumes: the `news` schema field names from Task 1.
- Produces: the `npm run seed:news` command and the two documents
  `news-retail-media-summit-chile-2026` and `news-bulb-human-vision-retail-media`.

- [ ] **Step 1: Create `scripts/seed-news.ts`**

Note the deliberate two-phase write: `createIfNotExists` seeds the full document on first run, then `patch().set()` updates **text fields only**. `image` and `enabled` are never patched, so re-running this script can never wipe a Studio-uploaded image or flip a live article back off.

```ts
/* eslint-disable no-console */
/**
 * Surgical seed for the two BULB! press mentions.
 *
 * Deliberately NOT `createOrReplace`: images are uploaded in Studio after
 * seeding, and `enabled` is toggled by hand on publish day. Re-running this
 * script must never clobber either. So we `createIfNotExists` (first run
 * creates the doc) then `patch().set()` only the text fields.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=skXXXX npm run seed:news
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN. Run:\n\n" +
      "    SANITY_WRITE_TOKEN=skXXXX npm run seed:news\n"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-01",
  token,
  useCdn: false,
});

/** Text fields that are safe to overwrite on every run. */
type NewsSeed = {
  _id: string;
  title: { _type: "localizedString"; en: string; es: string };
  body: { _type: "localizedText"; en: string; es: string };
  source: string;
  articleUrl: string;
  date: { _type: "localizedString"; en: string; es: string };
  publishedAt: string;
};

const NEWS: NewsSeed[] = [
  {
    _id: "news-retail-media-summit-chile-2026",
    title: {
      _type: "localizedString",
      en: "Retail Media Summit Chile 2026",
      es: "Retail Media Summit Chile 2026",
    },
    body: {
      _type: "localizedText",
      en: "At the Retail Media Summit Chile 2026, Ramón Portilla closed the conference with a keynote challenging the industry to look beyond algorithms and first-party data. Through his E.I.A. framework (Emotion, Intelligence & Action), he emphasized that while AI and data have transformed Retail Media, lasting customer loyalty is built through empathy, trust, and genuine human connection. His message reinforced that the future competitive advantage will belong not only to retailers with the best data, but to those who best understand the people behind it (Spanish read).",
      es: "La prestigiada publicación Chilena Bulb!, destaca en su artículo Retail Media Summit Chile 2026, a Ramón Portilla cerrando el evento con una conferencia magistral que invitó a la industria a mirar más allá de los algoritmos y los datos de primera fuente. A través de su marco E.I.A. (Emoción, Inteligencia y Acción), destacó que, si bien la inteligencia artificial y los datos han transformado el Retail Media, la lealtad de los clientes se construye a partir de la empatía, la confianza y las conexiones humanas genuinas. Su mensaje reforzó que la verdadera ventaja competitiva del futuro no pertenecerá únicamente a quienes tengan más datos, sino a quienes mejor comprendan a las personas que hay detrás de ellos.",
    },
    source: "BULB! Marketing Magazine",
    articleUrl:
      "https://bulb.cl/marketing/el-nuevo-oro-utilizacion-del-1st-party-data-del-retailer/",
    date: { _type: "localizedString", en: "August 2026", es: "Agosto 2026" },
    publishedAt: "2026-08-07T09:00:00.000Z",
  },
  {
    _id: "news-bulb-human-vision-retail-media",
    title: {
      _type: "localizedString",
      en: "BULB! Highlights Ramón Portilla's Human Vision for Retail Media",
      es: "BULB! destaca la visión humana de Ramón Portilla para el futuro del Retail Media",
    },
    body: {
      _type: "localizedText",
      en: "Leading Chilean marketing publication BULB! Marketing Magazine featured Ramón Portilla's closing keynote at Retail Media Summit Chile 2026, where he challenged the industry to rethink its future. Rather than asking how much data retailers can collect, he posed a different question: What relationships would never exist if your brand didn't exist?\n\nIntroducing ideas such as Human Incrementality, Portilla argued that the next competitive advantage in Retail Media will not come from more technology alone, but from creating stronger human connections. Read the full article to discover why this perspective is resonating across the industry.",
      es: "La reconocida publicación chilena de marketing BULB! Marketing Magazine destacó la conferencia de clausura de Ramón Portilla en el Retail Media Summit Chile 2026, donde invitó a la industria a replantear su futuro. Más que preguntarse cuántos datos puede recopilar un retailer, propuso una reflexión distinta: ¿Qué relaciones no existirían si tu marca no existiera?\n\nPresentando conceptos como la Incrementalidad Humana, Portilla sostuvo que la próxima gran ventaja competitiva del Retail Media no vendrá únicamente de la tecnología, sino de la capacidad de construir conexiones humanas más profundas. Descubre por qué esta visión está generando conversación en la industria leyendo el artículo completo.",
    },
    source: "BULB! Marketing Magazine",
    articleUrl: "https://bulb.cl/articulos/e-i-a-la-apuesta-humana-del-retail-media/",
    date: { _type: "localizedString", en: "August 2026", es: "Agosto 2026" },
    // One day later than the first article so it sorts above it once both
    // are enabled, matching the intended publish order.
    publishedAt: "2026-08-08T09:00:00.000Z",
  },
];

async function run() {
  console.log(
    `→ Seeding ${NEWS.length} news item(s) to project ${projectId} / dataset ${dataset}\n`
  );

  const tx = client.transaction();
  for (const doc of NEWS) {
    // First run: create the doc, disabled, with no image.
    tx.createIfNotExists({ ...doc, _type: "news", enabled: false });
    // Every run: refresh text only. `image` and `enabled` are deliberately
    // absent so uploads and the live toggle survive a re-run.
    tx.patch(doc._id, {
      set: {
        title: doc.title,
        body: doc.body,
        source: doc.source,
        articleUrl: doc.articleUrl,
        date: doc.date,
        publishedAt: doc.publishedAt,
      },
    });
  }
  await tx.commit();

  for (const d of NEWS) console.log(`  ✓ ${d._id}`);
  console.log(
    "\n✓ Done. Open Studio → News / Press to upload an image for each item.\n" +
      "  Both are seeded with 'Show on site' OFF — turn one on and redeploy to publish."
  );
}

run().catch((err) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"` alongside the other seed entries:

```json
    "seed:news": "tsx --env-file=.env.local scripts/seed-news.ts",
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no new errors/warnings referencing `scripts/seed-news.ts`.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-news.ts package.json
git commit -m "feat: add seed script for BULB press mentions"
```

---

### Task 6: Run the seed (requires explicit user confirmation)

**Files:** none — this task writes to the live Sanity production dataset.

**STOP:** This task mutates the user's production Sanity dataset. Do **not** run it without the user explicitly confirming in this session. If they have not confirmed, skip to Task 7 and report that the seed is ready but unrun.

- [ ] **Step 1: Confirm a write token is available**

Run: `grep -q 'SANITY_WRITE_TOKEN' .env.local && echo "token present" || echo "TOKEN MISSING"`
Expected: `token present`. If `TOKEN MISSING`, stop and ask the user to supply `SANITY_WRITE_TOKEN` — do not attempt to source it from anywhere else.

- [ ] **Step 2: Run the seed**

Run: `npm run seed:news`
Expected output ends with:

```
  ✓ news-retail-media-summit-chile-2026
  ✓ news-bulb-human-vision-retail-media

✓ Done. Open Studio → News / Press to upload an image for each item.
```

- [ ] **Step 3: Verify both documents landed, disabled**

Write a throwaway verification script at `scripts/_tmp-verify-news.ts`:

```ts
/* eslint-disable no-console */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-12-01",
  useCdn: false,
});

client
  .fetch(
    `*[_type == "news"] | order(publishedAt desc) { _id, enabled, source, publishedAt, "en": title.en, "es": title.es, "hasImage": defined(image) }`
  )
  .then((rows) => console.log(JSON.stringify(rows, null, 2)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

Run: `npx tsx --env-file=.env.local scripts/_tmp-verify-news.ts`

Expected: both documents listed, each with `"enabled": false`, `"hasImage": false`, `"source": "BULB! Marketing Magazine"`, and correct EN/ES titles with accents intact (`Ramón`, `visión`). `news-bulb-human-vision-retail-media` sorts first (newer `publishedAt`).

Leave the script in place for Step 4, then delete it in Step 5.

- [ ] **Step 4: Verify re-running is non-destructive**

Run `npm run seed:news` a second time.
Expected: same success output, no errors.

Then re-run `npx tsx --env-file=.env.local scripts/_tmp-verify-news.ts` and confirm the output is identical to Step 3 — `enabled` still `false` on both, nothing lost. This proves the `createIfNotExists` + partial-`patch` approach is safe to re-run after images are uploaded and after an article has been switched live.

- [ ] **Step 5: Delete the throwaway verification script**

```bash
rm scripts/_tmp-verify-news.ts
git status --short scripts/
```

Expected: `scripts/_tmp-verify-news.ts` no longer listed. (`scripts/seed-retail-media-summit.ts` remains untracked — that's pre-existing and not ours.)

---

### Task 7: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Typecheck both repos**

```bash
cd /Users/gautham/Documents/projects/humanx-website && npx tsc --noEmit
cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit
```

Expected: both clean.

- [ ] **Step 2: Lint the website**

Run: `cd /Users/gautham/Documents/projects/humanx-website && npm run lint`
Expected: the pre-existing problem count (~198) must not have increased.

- [ ] **Step 3: Full static build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Verify the empty state in the browser**

Start the dev server via the preview tooling and open `/en`. With both news items disabled, confirm: no news section renders, no empty box or stray heading sits between the Hero and the On-stage teaser, and the console has no errors.

- [ ] **Step 5: Verify the populated state in the browser**

Temporarily flip the GROQ filter to render a disabled item — in `lib/sanity/queries.ts`, change `*[_type == "news" && enabled == true]` to `*[_type == "news"]`. Reload `/en` and confirm: the section appears directly after the Hero with the eyebrow, heading, card(s) showing `BULB! Marketing Magazine · August 2026`, the title, the blurb paragraphs, and a "Read the article ↗" link pointing at the correct bulb.cl URL and opening in a new tab. Then open `/es` and confirm the Spanish copy renders (accents and `¿` intact).

Also confirm the anchor works: navigate to `/en#news` and verify the page scrolls to the section.

Then revert the temporary query change:

```bash
git checkout -- lib/sanity/queries.ts
git status --short lib/sanity/queries.ts
```

Expected: no output from the last command (clean).

- [ ] **Step 6: `git status` sanity check on both repos**

```bash
cd /Users/gautham/Documents/projects/humanx-website && git status
cd /Users/gautham/Documents/projects/humanx-studio && git status
```

Expected: only this plan's files are modified/added; no leftover temporary query edit; `scripts/seed-retail-media-summit.ts` still untracked and unmodified.

- [ ] **Step 7: Report to the user**

Summarize what shipped and state the remaining manual steps clearly:
1. Upload an image for each of the two news items in Studio → News / Press.
2. Nothing is live until `main` is pushed and `npm run deploy` is run — and this deploy also carries the whole prior batch of unpushed work (insight detail pages, rich text, author bylines, publications JSON-LD, insight CTAs).
3. To publish: flip "Show on site" on the target article in Studio, publish the document, then run `npm run deploy`. Repeat for the second article on its day.
4. The LinkedIn link target is `https://humanxinsights.com/en#news` (or `/es#news`).
