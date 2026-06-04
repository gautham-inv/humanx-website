# Conference Paper Push — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the homepage is opened via a tagged link (`?paper=<key>`), auto-open an email-gated download modal for that specific publication so conference attendees become captured leads in ~two clicks — invisible to organic visitors.

**Architecture:** A new `publication.campaignKey` field in Sanity maps `?paper=<key>` to a paper. A client component (`ConferencePush`) on the homepage reads the param at runtime and opens a shared `PdfGateModal` (extracted from the existing `GatedPublications` gate, reusing the same HubSpot download form). Soft/dismissible with a sticky re-open button.

**Tech Stack:** Next.js 16 (static export), React 19, TypeScript, Tailwind v4, Sanity (separate `humanx-studio` repo), HubSpot Forms API.

**Spec:** `docs/superpowers/specs/2026-06-04-conference-paper-push-design.md`

---

## Verification convention (read first)

This repo has **no unit-test runner** (no jest/vitest; `package.json` has only dev/build/lint/seed scripts). The project's established verification is:
- `npx tsc --noEmit` (website) and `cd ../humanx-studio && npx tsc --noEmit` (studio)
- `npx eslint <changed files>`
- Manual browser checks against the dev server (preview tool / `npm run dev`)

Do **not** introduce a test framework for this feature — it would be unrequested scope. Each task below uses tsc + eslint + (where relevant) a browser check as its verification, matching the codebase.

## File structure

**humanx-studio (separate repo):**
- Modify: `schemas/documents/publication.ts` — add `campaignKey` field.

**humanx-website:**
- Create: `lib/download.ts` — `triggerDownload()` helper (moved out of GatedPublications).
- Create: `lib/conference-push.ts` — `matchPublicationByKey()` pure matcher.
- Create: `components/sections/PdfGateModal.tsx` — shared email-gate modal.
- Create: `components/sections/ConferencePush.tsx` — homepage param trigger + soft gate + sticky button.
- Modify: `components/sections/GatedPublications.tsx` — consume `PdfGateModal` + `lib/download`.
- Modify: `lib/sanity/queries.ts` — `publicationsQuery` + `PublicationDoc` add `campaignKey`.
- Modify: `lib/sanity/loaders.ts` — `PublicationItem` + `loadPublications` add `campaignKey`.
- Modify: `lib/i18n/dictionaries/en.ts` + `es.ts` — add `pdfGate.reopen`.
- Modify: `app/[locale]/page.tsx` — load publications + render `<ConferencePush>`.

---

## Task 1: Sanity — add `campaignKey` to the publication schema

**Files:**
- Modify: `humanx-studio/schemas/documents/publication.ts`

- [ ] **Step 1: Add the field** (after the `date` field, before `publishedAt`)

In `schemas/documents/publication.ts`, insert this `defineField` between the `date` field and the `publishedAt` field:

```ts
    defineField({
      name: "campaignKey",
      title: "Conference share key",
      description:
        "Short key used in conference share links (?paper=<key>) — e.g. 'aecoc'. " +
        "Lowercase, no spaces. Leave empty unless this paper is being pushed at an event.",
      type: "string",
    }),
```

- [ ] **Step 2: Type-check the studio**

Run: `cd /Users/gautham/Documents/projects/humanx-studio && npx tsc --noEmit`
Expected: no output, exit 0.

- [ ] **Step 3: Commit (in the studio repo)**

```bash
cd /Users/gautham/Documents/projects/humanx-studio
git add schemas/documents/publication.ts
git commit -m "feat: add campaignKey to publication for conference share links"
```

> Note: the studio must be redeployed (`npx sanity deploy`, or restart local `sanity dev`) before authors can edit `campaignKey`. Call this out at handoff; it is not part of website verification.

---

## Task 2: Website — thread `campaignKey` through query, doc type, loader

**Files:**
- Modify: `lib/sanity/queries.ts`
- Modify: `lib/sanity/loaders.ts`

- [ ] **Step 1: Add `campaignKey` to `publicationsQuery` + `PublicationDoc`**

In `lib/sanity/queries.ts`, replace the existing `publicationsQuery` and `PublicationDoc` block:

```ts
/** Downloadable publications (gated PDFs) for the Publications page. */
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

- [ ] **Step 2: Add `campaignKey` to `PublicationItem` + `loadPublications`**

In `lib/sanity/loaders.ts`, replace the `PublicationItem` type and the body of `loadPublications`:

```ts
/** Flat row shape for the gated publications list. Matches the dict items. */
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

- [ ] **Step 3: Type-check**

Run: `cd /Users/gautham/Documents/projects/humanx-website && npx tsc --noEmit`
Expected: no output, exit 0. (The `/publications` page's local `PublicationItem` shape in `GatedPublications.tsx` does not yet include `campaignKey`; that's fine — it's a separate local type updated in Task 5. No consumer breaks because the loader type only widens.)

- [ ] **Step 4: Commit**

```bash
git add lib/sanity/queries.ts lib/sanity/loaders.ts
git commit -m "feat: expose publication campaignKey from Sanity"
```

---

## Task 3: Add `lib/download.ts` helper

**Files:**
- Create: `lib/download.ts`

- [ ] **Step 1: Create the file**

```ts
/**
 * Trigger a browser download (or open) of a file URL via a transient anchor.
 * Shared by the publications gate and the homepage conference push.
 */
export function triggerDownload(file: string): void {
  const a = document.createElement("a");
  a.href = file;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no output, exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/download.ts
git commit -m "refactor: extract triggerDownload helper"
```

---

## Task 4: Create the shared `PdfGateModal`

**Files:**
- Create: `components/sections/PdfGateModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { submitGatedDownload } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";

/** Minimal shape the gate needs to render + download a paper. */
export type GatePublication = { id: string; title: string; file: string };

type PdfGateModalProps = {
  dict: Dictionary;
  /** The paper to gate + download. */
  publication: GatePublication;
  /** Dismiss the modal. */
  onClose: () => void;
  /** Called after a successful email submit + download starts. */
  onSubmitted?: () => void;
};

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

/**
 * Email-gated PDF download modal. Collects an email (POSTed to the HubSpot
 * download form via submitGatedDownload), then triggers the download. Shared by
 * the /publications list (GatedPublications) and the homepage conference push
 * (ConferencePush) so the gate behaves identically everywhere.
 */
export function PdfGateModal({
  dict,
  publication,
  onClose,
  onSubmitted,
}: PdfGateModalProps) {
  const t = dict.pdfGate;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const headingId = useId();

  // Focus the email field on open; Escape dismisses.
  useEffect(() => {
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email.includes("@") || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitGatedDownload({ email });
      triggerDownload(publication.file);
      onSubmitted?.();
      onClose();
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-card)] border border-line bg-bg-elev p-8 shadow-2xl">
        <p id={headingId} className="font-display text-2xl tracking-tight text-ink">
          {t.heading}
        </p>
        <p className="mt-1 text-sm text-accent">{publication.title}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">{t.body}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <input
            ref={emailRef}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            className="w-full rounded-full border border-line bg-bg px-5 py-3 text-ink placeholder:text-ink-dim focus-visible:border-accent focus-visible:outline-none"
          />
          <label className="mt-4 flex items-start gap-3 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[var(--color-accent)]"
            />
            <span>{t.consent}</span>
          </label>

          {error ? (
            <p role="alert" className="mt-3 text-sm text-magenta">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-ink-dim transition hover:text-ink"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting || !consent || !email.includes("@")}
              aria-busy={submitting || undefined}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t.sending : t.submit}
              {!submitting ? <DownloadIcon /> : null}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint components/sections/PdfGateModal.tsx`
Expected: no errors. (`@next/next/no-img-element` is not triggered here; no `<img>`.)

- [ ] **Step 3: Commit**

```bash
git add components/sections/PdfGateModal.tsx
git commit -m "feat: add shared PdfGateModal (email-gated download)"
```

---

## Task 5: Refactor `GatedPublications` to use `PdfGateModal`

**Files:**
- Modify: `components/sections/GatedPublications.tsx`

- [ ] **Step 1: Replace the file** (keeps the list UI + session-unlock; delegates the modal)

```tsx
"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { isDownloadConfigured } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { PdfGateModal, type GatePublication } from "./PdfGateModal";

type PublicationItem = {
  id: string;
  title: string;
  kind: string;
  date: string;
  file: string;
};

type GatedPublicationsProps = {
  dict: Dictionary;
  items: readonly PublicationItem[];
  downloadLabel: string;
};

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

/**
 * Publications list with an email gate. Clicking a paper opens the shared
 * PdfGateModal (email -> HubSpot -> download). One successful submit unlocks
 * every paper for the rest of the session, so repeat clicks download
 * immediately. If the HubSpot download form isn't configured, the gate is
 * bypassed and papers download directly.
 */
export function GatedPublications({
  dict,
  items,
  downloadLabel,
}: GatedPublicationsProps) {
  const gateActive = isDownloadConfigured();
  const [unlocked, setUnlocked] = useState(false);
  const [selected, setSelected] = useState<GatePublication | null>(null);

  function handleItemClick(item: PublicationItem) {
    if (!gateActive || unlocked) {
      triggerDownload(item.file);
      return;
    }
    setSelected({ id: item.id, title: item.title, file: item.file });
  }

  return (
    <>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleItemClick(item)}
              className="group flex w-full flex-col gap-1 py-6 text-left transition-colors hover:bg-bg-elev/60 focus-visible:bg-bg-elev focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex-row md:items-center md:justify-between md:gap-8"
            >
              <div className="px-2">
                <div className="text-xs uppercase tracking-widest text-accent">
                  {item.kind} · {item.date}
                </div>
                <h3 className="mt-2 font-display text-xl text-ink md:text-2xl">
                  {item.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 px-2 text-sm text-ink-dim transition-colors group-hover:text-ink">
                {downloadLabel}
                <DownloadIcon />
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <PdfGateModal
          dict={dict}
          publication={selected}
          onClose={() => setSelected(null)}
          onSubmitted={() => setUnlocked(true)}
        />
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint components/sections/GatedPublications.tsx`
Expected: no errors.

- [ ] **Step 3: Browser check — existing gate still works**

Start the dev server (preview tool `humanx-dev` or `npm run dev`). Navigate to `/en/publications`, click a paper → the email modal opens with the paper title. (Don't submit.) Close it. Confirms the refactor preserved behavior.

- [ ] **Step 4: Commit**

```bash
git add components/sections/GatedPublications.tsx
git commit -m "refactor: GatedPublications uses shared PdfGateModal"
```

---

## Task 6: Create `lib/conference-push.ts` (pure matcher) + `ConferencePush`

**Files:**
- Create: `lib/conference-push.ts`
- Create: `components/sections/ConferencePush.tsx`

- [ ] **Step 1: Create the pure matcher** (`lib/conference-push.ts`)

```ts
import type { PublicationItem } from "@/lib/sanity/loaders";

/**
 * Find the publication whose `campaignKey` matches `key` (case-insensitive,
 * trimmed) and that has a downloadable file. Returns null when key is empty or
 * nothing matches — the caller then renders nothing (clean homepage).
 */
export function matchPublicationByKey(
  publications: readonly PublicationItem[],
  key: string | null | undefined
): PublicationItem | null {
  if (!key) return null;
  const norm = key.trim().toLowerCase();
  if (!norm) return null;
  return (
    publications.find(
      (p) => p.file && p.campaignKey && p.campaignKey.toLowerCase() === norm
    ) ?? null
  );
}
```

- [ ] **Step 2: Create `ConferencePush`** (`components/sections/ConferencePush.tsx`)

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { PublicationItem } from "@/lib/sanity/loaders";
import { isDownloadConfigured } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { matchPublicationByKey } from "@/lib/conference-push";
import { PdfGateModal, type GatePublication } from "./PdfGateModal";

type ConferencePushProps = {
  dict: Dictionary;
  publications: readonly PublicationItem[];
};

/**
 * Conference paper push. When the homepage is opened via a tagged link
 * (?paper=<campaignKey>), auto-opens the email gate for that specific paper.
 * Soft + dismissible: closing the modal reveals a sticky "Get Ramon's paper"
 * button to re-open it. Renders nothing for organic visitors (no/unknown
 * param). Query params are read at runtime (client-only) so this works under
 * static export.
 */
export function ConferencePush({ dict, publications }: ConferencePushProps) {
  const [paper, setPaper] = useState<GatePublication | null>(null);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("paper");
    const match = matchPublicationByKey(publications, key);
    if (!match) return;
    setPaper({ id: match.id, title: match.title, file: match.file });
    // Mirror the publications gate fallback: if HubSpot isn't configured there's
    // no lead step, so just download immediately.
    if (!isDownloadConfigured()) {
      triggerDownload(match.file);
      setDone(true);
    } else {
      setOpen(true);
    }
  }, [publications]);

  if (!paper || done) return null;

  return open ? (
    <PdfGateModal
      dict={dict}
      publication={paper}
      onClose={() => setOpen(false)}
      onSubmitted={() => setDone(true)}
    />
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
    >
      {dict.pdfGate.reopen}
    </button>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: FAIL — `Property 'reopen' does not exist on type ... pdfGate`. (Fixed in Task 7.) This confirms `dict.pdfGate.reopen` is wired; proceed to add the dict key.

- [ ] **Step 4: Commit** (after Task 7's dict key makes tsc pass, commit these two files together with Task 7 — see Task 7 Step 4)

---

## Task 7: Add the `pdfGate.reopen` dict key (both locales)

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts`
- Modify: `lib/i18n/dictionaries/es.ts`

- [ ] **Step 1: English** — in `lib/i18n/dictionaries/en.ts`, inside the `pdfGate` object, add a `reopen` key after `close`:

```ts
    close: "Close",
    reopen: "Get Ramon's paper",
```

- [ ] **Step 2: Spanish** — in `lib/i18n/dictionaries/es.ts`, inside the `pdfGate` object, add the matching key after its `close`:

```ts
    close: "Cerrar",
    reopen: "Descarga el paper de Ramon",
```

(If the existing `close` line text differs, keep the existing `close` line as-is and add the `reopen` line directly beneath it.)

- [ ] **Step 3: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint lib/conference-push.ts components/sections/ConferencePush.tsx`
Expected: no errors (the `reopen` key now exists on `dict.pdfGate`).

- [ ] **Step 4: Commit (matcher + component + dict together)**

```bash
git add lib/conference-push.ts components/sections/ConferencePush.tsx lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/es.ts
git commit -m "feat: add ConferencePush homepage paper trigger + reopen copy"
```

---

## Task 8: Wire `ConferencePush` into the homepage

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Import the loader + component**

In `app/[locale]/page.tsx`, add `loadPublications` to the existing `@/lib/sanity/loaders` import block:

```ts
  loadEventsPage,
  loadContactCta,
  loadPublications,
} from "@/lib/sanity/loaders";
```

And add the component import alongside the other section imports:

```ts
import { ConferencePush } from "@/components/sections/ConferencePush";
```

- [ ] **Step 2: Load publications in the parallel fetch**

In the `Promise.all` destructure + array, add `publications` / `loadPublications(locale)` (keep positions aligned):

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
  ]);
```

- [ ] **Step 3: Render the component** (first child inside `<main id="main">`; it renders nothing unless `?paper=` matches, so placement is functionally neutral — put it first):

```tsx
    <main id="main">
      <ConferencePush dict={dict} publications={publications} />
      <Hero dict={dict} locale={locale} content={homepage?.hero} />
```

- [ ] **Step 4: Type-check + lint**

Run: `npx tsc --noEmit && npx eslint "app/[locale]/page.tsx"`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/page.tsx"
git commit -m "feat: mount ConferencePush on the homepage"
```

---

## Task 9: End-to-end verification + handoff notes

**Files:** none (verification only)

- [ ] **Step 1: Set a test `campaignKey`** so a publication is targetable.

Easiest path: after the studio is redeployed, set `campaignKey` (e.g. `demo`) on a publication in Studio → Publications. For a purely local check without a redeploy, write it directly with a one-off (requires `SANITY_WRITE_TOKEN` in `.env.local`):

```bash
npx tsx --env-file=.env.local -e "import('@sanity/client').then(async ({createClient})=>{const c=createClient({projectId:'r3bmhb31',dataset:'production',apiVersion:'2024-12-01',token:process.env.SANITY_WRITE_TOKEN,useCdn:false});const pub=await c.fetch('*[_type==\"publication\" && defined(file.asset)][0]{_id}');if(!pub){console.log('no publication with a file');return;}await c.patch(pub._id).set({campaignKey:'demo'}).commit();console.log('set campaignKey=demo on',pub._id);})"
```

Expected: `set campaignKey=demo on <id>`.

- [ ] **Step 2: Browser matrix** (dev server running):
  - `/en` → no modal, no sticky button (clean homepage).
  - `/en?paper=bogus` → nothing renders (unknown key).
  - `/en?paper=demo` → email modal auto-opens with the paper's title.
  - Dismiss the modal (✕ / Cancel / Escape) → sticky "Get Ramon's paper" button appears bottom-right → click it → modal reopens.
  - `/es?paper=demo` → modal opens with Spanish copy (`Descarga…` sticky label, Spanish gate text).

  Verify via the preview tool: after navigating, the modal element is `document.querySelector('[role="dialog"]')` and the sticky button text is `dict.pdfGate.reopen`.

- [ ] **Step 3: Full type-check + lint sweep**

Run: `npx tsc --noEmit && npx eslint components/sections/PdfGateModal.tsx components/sections/ConferencePush.tsx components/sections/GatedPublications.tsx lib/conference-push.ts lib/download.ts "app/[locale]/page.tsx"`
Expected: no errors.

- [ ] **Step 4: Studio type-check (already committed in Task 1) + deploy reminder**

The studio `campaignKey` field requires `npx sanity deploy` (in `humanx-studio`) for authors to edit it. Note this in the handoff; the website already reads the field.

- [ ] **Step 5: Final commit (if any verification fixups were needed)**

```bash
git add -A
git commit -m "chore: conference paper push verification fixups"
```

(Skip if nothing changed.)

---

## Handoff notes (not tasks)

- **Studio redeploy required:** `cd humanx-studio && npx sanity deploy` so Ramon can set `campaignKey` per paper.
- **Share link format:** `https://humanxinsights.com/en?paper=<campaignKey>` (or `/es?...`). Generate a QR to that URL for Ramon's slide.
- **Website redeploy:** rebuild/redeploy the site so the homepage picks up the new component + publications data.
- **Lead destination:** emails land in the existing HubSpot download form (`NEXT_PUBLIC_HUBSPOT_DOWNLOAD_FORM_GUID`), same as `/publications`.
