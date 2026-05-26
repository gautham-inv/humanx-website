# Global Contact CTA — Design Spec

**Date:** 2026-05-22
**Status:** Approved (verbal), pending written review
**Author:** Pairing session

## Problem

Today the "Want to work together?" CTA (title + inline `HumanForm`) renders on every page via `GlobalCTA`, mounted in `[locale]/layout.tsx`. That means the full form is duplicated on every route — visually heavy, and makes the form less of a moment on the homepage.

In parallel, `/about` carries its own modal stack (`AboutModalProvider` + `AboutCTAButton`) plus a hand-rolled centered "Final CTA" section that duplicates the same intent.

## Goal

Restructure so:

1. **Homepage**: inline form near the footer (current two-column GlobalCTA pattern).
2. **Every other page**: a centered CTA section (title + body + single gold button) above the footer. Button opens a modal containing the form.
3. **Single modal instance** for the whole site, owned by a global provider — `/about`'s ad-hoc modal stack gets retired in favor of this.

## Non-goals

- Changing the form fields or submit behavior. `HumanForm` is unchanged.
- Changing the visual treatment of the inline form on the homepage.
- Touching nav, footer, summit bar, or the recently shipped light/dark theme.

## Architecture

```
[locale]/layout.tsx
└─ <ContactModalProvider dict={dict}>           [new — owns single modal]
   └─ <SmoothScroll>
      ├─ <SummitBar />
      ├─ <Nav />
      ├─ {children}                              [page content]
      ├─ <GlobalCTA dict={dict} />               [refactored — pathname-aware]
      └─ <Footer />
```

The provider sits outside `<SmoothScroll>` so the modal portal is unaffected by Lenis transforms. Any component beneath it can call `useContactModal()`.

## Components

### `ContactModalProvider` — new

`components/layout/ContactModalProvider.tsx`. Client component.

- Same shape as the doomed `AboutModalProvider`: context provides `{ open, close, isOpen }`.
- Renders a single `<Modal>` with `<HumanForm>` inside. Form fields config (name / email / topic / message) lives **here** as the single source of truth.
- Hook export: `useContactModal()`.
- Receives the full `dict` to populate form labels, placeholders, topic options, modal title, modal close label.

### `GlobalCTA` — refactored, same file

`components/sections/GlobalCTA.tsx`. Becomes a `"use client"` component (needs `usePathname`).

- Detects homepage by stripping the locale prefix: `pathname === '/${locale}'`.
- **Homepage variant**: existing two-column layout. Title + body on the left, inline `HumanForm` on the right. No button.
- **Other-page variant**: centered. Eyebrow + large display title + body + single gold pill button. Button calls `useContactModal().open()`. Radial-accent background gradient (mirror the look of `/about`'s current hand-rolled Final CTA so we don't introduce a third visual treatment).
- Both variants keep `id="contact"` so existing `#contact` anchors still work.

### `ContactCTAButton` — renamed from `AboutCTAButton`

`components/layout/ContactCTAButton.tsx`. Same primary/secondary variants, same gold-pill look. Internally swaps `useAboutModal` for `useContactModal`. Used by:

- The new `GlobalCTA` non-home variant.
- `/about` page's hero CTA (already uses it under the old name).

## Files touched

| File | Change |
|------|--------|
| `components/layout/ContactModalProvider.tsx` | NEW |
| `components/layout/ContactCTAButton.tsx` | NEW (moved + renamed from `components/sections/about/AboutCTAButton.tsx`) |
| `components/sections/GlobalCTA.tsx` | Refactor to client + pathname-aware variants |
| `app/[locale]/layout.tsx` | Wrap `<SmoothScroll>` with `<ContactModalProvider>` |
| `app/[locale]/about/page.tsx` | Drop `<AboutModalProvider>` wrap; drop the hand-rolled Final CTA `<section>`; swap `AboutCTAButton` import → `ContactCTAButton` |
| `components/sections/about/AboutModalProvider.tsx` | DELETE |
| `components/sections/about/AboutCTAButton.tsx` | DELETE (moved) |
| `lib/i18n/dictionaries/en.ts` | Add `cta.modalTitle`, `cta.modalClose`, `cta.openModalLabel` (canonical button copy for the non-home variant). Remove orphaned `about.modalTitle`, `about.modalClose`, `about.finalCtaTitle`, `about.finalCtaBody` |
| `lib/i18n/dictionaries/es.ts` | Mirror dict changes |

## Dictionary additions

```ts
cta: {
  // existing fields preserved …
  openModalLabel: "Get in touch",     // button on non-home CTA section
  modalTitle: "Open a conversation",  // moved from about.modalTitle
  modalClose: "Close",                // moved from about.modalClose
}
```

The `/about` page's hero already uses `t.primaryCta = "Start a conversation"` — left intact.

## Edge cases & risks

- **Pathname matching** must handle trailing slashes and both locales. Implementation: `const isHome = pathname === '/${locale}' || pathname === '/${locale}/'`.
- **SSR / hydration**: `GlobalCTA` becomes a client component. The variant decision happens on the client; SSR will render the home variant by default. Mitigation: render based on whether `pathname.replace(/^\/(en|es)\/?$/, '') === ''`. Since Next.js makes `usePathname` work in SSR by reading the route, this should match server-side too. Verify in build output.
- **Anchor links to `#contact`**: still work on every page (id preserved on both variants).
- **`AboutCTAButton` callers**: only `/about/page.tsx`. One file to update.
- **Lenis + modal**: existing `<Modal>` handles body scroll lock; provider mounts modal outside `<SmoothScroll>` so Lenis isn't fighting it. Already proven on `/about` today.

## Out of scope (deferred)

- Form submission backend wiring. `HumanForm.onSubmit` continues to do whatever it does today.
- Adding a "thanks" / success state inside the modal. Whatever the form does on success now is what it'll keep doing.
- Per-page CTA copy variation. Single canonical copy from `dict.cta` for the non-home variant.

## Test plan

Build-time verification:

- [ ] `npm run build` — all 14 static routes still emit cleanly.
- [ ] `npx tsc --noEmit` — no type errors.

Manual smoke (dev server):

- [ ] `/en` (homepage): inline form renders above footer; no modal trigger button visible there.
- [ ] `/en/about`: no "Final CTA" duplicate section; centered GlobalCTA renders above footer; clicking its button opens the modal.
- [ ] `/en/about` hero "Start a conversation" button: still opens the modal (now via global context).
- [ ] `/en/services`, `/en/events`, `/en/insights`, `/en/publications`: centered CTA renders above footer; button opens modal.
- [ ] `/es/*` equivalents: same behavior, Spanish copy intact.
- [ ] Anchor `/en#contact`: scrolls to inline form. `/en/about#contact`: scrolls to the centered CTA block.
- [ ] Modal: focus trap, Esc closes, body scroll locks.
- [ ] Light theme toggle: still works; CTA section renders correctly in both themes.
