# Consistent Logo Sizing — Design

**Date:** 2026-06-08
**Status:** Approved (pending spec review)

## Problem

Brand/conference logos render at a fixed height with auto width (`h-10 md:h-12 w-auto`) on two surfaces:

- Homepage Clients + Partners ticker — `components/sections/LogoTicker.tsx`
- On-stage conferences wall — `components/sections/on-stage/MajorConferences.tsx`

Because width floats with each logo's aspect ratio (and baked-in whitespace varies per uploaded file), logos look unevenly sized: a wide wordmark fills far more space than a compact square mark at the same height, and ticker gaps look irregular.

## Decision

Normalize logos to **strict equal-size tiles** purely on the render side. No Sanity schema change — the `humanx-studio` repo is untouched.

Each logo lives in an identical fixed-size box and the image is `object-contain` within it, so every logo occupies the exact same rectangle regardless of aspect ratio.

### Tile dimensions

- Mobile: 40×128 (`h-10 w-32`)
- Desktop: 48×160 (`h-12 w-40`)
- ~3.3:1 — wide enough for wordmarks; square marks get side breathing room. Heights are unchanged from today.

### Image rendering

- Image classes become `h-full w-full object-contain` (was `h-10 md:h-12 w-auto`). Logos scale down to fit entirely inside the box, preserving aspect ratio.
- Dark and light variants both receive the box. The existing theme toggle in `app/globals.css:124-127` (`.partner-logo-dark` / `.partner-logo-light` via `display`) is unchanged — only one variant is visible per theme, so the hidden one takes no layout space.
- Keep the `width`/`height` HTML attributes (from Sanity native dimensions, default 0). The fixed box already reserves layout space, so there is no CLS regression.
- Text fallback (no logo uploaded) is unchanged.

## Architecture

Extract a shared component so both surfaces render logos identically and cannot drift apart in future edits.

### `LogoMark` component

New file: `components/sections/LogoMark.tsx` (server component, no client hooks).

Props:

```ts
type LogoMarkProps = {
  name: string;            // alt text + title
  logoUrl: string;         // dark-theme variant; "" when none
  logoWidth: number;       // native px, 0 when unknown
  logoHeight: number;
  logoLightUrl: string;    // light-theme variant; "" → fall back to logoUrl
  logoLightWidth: number;
  logoLightHeight: number;
};
```

Behavior:

- Renders the fixed-size tile wrapper (`inline-flex items-center justify-center h-10 w-32 md:h-12 md:w-40`) containing the stacked dark + light `<img>` elements, each `h-full w-full object-contain` with the existing `partner-logo-dark` / `partner-logo-light` classes.
- Light variant falls back to the dark URL/dimensions when `logoLightUrl` is empty (matches current logic in both components).
- Has no notion of links or text fallback — callers decide whether there's a logo (`logoUrl || logoLightUrl`) and wrap with anchors or render text themselves. This keeps `LogoMark` purely "render this logo at the standard size."

Both `PartnerItem`/`ClientItem` and `ConferenceItem` already expose exactly these fields (`lib/sanity/loaders.ts`), so callers spread the relevant props directly.

### Consumers

- **`LogoTicker.tsx`** — replace the inline dark/light `<img>` pair (currently lines ~178-195) with `<LogoMark {...row} />`. The `TickerRow` mapping, two-row split, marquee animation, and anchor/text-fallback logic stay as-is. Every tile is now the same width, so flex gaps render evenly.
- **`MajorConferences.tsx`** — replace the inline dark/light `<img>` pair (currently lines ~70-87) with `<LogoMark {...c} />`. The `min-h-12` logo area is replaced by the tile's fixed height. Card layout, meta line, and anchor wrap stay as-is.

## Out of scope

- No Sanity schema changes (no per-logo size field).
- The HumanX brand logo in `Nav`/`Footer` and the decorative SVG in `ServicesHeroSolarSystem` are not brand-wall logos and are untouched.

## Verification

Run the dev server and confirm:

1. Homepage ticker — clients and partners render as evenly-sized tiles; gaps look uniform; marquee still loops.
2. `/on-stage` conferences wall — logos sit in equal boxes inside cards.
3. Toggle light/dark theme — correct variant shows in both, sized identically.
4. Resize to mobile width — tiles use the 40×128 box, still even.
5. No console errors; no layout shift as logos load.
