# /about page — design

**Status:** Approved
**Date:** 2026-05-22
**Reference:** https://abetterlou.com/

## Purpose

Build a dedicated `/about` route that owns the HumanX mission, vision, experience, and founder story — currently scattered across the homepage as separate sections. The page replicates the reference site's structural pattern: a hero with a primary CTA, four narrative sections each with a distinct layout, a floating scroll-spy section nav, and a final dramatic CTA — both CTAs open a contact modal.

## Scope

**In:**
- New `/about` route under `app/[locale]/about/` rendered statically for `en` and `es`.
- Six-section narrative: Hero → Mission → Vision → Experience → Founder → Final CTA.
- Floating bottom pills navigation with `IntersectionObserver` scroll-spy.
- Generic `Modal` primitive (focus trap, scroll lock, ESC/backdrop close, ARIA `dialog`).
- Contact modal triggered from both hero and final CTA; body is the existing `HumanForm`.
- Removal of `<About />` and `<Ramon />` from the homepage; deletion of the now-orphaned `Ramon.tsx` and `About.tsx` after their visual treatments are inlined into the About page.
- Nav update: insert `about` as the **first** item (left-most), giving order `about · services · events · insights · publications`.
- Dictionary extensions in both `en.ts` and `es.ts`.

**Out:**
- Detail pages for individual values/principles.
- New backend / form-submission logic (HumanForm's existing submission flow is reused unchanged).
- A new design system; uses existing tokens (`bg`, `bg-elev`, `ink`, `ink-dim`, `accent`, `accent-bright`, `line`, `violet`, `cyan`).

## Page structure

| # | Section | Anchor | Layout |
|---|---------|--------|--------|
| 1 | Hero | — | Title + sub + primary CTA. Right side: softened `ramon2.png` cutout + `BackgroundOrbs`. |
| 2 | Mission | `#mission` | Image-left / text-right. Image is a photographic placeholder (uses existing `person.webp`) inside a rounded frame. |
| 3 | Vision | `#vision` | Two-column: large quoted intro left, numbered list right. Numbered list reuses `dict.values.items` (Empathy / Gratitude / Trust / Caring). |
| 4 | Experience | `#experience` | Body copy + the 30+ stat callout extracted from current `About.tsx`. Optionally a second secondary stat. |
| 5 | Founder | `#ramon` | Mirrors current `Ramon.tsx`: `ramon2.png` over rings + dots background, eyebrow, title, body, 3-up stats grid. |
| 6 | Final CTA | — | Full-width dark section, large `font-display` title, subhead, primary CTA button. Same button-action as hero CTA. |

### Section pill nav

- Renders inside a client component `AboutScrollSpy` mounted once at page bottom.
- Fixed position: `bottom-6 left-1/2 -translate-x-1/2 z-30`.
- Visible only on the about page (it's part of that page's tree).
- Pills: Mission · Vision · Experience · Founder. Order matches DOM order.
- Active pill: `bg-bg/80` background with `text-ink`; inactive: `text-ink-dim`.
- Active state via `IntersectionObserver` watching the four `<section id="...">` anchors with `rootMargin: "-45% 0px -45% 0px"` so the active section is the one closest to viewport center.
- Click handler smooth-scrolls via `element.scrollIntoView({ behavior: "smooth", block: "start" })`. Respects `prefers-reduced-motion` (falls back to `behavior: "auto"`).
- On mobile (`< sm`): pills become a horizontally-scrollable strip, still bottom-fixed.
- Hidden via `aria-hidden` + `pointer-events-none opacity-0` when modal is open.

### Modal

- Component: `components/ui/Modal.tsx`.
- API: `<Modal open={boolean} onClose={() => void} labelledBy={string} title={ReactNode}>{children}</Modal>`.
- Renders via `createPortal` into `document.body`.
- Backdrop: full-viewport `bg-bg/80 backdrop-blur-md`. Click-outside closes.
- Panel: max-w-2xl, `bg-bg-elev`, `rounded-2xl`, border, padding, scroll-internal if content overflows.
- Focus trap: focuses first focusable on open; restores trigger focus on close. Tab/Shift+Tab cycles within panel.
- ESC key closes.
- Body scroll lock: sets `document.body.style.overflow = "hidden"` on open, restores on close.
- ARIA: `role="dialog" aria-modal="true" aria-labelledby={labelledBy}`.
- Animation: `motion-safe` fade + scale via Tailwind transitions (no GSAP dependency).
- Close button (top-right `×`) for explicit dismissal.

### Contact CTA flow

- Trigger: two buttons (`HeroCTA`, `FinalCTA`) on the About page.
- Click → opens `<Modal>` containing the existing `<HumanForm dict={dict} />`.
- HumanForm submission behavior is unchanged from its current implementation; on success, the form's own success state shows inside the modal. The modal stays open until the user explicitly closes it (no auto-close).

## Files

### New

- `app/[locale]/about/page.tsx`
  - Server component.
  - Renders all six sections inline as JSX from `dict.about` / `dict.values`.
  - Wraps the four scroll-spy sections + final CTA in `<AboutScrollSpy dict={dict}>...</AboutScrollSpy>` so the client wrapper can mount the pills + modal state.
- `components/sections/about/AboutScrollSpy.tsx`
  - `"use client"`. Children are the rendered sections (server-rendered JSX passed through).
  - Owns: `useState` for modal open, `IntersectionObserver` for active section, two render-props (or context) so the hero and final CTA buttons can call `openModal()`.
  - Renders the floating pills + the `Modal`.
- `components/ui/Modal.tsx`
  - Generic accessible modal as described above.

### Edited

- `app/[locale]/page.tsx` — remove `<About />` and `<Ramon />` mounts and their imports.
- `components/layout/Nav.tsx` — extend `NavKey` and `NAV_ITEMS` with `about`, inserted between `events` and `insights`.
- `lib/i18n/dictionaries/en.ts` — add `nav.about: "About"`; extend the existing `about` block (see Dictionary additions below).
- `lib/i18n/dictionaries/es.ts` — same extensions translated.

### Deleted

- `components/sections/About.tsx` — content/markup moved into the About page sections.
- `components/sections/Ramon.tsx` — visual treatment moved into the Founder section.

(Deletion is final after the About page renders the equivalent content; no other components import these.)

## Dictionary additions

Extend the existing `about` block. New keys:

```ts
about: {
  // existing
  eyebrow: "About",
  title: "About HumanX Insights",
  missionTitle: "Our Mission",
  missionBody: "...",
  visionTitle: "Our Vision",
  visionBody: "...",
  experienceTitle: "Our Experience",
  experienceBody: "...",

  // new — page-level
  pageEyebrow: "About",
  pageTitle: "Why HumanX exists",
  pageBody: "A practice built around one bet: human experience is the operating principle that makes everything else — AI, CX, EX — actually work.",
  primaryCta: "Start a conversation",

  // new — section-specific copy
  mission: {
    imageAlt: "Ramon in conversation",
    // missionTitle + missionBody reused
  },
  vision: {
    intro: "A world where every organisation treats customer and employee experience as one discipline — measured by the hours returned to people, not the dashboards delivered to leadership.",
    // visionTitle reused; numbered items reuse dict.values.items
  },
  experience: {
    statValue: "30+",
    statLabel: "Years of insights & analytics expertise",
    statNote: "Pioneering loyalty, retail insight-driven narratives, and CX/EX frameworks with proven results.",
    // experienceTitle + experienceBody reused
  },
  founderEyebrow: "Founder",
  // The Founder section's title, body, and stats come from the existing top-level
  // `dict.ramon` block (eyebrow, title, body, stats[]) — unchanged. Only the
  // new `founderEyebrow` here overrides the displayed eyebrow on /about so it
  // reads "Founder" instead of `ramon.eyebrow`.

  // new — final CTA
  finalCtaTitle: "Want to work together?",
  finalCtaBody: "One inbox. One reply within two working days. Tell us the moment.",

  // new — modal
  modalTitle: "Open a conversation",
  modalClose: "Close",

  // new — section pills
  sectionNav: {
    mission: "Mission",
    vision: "Vision",
    experience: "Experience",
    founder: "Founder",
  },
}
```

(Final wording is fillable during implementation; the schema is what matters here.)

## Behavior & accessibility

- All scroll-spy section anchors are real `<section id="...">` elements so deep links (`/about#vision`) work without JS.
- Pills are `<a href="#mission">` etc. with `onClick` calling smooth-scroll + `preventDefault()`; falls back to native anchor jump if JS fails.
- Modal: focus trap, ESC, ARIA `dialog`, labelled by hero's CTA-trigger-aria-label or modal title.
- `prefers-reduced-motion`: GSAP entrance reveals, modal fade/scale, and smooth-scroll all check `window.matchMedia("(prefers-reduced-motion: reduce)")` and degrade to instant.
- Static export compatibility: no server-only imports in client components; modal uses `createPortal(document.body)` guarded by `typeof window !== "undefined"`.

## Risks & decisions

- **Risk:** Active-pill flicker at section boundaries. *Mitigation:* `rootMargin: "-45% 0px -45% 0px"` plus picking the entry with the highest `intersectionRatio` on each callback.
- **Risk:** Modal scroll-lock conflicts with `SmoothScroll` (Lenis-like wrappers). *Mitigation:* if a global smooth-scroller is active, call its `stop()` / `start()` instead of toggling `body.style.overflow`. Investigation point during implementation.
- **Decision:** Sections 2–5 use real `<section id>` so deep links work. The pills are conveniences, not the source of routing.
- **Decision:** Final CTA reuses the same modal (same `useState`), not a duplicate modal — there's only one form in the DOM at a time.
- **Decision:** Nav order is **about** · services · events · insights · publications — "who we are" comes first, then what we do.

## Out of scope / follow-ups

- Localized copy polish (Spanish translations of the new keys will be done at implementation time but not separately reviewed).
- Adding a "Read the manifesto" secondary CTA — only Primary CTA in this iteration.
- Replacing photographic placeholders with bespoke About-page photography.
- Migrating other long-form forms to the new `Modal` primitive — only the About CTA uses it for now.
