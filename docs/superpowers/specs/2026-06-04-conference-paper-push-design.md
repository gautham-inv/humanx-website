# Conference Paper Push — Design Spec

- **Date:** 2026-06-04
- **Status:** Approved (design), pending implementation plan
- **Owner:** HumanX website

## Problem / Goal

Ramon presents at conferences and shares a link/QR with the audience. When an
attendee opens that link (typically mid-talk, on a phone), the site should
**push a specific publication PDF and capture the attendee's email** as a lead —
in roughly two clicks — without harming the experience for normal/organic
visitors.

**Primary goal chosen:** lead capture (email required to unlock the PDF), not
frictionless reach.

## Key Decisions

1. **Entry = tagged-link homepage modal.** Ramon shares a tagged URL/QR like
   `https://humanxinsights.com/en?paper=aecoc`. The homepage auto-opens a
   download modal **only when the `?paper=<key>` param is present and matches a
   publication**. Organic visitors (no param) see the normal, clean homepage —
   no interstitial, no SEO/UX harm.
2. **Targeting = `?paper=<key>`.** Each publication gets a short **`campaignKey`**
   field in Sanity (e.g. `aecoc`). `?paper=aecoc` pushes that specific paper.
   Different conferences can run different papers simultaneously; all editable
   in Studio.
3. **Gate = soft (Option A).** The modal auto-opens and email is required to
   download, **but it is dismissible** (✕ / "I'll look around first"). On
   dismiss, a small **sticky "Get Ramon's paper" button** persists so they can
   re-open it. Not a hard, un-closable gate.
4. **Reuse the existing email→HubSpot gate.** Leads must land in the same
   HubSpot download form already used by `GatedPublications`, via
   `submitGatedDownload()`. The gate UI is extracted into a shared component so
   the homepage push and the `/publications` list behave identically (DRY).

## The two-click flow

1. **Click 1 — link/QR.** Lands on the homepage; the modal slides up
   automatically (param detected). No click needed to open it.
2. **Click 2 — "Get the paper."** Modal shows the matched paper (title + short
   line; cover thumbnail if available), an email field (`type="email"` for the
   mobile keyboard), a consent checkbox, and one primary button. Enter email →
   tap once → email POSTs to HubSpot, the PDF downloads, modal closes, brief
   confirmation. Email is now a captured lead.

## Architecture / Components

### 1. Sanity — `publication` schema (humanx-studio)
- Add field **`campaignKey`** (`string`): "Short key used in conference share
  links (`?paper=<key>`), e.g. `aecoc`. Leave empty if the paper isn't being
  pushed." Optional; lowercase/slug-style recommended (not enforced).
- Requires a Studio redeploy to edit.

### 2. Website data layer (`lib/sanity`)
- `publicationsQuery`: add `campaignKey` to the projection (already returns
  `id, title, kind, date, file`). Add cover image URL **only if** the
  `publication` schema already has an image field; otherwise omit (see Open/
  Deferred). 
- `PublicationDoc` + `PublicationItem`: add `campaignKey: string` (empty when
  unset).
- `loadPublications()` already filters to items with a `file`; keep that. The
  push can only target a publication that has a file.

### 3. Shared gate component (refactor)
- Extract the existing modal + submit logic from `GatedPublications.tsx` into a
  reusable **`PdfGateModal`** (presentational + `submitGatedDownload` +
  `triggerDownload`, reading copy from `dict.pdfGate`). Props: the selected
  publication (`title`, `file`), `dict`, `open`, `onClose`, and an
  `unlocked`/`onUnlocked` pair (or an internal hook) so the "one email unlocks
  the session" behavior is shared.
- `GatedPublications` is updated to consume `PdfGateModal` (no behavior change
  to `/publications`).

### 4. `ConferencePush` (new client component)
- `"use client"`. Mounted on the homepage.
- Props: `publications: PublicationItem[]`, `dict`.
- On mount (in a `useEffect`, client-only — avoids static-export/Suspense
  issues), read `window.location.search` for `paper`. Find the publication whose
  `campaignKey` matches (case-insensitive). 
  - **No param or no match → render nothing** (clean homepage).
  - **Match → open `PdfGateModal`** for that publication (soft/dismissible).
- Soft-gate behaviour: dismiss closes the modal and shows a fixed-position
  sticky button ("Get Ramon's paper") to re-open. After a successful
  submit+download, the modal closes and the push is considered satisfied
  (sticky button hidden, or shows "Downloaded ✓"); re-opening within the session
  downloads directly via the shared `unlocked` state.

### 5. Homepage (`app/[locale]/page.tsx`)
- Add `loadPublications(locale)` to the existing parallel `Promise.all`.
- Render `<ConferencePush publications={publications} dict={dict} />` (renders
  nothing unless a valid `?paper=` is present).

## Data flow

`loadPublications` (build time, baked into static HTML) → `ConferencePush`
props → client reads `?paper=` at runtime → matches `campaignKey` → opens
`PdfGateModal` → email → `submitGatedDownload()` (HubSpot) → `triggerDownload()`.

## Editability in Sanity

- `publication.campaignKey` — the per-paper share key (the whole point of the
  per-conference targeting). Editable in Studio → Publications.
- Modal copy continues to come from `dict.pdfGate` (heading, body, consent,
  submit, etc.), consistent with the existing gate. (Making that copy
  Sanity-editable is out of scope / future.)

## Edge cases & behaviour

- **No `?paper=` / unknown key:** nothing renders; homepage is untouched.
- **Locale:** works on `/en` and `/es`; copy from `dict.pdfGate` per locale.
- **HubSpot download form not configured** (`NEXT_PUBLIC_HUBSPOT_DOWNLOAD_FORM_GUID`
  unset): mirror the existing gate's fallback — the modal still opens but submit
  downloads directly without a HubSpot POST (no lead). Currently it *is*
  configured, so the gate is live.
- **PDF URL is public** (Sanity CDN). This gate captures leads before the
  download; it does not lock the file. Real file protection (signed URLs /
  server gating) is explicitly out of scope.
- **Accessibility:** `role="dialog"`, `aria-modal`, focus the email field on
  open, Escape closes (soft gate), focus returns to the sticky button on close.
- **Reduced motion:** respect `prefers-reduced-motion` for the modal entrance.

## Testing

- Manual: `/en?paper=<validKey>` opens the modal for the right paper;
  `/en?paper=bogus` and `/en` (no param) render nothing; submit flow downloads
  the correct file and posts to HubSpot; dismiss → sticky button → re-open;
  `/es?paper=<key>` shows Spanish copy.
- `tsc --noEmit` and `eslint` clean in both repos.

## Out of scope / Deferred (YAGNI)

- Hard (un-closable) gate — rejected in favor of soft Option A.
- Per-conference greeting line ("Thanks for joining Ramon at AECOC") — optional
  future field.
- Analytics events (modal shown / submitted) — optional future.
- Cover thumbnail in the modal — include only if a publication image field
  already exists; otherwise defer (title-only modal is fine).
- Real file access protection (signed URLs).
