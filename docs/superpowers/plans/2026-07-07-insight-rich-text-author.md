# Insight Rich Text Body + Author Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the insight `body` field from plain text to Portable Text (inline images, bold/italic/links), and add a reusable `author` document surfaced as a byline on the insight detail page.

**Architecture:** Studio gets a new `localizedRichText` object type (the `{en, es}` analogue of `localizedText`, but each locale is a Portable Text array instead of a plain string) and a new `author` document type, referenced from `insight`. The website resolves inline images via a GROQ projection (same `asset->url` pattern already used everywhere else), renders the body with `@portabletext/react` through a new shared component, and flattens Portable Text to plain text wherever the old code needed a string (reading time, meta description, JSON-LD description).

**Tech Stack:** Sanity Studio (Portable Text / block content), `@portabletext/react` (new dependency), Next.js/TypeScript on the website side. No test framework configured — verification uses `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks, same as the parent plan.

## Global Constraints

- Rich text supports only: normal paragraphs, bold, italic, links, inline images. No headings, lists, or blockquote. (from spec §Schema changes)
- `author` document is minimal: `name` (required) + `photo` (optional). No bio text, social links, or author listing page. (from spec §Schema changes, §Out of scope)
- Insight's `author` reference is optional; when unset, the website falls back to `"Ramon Portilla"` with no photo. (from spec §Schema changes)
- None of the 6 existing insights have any body content yet — this is a clean type swap, no data migration needed. (from spec §Problem, §Out of scope)
- Writing the actual article content for the 6 existing insights is explicitly out of scope of this plan. (from spec §Out of scope)
- Every step's temporary mock data must be fully reverted (verified via `git diff`) before its task's commit. (established pattern from the parent plan)

---

### Task 1: Studio — `localizedRichText` object type

**Files:**
- Create: `/Users/gautham/Documents/projects/humanx-studio/schemas/objects/localizedRichText.ts`
- Modify: `/Users/gautham/Documents/projects/humanx-studio/schemas/index.ts`

**Interfaces:**
- Produces: the `localizedRichText` schema type, registered so it can be referenced by field `type: "localizedRichText"` in Task 3.

- [ ] **Step 1: Create `schemas/objects/localizedRichText.ts`**

```ts
import { defineType, defineField } from "sanity";

const richTextBlockTypes = [
  {
    type: "block",
    styles: [{ title: "Normal", value: "normal" }],
    lists: [],
    marks: {
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
      ],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [{ name: "href", title: "URL", type: "url" }],
        },
      ],
    },
  },
  {
    type: "image",
    options: { hotspot: true },
    fields: [
      {
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "Short description for screen readers.",
      },
    ],
  },
];

/**
 * Multi-paragraph rich text with inline images — the `localizedText`
 * upgrade path flagged as "(TBD)" when that object type was created.
 * Restricted to normal paragraphs (no headings/lists/blockquote) with
 * bold/italic/link marks, plus inline images. Each locale is its own
 * Portable Text array so authors write both languages independently.
 */
export default defineType({
  name: "localizedRichText",
  title: "Localized rich text",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "array",
      of: richTextBlockTypes,
    }),
    defineField({
      name: "es",
      title: "Spanish",
      type: "array",
      of: richTextBlockTypes,
    }),
  ],
});
```

- [ ] **Step 2: Register it in `schemas/index.ts`**

Add the import right after the existing `localizedText` import (`schemas/index.ts:3`):

```ts
import localizedText from "./objects/localizedText";
import localizedRichText from "./objects/localizedRichText";
```

Add it to the `schemaTypes` array right after `localizedText` (`schemas/index.ts:43`):

```ts
  localizedString,
  localizedText,
  localizedRichText,
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/objects/localizedRichText.ts schemas/index.ts
git commit -m "feat: add localizedRichText object type"
```

---

### Task 2: Studio — `author` document type

**Files:**
- Create: `/Users/gautham/Documents/projects/humanx-studio/schemas/documents/author.ts`
- Modify: `/Users/gautham/Documents/projects/humanx-studio/schemas/index.ts`

**Interfaces:**
- Produces: the `author` document type, referenceable from `insight` in Task 3. Fields: `name` (string, required), `photo` (image, optional, with `alt` sub-field).

- [ ] **Step 1: Create `schemas/documents/author.ts`**

```ts
import { defineType, defineField } from "sanity";

/**
 * Reusable author profile, referenced from `insight`. Intentionally
 * minimal — just enough for a byline (name + photo). No bio text or
 * social links; add them later if a dedicated author page is ever built.
 */
export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      description: "Shown as a small circular byline photo. Leave empty for a name-only byline.",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Short description for screen readers. Defaults to the author's name when empty.",
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", media: "photo" },
  },
});
```

- [ ] **Step 2: Register it in `schemas/index.ts`**

Add the import in the "Lists" section, right after the existing `insight` import (`schemas/index.ts:33`):

```ts
import insight from "./documents/insight";
import author from "./documents/author";
```

Add it to the `schemaTypes` array's "lists" section, right after `insight` (`schemas/index.ts:71`):

```ts
  insight,
  author,
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/documents/author.ts schemas/index.ts
git commit -m "feat: add author document type"
```

---

### Task 3: Studio — update `insight.ts` (rich text body + author reference)

**Files:**
- Modify: `/Users/gautham/Documents/projects/humanx-studio/schemas/documents/insight.ts`

**Interfaces:**
- Consumes: `localizedRichText` (Task 1), `author` (Task 2).
- Produces: `insight.body` is now `localizedRichText` (Portable Text per locale); new `insight.author` reference field. Website Task 4 reads both by these exact field names.

- [ ] **Step 1: Change `body`'s field type**

In `schemas/documents/insight.ts`, replace the `body` field definition:

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

with:

```ts
    defineField({
      name: "body",
      title: "Body",
      description:
        "Full article for the dedicated /insights/[slug] page — supports " +
        "bold/italic, links, and inline images. Insights without a body " +
        "keep behaving as teaser-only cards (no dedicated page is " +
        "generated for them).",
      type: "localizedRichText",
    }),
```

- [ ] **Step 2: Add the `author` reference field, right after `date` and before `body`**

```ts
    defineField({
      name: "author",
      title: "Author",
      description:
        "Byline shown on the dedicated insight page. Leave unset to " +
        "default to \"Ramon Portilla\" with no photo.",
      type: "reference",
      to: [{ type: "author" }],
    }),
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/documents/insight.ts
git commit -m "feat: upgrade insight body to rich text, add author reference"
```

---

### Task 4: Website — dependency, query, and `InsightDoc` type updates

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `lib/sanity/queries.ts:125-154` (the `insightsQuery` block and `InsightDoc` type)

**Interfaces:**
- Consumes: nothing new.
- Produces: `PortableTextBlock` type (exported from `lib/sanity/queries.ts`), updated `InsightDoc` with `body: { en?: PortableTextBlock[]; es?: PortableTextBlock[] }` and `author?: { name?: string; photoUrl?: string; photoAlt?: string } | null`. Task 5 consumes both.

- [ ] **Step 1: Install `@portabletext/react`**

Run: `npm install @portabletext/react@^6.2.0`
Expected: `package.json` and `package-lock.json` both change; command exits 0.

- [ ] **Step 2: Replace the `insightsQuery`/`InsightDoc` block**

Replace (`lib/sanity/queries.ts:125-154`):

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

with:

```ts
/**
 * Loosely-typed Portable Text block/image — enough shape to satisfy
 * `@portabletext/react`'s `TypedObject` requirement (`_type: string` plus
 * arbitrary fields) without pulling in `@portabletext/types` as a direct
 * dependency. `imageUrl` is added by the GROQ projection below for image
 * blocks; it isn't part of Sanity's own image block shape.
 */
export type PortableTextBlock = {
  _type: string;
  imageUrl?: string;
  [key: string]: unknown;
};

/** Insights ordered newest-first by the `publishedAt` timestamp. */
export const insightsQuery = /* groq */ `
  *[_type == "insight"] | order(publishedAt desc, _createdAt desc) {
    "id": _id,
    "slug": slug.current,
    title,
    kind,
    date,
    "body": {
      "en": body.en[]{
        ...,
        _type == "image" => { "imageUrl": asset->url }
      },
      "es": body.es[]{
        ...,
        _type == "image" => { "imageUrl": asset->url }
      }
    },
    href,
    publishedAt,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    "author": author->{ name, "photoUrl": photo.asset->url, "photoAlt": photo.alt }
  }
`;

export type InsightDoc = {
  id: string;
  /** URL path segment from the slug field. Undefined if author hasn't set one. */
  slug?: string;
  title: { en?: string; es?: string };
  kind?: { en?: string; es?: string };
  date?: { en?: string; es?: string };
  body?: { en?: PortableTextBlock[]; es?: PortableTextBlock[] };
  href?: string;
  publishedAt?: string;
  /** Resolved Sanity CDN URL of the uploaded card image, or undefined. */
  imageUrl?: string;
  imageAlt?: string;
  /** Null when the insight has no `author` reference set. */
  author?: { name?: string; photoUrl?: string; photoAlt?: string } | null;
};
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors referencing `lib/sanity/loaders.ts` (still using the old string-based `body`) and `lib/seo/schema.ts`/the detail page (still calling `insight.body.slice`) — expected until Tasks 5-7. Confirm the *only* errors are in those files, nothing in `queries.ts` itself.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/sanity/queries.ts
git commit -m "feat: add @portabletext/react, resolve insight body/author in GROQ"
```

---

### Task 5: Website — `InsightBody`/`portableTextToPlainText`, update `loaders.ts`

**Files:**
- Create: `lib/sanity/portableText.tsx`
- Modify: `lib/sanity/loaders.ts:91-120` (`InsightItem` type), `:184-189` (`readingTime`), `:191-`(`loadInsights`)

**Interfaces:**
- Consumes: `PortableTextBlock` (Task 4, from `lib/sanity/queries.ts`), `sanityImageUrl` (`lib/sanity/image-loader.ts`, existing).
- Produces: `InsightBody({ value })` component and `portableTextToPlainText(blocks)` function (exported from `lib/sanity/portableText.tsx`) — consumed by Task 6 and Task 7. Updated `InsightItem`: `body: PortableTextBlock[]`, new `authorName: string`, `authorPhotoUrl: string`, `authorPhotoAlt: string`.

- [ ] **Step 1: Create `lib/sanity/portableText.tsx`**

```tsx
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { sanityImageUrl } from "@/lib/sanity/image-loader";
import type { PortableTextBlock } from "@/lib/sanity/queries";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="font-serif text-base leading-relaxed text-ink-dim md:text-lg">
        {children}
      </p>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={(value?.href as string) || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:text-accent-bright"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const url = value?.imageUrl as string | undefined;
      if (!url) return null;
      return (
        <img
          src={sanityImageUrl(url, 900)}
          alt={(value?.alt as string) || ""}
          loading="lazy"
          decoding="async"
          className="w-full rounded-2xl border border-line object-cover"
        />
      );
    },
  },
};

/**
 * Renders an insight's Portable Text body with the site's article styling.
 * Wrap in the caller's own spacing/`Reveal` — this only owns per-block
 * typography, not the surrounding layout.
 */
export function InsightBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}

/**
 * Flattens Portable Text blocks into plain text — used for reading time,
 * meta descriptions, and JSON-LD descriptions. Non-text blocks (e.g.
 * images) are skipped.
 */
export function portableTextToPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => {
      const spans = (b.children as Array<{ text?: string }> | undefined) ?? [];
      return spans.map((s) => s.text ?? "").join("");
    })
    .join("\n\n");
}
```

- [ ] **Step 2: Update `InsightItem` in `lib/sanity/loaders.ts`**

Replace the `InsightItem` type (`lib/sanity/loaders.ts:91-120`):

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

with:

```ts
/** Flat row shape used by the insights grid and the /insights/[slug] page. */
export type InsightItem = {
  id: string;
  /**
   * URL path segment, or empty string when the author hasn't set one yet.
   * A dedicated /insights/[slug] page is only generated when both `slug`
   * is set and `body` has at least one block — see `loadInsights`'s
   * build-safety fallback.
   */
  slug: string;
  title: string;
  kind: string;
  date: string;
  /** Portable Text blocks for the resolved locale. Empty array when the
   * author hasn't written one yet (teaser-only insight). */
  body: PortableTextBlock[];
  /** ~200 words/minute estimate from `body`'s flattened text, minimum 1.
   * 0 when body is empty. */
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
  /** Defaults to "Ramon Portilla" when the insight has no `author` reference. */
  authorName: string;
  /** Resolved CDN URL of the author's photo, or empty string when none. */
  authorPhotoUrl: string;
  /** Optional alt text from Sanity; falls back to `authorName`. */
  authorPhotoAlt: string;
};
```

Add this import to the top of `lib/sanity/loaders.ts`, alongside the file's existing imports:

```ts
import type { PortableTextBlock } from "./queries";
```

- [ ] **Step 3: Add a locale-array picker, update `readingTime`'s call site, and `loadInsights`**

Add this helper right above `readingTime` (`lib/sanity/loaders.ts`, just before line 184):

```ts
/** Picks `field[locale]`, then `field.en`, then `[]` — the array analogue of `pickLoc`. */
function pickLocArray<T>(
  field: { en?: T[]; es?: T[] } | undefined,
  locale: Locale
): T[] {
  if (!field) return [];
  return field[locale] ?? field.en ?? [];
}
```

Replace `readingTime` (`lib/sanity/loaders.ts:184-189`):

```ts
/** ~200 words/minute estimate, rounded up, minimum 1 (0 for empty body). */
function readingTime(body: string): number {
  if (!body.trim()) return 0;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

with:

```ts
/** ~200 words/minute estimate, rounded up, minimum 1 (0 for empty text). */
function readingTime(plainText: string): number {
  if (!plainText.trim()) return 0;
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

Replace `loadInsights` (`lib/sanity/loaders.ts:191-...`, the full function body):

```ts
export async function loadInsights(locale: Locale): Promise<InsightItem[]> {
  try {
    const rows = await sanityClient.fetch<InsightDoc[]>(insightsQuery);
    return rows
      .map((row) => {
        const body = pickLocArray(row.body, locale);
        return {
          id: row.id,
          slug: row.slug ?? "",
          title: pickLoc(row.title, locale),
          kind: pickLoc(row.kind, locale),
          date: pickLoc(row.date, locale),
          body,
          readingTimeMinutes: readingTime(portableTextToPlainText(body)),
          publishedAt: row.publishedAt ?? "",
          href: row.href ?? "",
          // Sanity CDN URL (resolved in the GROQ projection via
          // `image.asset->url`). Empty string falls back to the brand-token
          // decorative tile in `app/[locale]/insights/page.tsx`.
          image: row.imageUrl ?? "",
          imageAlt: row.imageAlt ?? "",
          authorName: row.author?.name ?? "Ramon Portilla",
          authorPhotoUrl: row.author?.photoUrl ?? "",
          authorPhotoAlt: row.author?.photoAlt ?? "",
        };
      })
      .filter((row) => row.title);
  } catch (err) {
    return fail("insights", err);
  }
}
```

Add the `portableTextToPlainText` import to `lib/sanity/loaders.ts`'s import block:

```ts
import { portableTextToPlainText } from "@/lib/sanity/portableText";
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only in `lib/seo/schema.ts` and the detail page (Tasks 6-7 fix these) — confirm `lib/sanity/loaders.ts` and `lib/sanity/portableText.tsx` are clean.

- [ ] **Step 5: Commit**

```bash
git add lib/sanity/portableText.tsx lib/sanity/loaders.ts
git commit -m "feat: render insight body as Portable Text, add author fallback"
```

---

### Task 6: Website — `articleSchema()` uses `portableTextToPlainText` and `authorName`

**Files:**
- Modify: `lib/seo/schema.ts:76-94` (`articleSchema`)

**Interfaces:**
- Consumes: `portableTextToPlainText` (Task 5, from `lib/sanity/portableText.tsx`), `InsightItem.authorName` (Task 5).
- Produces: no interface change — `articleSchema(insight, locale)` keeps the same signature.

- [ ] **Step 1: Update the import block and the function**

Add the import (`lib/seo/schema.ts`, top of file, alongside the existing imports):

```ts
import { portableTextToPlainText } from "@/lib/sanity/portableText";
```

Replace `articleSchema` (`lib/seo/schema.ts:76-94`):

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

with:

```ts
/**
 * `Article` JSON-LD for an /insights/[slug] page. `description` truncates
 * the flattened body text to ~200 chars — search engines re-truncate
 * anyway, this just keeps the emitted JSON small.
 */
export function articleSchema(insight: InsightItem, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: portableTextToPlainText(insight.body).slice(0, 200),
    ...(insight.image ? { image: insight.image } : {}),
    ...(insight.publishedAt ? { datePublished: insight.publishedAt } : {}),
    url: `${SITE_URL}/${locale}/insights/${insight.slug}`,
    inLanguage: locale === "es" ? "es" : "en",
    author: { "@type": "Person", name: insight.authorName },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors only in the detail page (`app/[locale]/insights/[slug]/page.tsx`) — Task 7 fixes it. Confirm `lib/seo/schema.ts` is clean.

- [ ] **Step 3: Commit**

```bash
git add lib/seo/schema.ts
git commit -m "feat: use flattened body text + real author in articleSchema"
```

---

### Task 7: Website — detail page renders rich text + byline

**Files:**
- Modify: `app/[locale]/insights/[slug]/page.tsx`

**Interfaces:**
- Consumes: `InsightBody` (Task 5), `portableTextToPlainText` (Task 5), updated `InsightItem` (Task 5, `body`, `authorName`, `authorPhotoUrl`, `authorPhotoAlt`).
- Produces: no interface change — this is the last file in the chain.

- [ ] **Step 1: Update imports**

Add to the top of `app/[locale]/insights/[slug]/page.tsx`:

```ts
import { InsightBody, portableTextToPlainText } from "@/lib/sanity/portableText";
```

- [ ] **Step 2: Update `hasDetailPage`**

Replace:

```ts
function hasDetailPage(insight: { slug: string; body: string }) {
  return Boolean(insight.slug && insight.body);
}
```

with:

```ts
function hasDetailPage(insight: { slug: string; body: unknown[] }) {
  return Boolean(insight.slug && insight.body.length > 0);
}
```

- [ ] **Step 3: Update `generateMetadata`'s description**

Replace:

```ts
  const description = insight.body.slice(0, 160);
```

with:

```ts
  const description = portableTextToPlainText(insight.body).slice(0, 160);
```

- [ ] **Step 4: Replace the paragraph-splitting body render with `InsightBody`, add the byline**

Replace the whole block from the `bodyParagraphs` computation through the body-rendering JSX:

```ts
  const bodyParagraphs = insight.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const readingLabel = t.readingTime.replace(
```

with (removing the `bodyParagraphs` computation entirely):

```ts
  const readingLabel = t.readingTime.replace(
```

Then replace the meta-row + title JSX block:

```tsx
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
```

with (inserting the byline between the meta row and the title):

```tsx
            <Reveal direction="up" delay={0.05}>
              <div className="text-xs uppercase tracking-[0.3em] text-accent">
                {[insight.kind, insight.date, readingLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.08}>
              <div className="mt-3 flex items-center gap-2 text-sm text-ink-dim">
                {insight.authorPhotoUrl ? (
                  <img
                    src={sanityImageUrl(insight.authorPhotoUrl, 64)}
                    alt={insight.authorPhotoAlt || insight.authorName}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : null}
                <span>{insight.authorName}</span>
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tight">
                {insight.title}
              </h1>
            </Reveal>
```

Finally, replace the body-rendering JSX:

```tsx
            {bodyParagraphs.length > 0 ? (
              <Reveal direction="up" delay={0.2}>
                <div className="mt-8 space-y-5 font-serif text-base leading-relaxed text-ink-dim md:text-lg">
                  {bodyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            ) : null}
```

with:

```tsx
            {insight.body.length > 0 ? (
              <Reveal direction="up" delay={0.2}>
                <div className="mt-8">
                  <InsightBody value={insight.body} />
                </div>
              </Reveal>
            ) : null}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors anywhere.

Run: `npm run lint`
Expected: no new errors/warnings referencing `app/[locale]/insights/[slug]/page.tsx` or `lib/sanity/portableText.tsx` beyond the pre-existing `no-img-element` warning already present on this file (same as the parent plan noted).

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: succeeds — with no real insight having `slug`+`body` yet, this still exercises the `_placeholder` fallback path exactly as in the parent plan.

- [ ] **Step 7: Commit**

```bash
git add "app/[locale]/insights/[slug]/page.tsx"
git commit -m "feat: render insight body as Portable Text, add byline"
```

---

### Task 8: Manual verification with temporary mock data

**Files:** none committed — temporary edits to `lib/sanity/loaders.ts`, reverted at the end.

- [ ] **Step 1: Temporarily replace `loadInsights`'s return with mock Portable Text data**

In `lib/sanity/loaders.ts`, temporarily change the `.filter((row) => row.title);` line inside `loadInsights` to append one mock row exercising every new feature — two paragraphs (one with bold, one with a link), one inline image, and an author with a photo:

```ts
      .filter((row) => row.title)
      .concat([
        {
          id: "mock-1",
          slug: "mock-insight",
          title: "Mock insight for manual QA",
          kind: "Field note",
          date: "July 2026",
          body: [
            {
              _type: "block",
              _key: "b1",
              style: "normal",
              children: [
                { _type: "span", _key: "s1", text: "This paragraph has a " },
                { _type: "span", _key: "s2", text: "bold word", marks: ["strong"] },
                { _type: "span", _key: "s3", text: " and a " },
                { _type: "span", _key: "s4", text: "link", marks: ["link1"] },
                { _type: "span", _key: "s5", text: "." },
              ],
              markDefs: [{ _type: "link", _key: "link1", href: "https://humanxinsights.com" }],
            },
            {
              _type: "image",
              _key: "img1",
              alt: "Mock inline image",
              imageUrl: "/og.png",
            },
            {
              _type: "block",
              _key: "b2",
              style: "normal",
              children: [
                { _type: "span", _key: "s6", text: "This second paragraph has an ", marks: [] },
                { _type: "span", _key: "s7", text: "italic word", marks: ["em"] },
                { _type: "span", _key: "s8", text: ".", marks: [] },
              ],
              markDefs: [],
            },
          ],
          readingTimeMinutes: 1,
          publishedAt: new Date().toISOString(),
          href: "https://www.linkedin.com/company/humanx-insights",
          image: "",
          imageAlt: "",
          authorName: "Jane Mock",
          authorPhotoUrl: "/logo.webp",
          authorPhotoAlt: "Jane Mock",
        },
      ]);
```

Note: `"strong"` and `"em"` are decorator marks (no `markDefs` entry needed) — only the `"link1"` annotation mark needs a corresponding `markDefs` entry, which the paragraph already has.

- [ ] **Step 2: Manual browser verification**

Start the dev server (preview tooling), then:
- Open `/en/insights` — confirm the mock card appears and links to `/en/insights/mock-insight`.
- Open `/en/insights/mock-insight` directly — confirm: the byline shows "Jane Mock" with the logo as a circular photo, the first paragraph shows "bold word" in bold and "link" as a working link to `https://humanxinsights.com` (opens in new tab), the inline image (`/og.png`) renders between the two paragraphs at full width with rounded corners, and the second paragraph shows "italic word" in italics.
- Inspect the `<script type="application/ld+json">` `Article` block and confirm `author.name` is `"Jane Mock"` (not the hardcoded "Ramon Portilla") and `description` is a flattened, readable string (not `[object Object]` or similar).

- [ ] **Step 3: Revert the temporary mock**

```bash
git diff lib/sanity/loaders.ts
git checkout -- lib/sanity/loaders.ts
git status --short lib/sanity/loaders.ts
```

Expected: no output from the last command (clean).

---

### Task 9: Final verification pass

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

Expected: no new errors/warnings compared to before this plan (pre-existing unrelated failures elsewhere in the repo are not this plan's concern).

- [ ] **Step 3: Full static build**

```bash
cd /Users/gautham/Documents/projects/humanx-website && npm run build
```

Expected: succeeds.

- [ ] **Step 4: `git status` sanity check on both repos**

```bash
cd /Users/gautham/Documents/projects/humanx-website && git status
cd /Users/gautham/Documents/projects/humanx-studio && git status
```

Expected: only the files listed in this plan's tasks are modified/added; `lib/sanity/loaders.ts` has no leftover mock from Task 8.

- [ ] **Step 5: Report to the user**

Summarize what shipped, and flag the remaining follow-up: writing the actual article bodies (and picking/uploading an author photo, if desired) for the 6 existing insights is still a separate content-authoring step, now unblocked by this rich-text infrastructure.
