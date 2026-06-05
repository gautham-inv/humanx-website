# Hero Background Video + Scroll Crossfade — Design Spec

- **Date:** 2026-06-05
- **Status:** Approved (design), pending implementation
- **Scope:** Homepage hero + "Keynotes that move the room" (OnStageTeaser)

## Goal

Turn the homepage hero into an immersive moment: the keynote reel plays as the
hero background (desktop) behind the existing text, and the portrait that used
to sit on the hero's right relocates down to the next section. Scrolling from the
hero into the next section reads as a crossfade — the hero fades away as you
scroll, the next section's text fades in — with no separation line between them.
The now-redundant inline video player in the next section is removed.

## Decisions

1. **Hero backdrop — desktop (lg+):** full-bleed background `<video>`
   (`/videos/keynote.webm`, `autoPlay muted loop playsInline`, `preload="auto"`)
   replacing the right-side portrait. A left-weighted dark scrim over it
   (`bg-gradient-to-r from-bg/85 via-bg/55 to-bg/25`, plus a faint bottom fade)
   keeps the left-aligned text readable. Existing hero text (eyebrow, headline,
   clarifier, sub, both CTAs) is unchanged, now layered over the video.
2. **Hero backdrop — mobile (<lg):** no video. The existing dark hero (page
   background + drifting `BackgroundOrbs`) with text. No video bytes on phones.
3. **Portrait relocation:** the `person.webp` portrait (via the existing
   `HeroImage`, parallax intact) moves to the OnStageTeaser section, which
   becomes two-column on desktop — **text + "Watch me on stage" button left,
   portrait right.** On mobile it stacks (text, then portrait).
4. **Remove the OnStageTeaser inline video player** (the `<video>` block). The
   reel now lives only as the hero backdrop; `keynote.webm` stays in `/public`.
5. **Scroll crossfade:** a GSAP ScrollTrigger scrubs the whole hero's opacity
   `1 → 0` as it scrolls above the viewport top. The next section's text fades in
   on entry (existing `Reveal`). The `border-t border-line` between hero and
   OnStageTeaser is removed so they flow.
6. **Performance + a11y:** the hero video pauses when scrolled offscreen; under
   `prefers-reduced-motion` the video does not autoplay (static dark hero) and
   the scrub fade is disabled. Uses the project's existing GSAP + Lenis wiring
   (`SmoothScroll` already calls `lenis.on("scroll", ScrollTrigger.update)`).

## Components / files

- **`components/sections/Hero.tsx`** — remove the `HeroImage` portrait block; add
  the video backdrop + scrim (desktop only); wrap inner content in the scroll
  fade; remove the section's trailing border.
- **New `components/sections/HeroVideoBackdrop.tsx`** (client) — desktop-only
  background video + dark scrim; autoplay/loop/muted/playsInline; pauses when
  offscreen; respects reduced-motion.
- **New `components/motion/ScrollFadeOut.tsx`** (client, reusable) — wraps
  children and scrubs opacity `1 → 0` (with a slight `y`) as the element scrolls
  past the viewport top; no-op under reduced-motion.
- **`components/sections/OnStageTeaser.tsx`** — two-column layout (text + CTA
  left, `HeroImage` portrait right; stacked on mobile); remove the `<video>`
  player and the `border-t border-line`.

## Edge cases

- **iOS/desktop autoplay:** muted + `playsInline` satisfies autoplay policies on
  desktop browsers (where the video runs). Mobile is excluded by design.
- **Reduced motion:** static dark hero (no autoplay), no scrub fade.
- **Portrait container:** `HeroImage` uses `fill`, so its OnStageTeaser wrapper
  needs a defined height/aspect (sized during implementation + browser tuning).
- **Lenis:** scrub works because ScrollTrigger is already synced to Lenis.

## Verification

- Browser (preview): desktop → video plays behind readable text; scrolling fades
  the hero out and the next section in; portrait sits right in OnStageTeaser; no
  separation line; no inline player. Mobile → dark hero (no video), OnStageTeaser
  stacked.
- `npx tsc --noEmit` and `eslint` clean on touched files.

## Out of scope / Deferred

- Mobile background video (excluded by decision).
- A poster image for the desktop video (optional; can add a dark frame later).
- Compressing/transcoding `keynote.webm` (12 MB) — desktop-only mitigates it;
  revisit if hero load becomes a concern.
