# HumanX Website — Live-Ready Elevation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. For any task that produces visible UI, ALSO invoke `frontend-design:frontend-design` before writing the component code — this plan defines structure and animation behavior, but the design skill enforces the visual quality bar.

**Goal:** Build the HumanX marketing site from scratch as a cinematic, summit-ready single page — bilingual (EN/ES), animated end-to-end with GSAP, and credible enough to project at a live event.

**Architecture:** Next.js 15 App Router with a single `/[locale]` route tree (en, es). Sections live in `components/sections/*` and compose into `app/[locale]/page.tsx`. Animation lives in a `motion/` folder: a Lenis smooth-scroll provider, a reusable `Reveal` wrapper around GSAP ScrollTrigger, and one-off section animations using `@gsap/react`'s `useGSAP` hook for cleanup safety. Copy is centralized in dictionaries (`lib/i18n/dictionaries/{en,es}.ts`) and looked up server-side per request, so the EN/ES animated transition is a route-level fade rather than a client store swap. Tailwind v4 with CSS-first design tokens in `globals.css` — no `tailwind.config.ts`.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3.13+ with `@gsap/react` and ScrollTrigger · Lenis 1.x · next/font (Inter + a serif display) · React 19.

**Foundation tasks (1–5) are prerequisite scaffolding not in the user's 12-item list.** The user's Round 1/2/3 priorities map to tasks 6–16 as called out per task.

---

## File Structure

```
app/
  [locale]/
    layout.tsx                # Root layout: fonts, SmoothScroll provider, Nav, SummitBar, Footer
    page.tsx                  # Home: composes Hero, AIWidget, Ramon, Events, Values
  globals.css                 # Tailwind v4 import + @theme tokens + base resets
  not-found.tsx
components/
  layout/
    Nav.tsx                   # Logo + LangSwitcher
    SummitBar.tsx             # Sticky top announcement (Round 1.5)
    Footer.tsx
    LangSwitcher.tsx          # Animated EN/ES toggle (Round 3.2)
  sections/
    Hero.tsx                  # Wrapper + bg orbs (Round 1.1, 1.3)
    HeroHeadline.tsx          # Word-by-word reveal (Round 1.1)
    BackgroundOrbs.tsx        # Animated gradient orbs (Round 1.3)
    Ramon.tsx                 # Stylised SVG monogram + bio (Round 1.4)
    AIWidget.tsx              # Glowing border, rotating header (Round 1.6)
    Events.tsx                # YouTube keynote embeds (Round 2.1)
    Values.tsx                # Full-width emotional strip (Round 2.2)
  motion/
    SmoothScroll.tsx          # Lenis provider, client component
    Reveal.tsx                # Reusable ScrollTrigger fade/translate (Round 1.2)
lib/
  i18n/
    config.ts                 # locales, defaultLocale, type Locale
    dictionaries/
      en.ts
      es.ts                   # Added in Task 16
    get-dictionary.ts         # async loader per locale
content/
  events.ts                   # Event data + YouTube IDs
  values.ts                   # Values strip data
hooks/
  useGsapContext.ts           # Tiny wrapper around @gsap/react useGSAP if needed
public/
  logo.svg                    # Drop-in (or use /logo.png from parent dir)
```

Each file targets ≤150 lines. Sections that grow past that during implementation get split (e.g., `Ramon.tsx` may produce `RamonMonogram.tsx` if the SVG block dominates).

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`, `README.md`, `postcss.config.mjs`

- [ ] **Step 1: Initialize Next.js**

Run in the empty `/Users/gautham/Documents/projects/humanx-website/` directory:

```bash
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app \
  --src-dir=false --import-alias="@/*" --turbopack \
  --use-npm --skip-install
```

If prompted about the non-empty dir (because `docs/` exists), accept overwrite of generated files but keep `docs/`.

- [ ] **Step 2: Install runtime + animation deps**

```bash
npm install gsap @gsap/react lenis
```

Confirm `package.json` lists `gsap`, `@gsap/react`, `lenis`, `next@15.x`, `react@19.x`, `tailwindcss@4.x`.

- [ ] **Step 3: Verify dev server boots**

```bash
npm run dev
```

Expected: server on `http://localhost:3000` showing the default Next.js page. Stop the server (Ctrl-C).

- [ ] **Step 4: Initial commit**

```bash
git add -A
git commit -m "chore: scaffold next 15 + tailwind v4 + gsap + lenis"
```

---

## Task 2: Design tokens + global styles

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace globals.css with tokens**

Overwrite `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0f;
  --color-bg-elev: #11111a;
  --color-ink: #f5f5f7;
  --color-ink-dim: #a3a3ad;
  --color-accent: #c9a961;        /* warm gold for HumanX */
  --color-accent-bright: #e8c87a;
  --color-violet: #8b5cf6;
  --color-cyan: #22d3ee;
  --color-line: rgba(255,255,255,0.08);

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;

  --shadow-glow: 0 0 60px -10px var(--color-accent);

  --radius-card: 1.25rem;
}

@layer base {
  html, body {
    background: var(--color-bg);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  ::selection {
    background: var(--color-accent);
    color: var(--color-bg);
  }

  /* Disable native smooth scroll — Lenis handles it. */
  html { scroll-behavior: auto; }

  /* Respect reduced motion: animations bypass via class. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
    }
  }
}
```

- [ ] **Step 2: Wire fonts in root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "HumanX — AI for People, Not Replacements",
  description: "Ramon's work on human-centered AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build + commit**

```bash
npm run build
```

Expected: compiles without errors. Then:

```bash
git add -A
git commit -m "feat: design tokens + display font stack"
```

---

## Task 3: Lenis smooth-scroll provider

**Files:**
- Create: `components/motion/SmoothScroll.tsx`

- [ ] **Step 1: Build the provider**

```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify no SSR crash**

```bash
npm run build
```

Expected: passes (component is client-only, gated).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: lenis smooth scroll + scrolltrigger sync"
```

---

## Task 4: i18n routing skeleton (EN only for now)

**Files:**
- Create: `lib/i18n/config.ts`, `lib/i18n/dictionaries/en.ts`, `lib/i18n/get-dictionary.ts`
- Create: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`
- Delete: `app/layout.tsx`, `app/page.tsx` (move contents into `[locale]`)
- Create: `middleware.ts`

- [ ] **Step 1: Locale config**

`lib/i18n/config.ts`:

```ts
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
```

- [ ] **Step 2: EN dictionary**

`lib/i18n/dictionaries/en.ts`:

```ts
export const en = {
  nav: {
    work: "Work",
    speaking: "Speaking",
    contact: "Contact",
  },
  summit: {
    label: "Live",
    text: "Ramon keynoting the HumanX Summit — Madrid, October 2026",
    cta: "Reserve seat",
  },
  hero: {
    eyebrow: "HumanX",
    headline: ["AI", "for", "people,", "not", "replacements."],
    sub: "Ramon builds technology that returns time to humans — and gives it back to the work that matters.",
    primary: "Watch the keynote",
    secondary: "Read the manifesto",
  },
  ramon: {
    eyebrow: "Who",
    title: "Ramon — founder, speaker, builder.",
    body: "Two decades shipping production systems across banking, telecom, and the public sector. Today, Ramon advises boards and stages on how to deploy AI without losing the team that got you here.",
    stats: [
      { value: "20+", label: "Years building" },
      { value: "40+", label: "Keynotes delivered" },
      { value: "12", label: "Countries on stage" },
    ],
  },
  ai: {
    title: "Ask the HumanX assistant",
    placeholder: "What should I know about Ramon's keynote?",
    suggestions: [
      "Book Ramon for an event",
      "Summarize the manifesto",
      "Show me the Caixa Bank talk",
    ],
  },
  events: {
    title: "On stage",
    body: "Recent keynotes, in full.",
    items: [
      { id: "ev-caixa", title: "The Human Layer", venue: "Caixa Bank Forum", date: "March 2026", youtubeId: "dQw4w9WgXcQ" },
      { id: "ev-pacifico", title: "Returning Time to People", venue: "Pacífico Summit", date: "November 2025", youtubeId: "dQw4w9WgXcQ" },
    ],
  },
  values: {
    title: "What HumanX stands for",
    items: [
      { title: "People first", body: "Tools that amplify, never erase." },
      { title: "Time returned", body: "Every automation gives an hour back." },
      { title: "Plain language", body: "If a board can't follow it, it isn't done." },
      { title: "Shipped, not slideware", body: "Production systems or it didn't happen." },
    ],
  },
  footer: {
    rights: "© 2026 HumanX. All rights reserved.",
  },
} as const;

export type Dictionary = typeof en;
```

- [ ] **Step 3: Dictionary loader**

`lib/i18n/get-dictionary.ts`:

```ts
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries = {
  en: () => import("./dictionaries/en").then((m) => m.en),
  es: () => import("./dictionaries/en").then((m) => m.en), // ES fallback to EN until Task 16
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
```

- [ ] **Step 4: Middleware for locale redirect**

`middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname === "/" ? "" : pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
```

- [ ] **Step 5: Move layout/page under `[locale]`**

Delete `app/layout.tsx` and `app/page.tsx`. Create `app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"], variable: "--font-fraunces", display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "HumanX — AI for People, Not Replacements",
  description: "Ramon's work on human-centered AI.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
```

Create `app/[locale]/page.tsx`:

```tsx
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <main className="min-h-screen px-6 py-20">
      <h1 className="font-display text-5xl">{dict.hero.eyebrow}</h1>
      <p className="mt-4 text-ink-dim">Scaffolding live at /{locale}</p>
    </main>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run build && npm run dev
```

Visit `http://localhost:3000` — expect redirect to `/en`. Visit `/es` — expect same page rendering (fallback dictionary). Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: i18n routing skeleton with en dictionary"
```

---

## Task 5: Nav, SummitBar shell, Footer

**Files:**
- Create: `components/layout/Nav.tsx`, `components/layout/Footer.tsx`, `components/layout/SummitBar.tsx`, `components/layout/LangSwitcher.tsx`
- Modify: `app/[locale]/layout.tsx`

These are shells. SummitBar animation and the LangSwitcher animation come in Tasks 9 and 16 respectively.

- [ ] **Step 1: LangSwitcher (static shell)**

`components/layout/LangSwitcher.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";

export function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const stripLocale = pathname.replace(/^\/(en|es)/, "") || "/";

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line px-1 py-1 text-xs uppercase tracking-widest">
      {locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}${stripLocale === "/" ? "" : stripLocale}`}
          className={
            loc === current
              ? "rounded-full bg-ink px-3 py-1 text-bg"
              : "px-3 py-1 text-ink-dim hover:text-ink"
          }
        >
          {loc}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Nav**

`components/layout/Nav.tsx`:

```tsx
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LangSwitcher } from "./LangSwitcher";

export function Nav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-bg/70 border-b border-line">
      <Link href={`/${locale}`} className="font-display text-xl tracking-tight">
        Human<span className="text-accent">X</span>
      </Link>
      <div className="flex items-center gap-8 text-sm">
        <a href="#work" className="text-ink-dim hover:text-ink">{dict.nav.work}</a>
        <a href="#speaking" className="text-ink-dim hover:text-ink">{dict.nav.speaking}</a>
        <a href="#contact" className="text-ink-dim hover:text-ink">{dict.nav.contact}</a>
        <LangSwitcher current={locale} />
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: SummitBar shell**

`components/layout/SummitBar.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function SummitBar({ dict }: { dict: Dictionary }) {
  return (
    <div className="relative z-50 overflow-hidden border-b border-line bg-gradient-to-r from-accent/15 via-violet/10 to-cyan/15">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-bg">
            {dict.summit.label}
          </span>
          <span className="text-ink">{dict.summit.text}</span>
        </div>
        <a href="#contact" className="text-accent hover:text-accent-bright">
          {dict.summit.cta} →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Footer**

`components/layout/Footer.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer id="contact" className="border-t border-line px-6 py-10 text-xs text-ink-dim">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="font-display text-base text-ink">
          Human<span className="text-accent">X</span>
        </span>
        <span>{dict.footer.rights}</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Wire into layout**

Replace `app/[locale]/layout.tsx` body section (children block) to include the shell:

```tsx
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Nav } from "@/components/layout/Nav";
import { SummitBar } from "@/components/layout/SummitBar";
import { Footer } from "@/components/layout/Footer";
// ...existing imports
```

Replace `body` JSX:

```tsx
<body>
  <SmoothScroll>
    <SummitBar dict={dict} />
    <Nav locale={locale as Locale} dict={dict} />
    {children}
    <Footer dict={dict} />
  </SmoothScroll>
</body>
```

Inside `LocaleLayout`, before returning, load dict:

```tsx
const dict = await getDictionary(locale as Locale);
```

- [ ] **Step 6: Verify in browser**

```bash
npm run dev
```

Visit `/en`. Confirm: summit bar at top with gradient, nav below sticky with logo + 3 links + EN/ES toggle, footer at bottom. Toggle EN→ES URL flips. Stop server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: nav + summit bar + footer + lang switcher shell"
```

---

## Task 6: Reusable Reveal component (Round 1.2 — scroll-triggered section animations)

**Files:**
- Create: `components/motion/Reveal.tsx`

- [ ] **Step 1: Build Reveal**

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Direction = "up" | "down" | "left" | "right" | "none";

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  distance = 32,
  duration = 0.9,
  stagger = 0,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const axis = direction === "left" || direction === "right" ? "x" : "y";
      const sign = direction === "down" || direction === "right" ? -1 : 1;

      const targets = stagger
        ? ref.current.querySelectorAll<HTMLElement>("[data-reveal-child]")
        : [ref.current];

      gsap.from(targets, {
        opacity: 0,
        [axis]: direction === "none" ? 0 : distance * sign,
        duration,
        delay,
        stagger: stagger || 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref }
  );

  return (
    // @ts-expect-error polymorphic ref
    <As ref={ref} className={className}>
      {children}
    </As>
  );
}
```

- [ ] **Step 2: Smoke-test on Home**

In `app/[locale]/page.tsx`, wrap the existing `<h1>` to confirm Reveal compiles and runs:

```tsx
import { Reveal } from "@/components/motion/Reveal";
// ...
<Reveal direction="up">
  <h1 className="font-display text-5xl">{dict.hero.eyebrow}</h1>
</Reveal>
```

Run `npm run dev`, refresh `/en`, confirm the heading fades-up on load. Then revert this smoke test (Reveal will be used in real sections from Task 7 onward).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: reusable scroll-triggered Reveal component"
```

---

## Task 7: Cinematic hero with word-by-word reveal (Round 1.1)

**Files:**
- Create: `components/sections/HeroHeadline.tsx`, `components/sections/Hero.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: HeroHeadline — word-by-word stagger**

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function HeroHeadline({ words }: { words: readonly string[] }) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const spans = ref.current.querySelectorAll<HTMLSpanElement>("[data-word]");
      gsap.set(spans, { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(spans, {
        yPercent: 0,
        opacity: 1,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.09,
      });
    },
    { scope: ref }
  );

  return (
    <h1
      ref={ref}
      className="font-display text-[clamp(2.75rem,8vw,7rem)] leading-[0.95] tracking-[-0.02em]"
    >
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom pb-[0.15em] pr-[0.18em]"
        >
          <span data-word className="inline-block">
            {w}
          </span>
        </span>
      ))}
    </h1>
  );
}
```

- [ ] **Step 2: Hero shell**

`components/sections/Hero.tsx`:

```tsx
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { HeroHeadline } from "./HeroHeadline";

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-32 pb-40">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-ink-dim">
          <span className="h-px w-8 bg-accent" />
          {dict.hero.eyebrow}
        </div>
        <HeroHeadline words={dict.hero.headline} />
        <p className="mt-8 max-w-xl text-lg text-ink-dim">{dict.hero.sub}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#speaking"
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition hover:bg-accent-bright"
          >
            {dict.hero.primary}
          </a>
          <a
            href="#manifesto"
            className="rounded-full border border-line px-6 py-3 text-sm text-ink hover:border-ink"
          >
            {dict.hero.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Compose into page**

Replace `app/[locale]/page.tsx`:

```tsx
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <main>
      <Hero dict={dict} />
    </main>
  );
}
```

- [ ] **Step 4: Browser verification**

`npm run dev`. Visit `/en`. Confirm: headline words ascend from below, staggered, with eyebrow above and CTA pair below. Hard refresh; animation re-runs each time. Stop server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cinematic hero with word-by-word headline reveal"
```

---

## Task 8: Animated background orbs (Round 1.3)

**Files:**
- Create: `components/sections/BackgroundOrbs.tsx`
- Modify: `components/sections/Hero.tsx`

- [ ] **Step 1: Build BackgroundOrbs**

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const orbs = [
  { size: 620, x: "8%", y: "12%", color: "var(--color-accent)", opacity: 0.18 },
  { size: 480, x: "78%", y: "18%", color: "var(--color-violet)", opacity: 0.22 },
  { size: 540, x: "55%", y: "70%", color: "var(--color-cyan)", opacity: 0.14 },
];

export function BackgroundOrbs() {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const els = ref.current.querySelectorAll<HTMLDivElement>("[data-orb]");
      els.forEach((el, i) => {
        gsap.to(el, {
          x: () => gsap.utils.random(-80, 80),
          y: () => gsap.utils.random(-60, 60),
          scale: () => gsap.utils.random(0.85, 1.15),
          duration: 8 + i * 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        });
      });
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {orbs.map((o, i) => (
        <div
          key={i}
          data-orb
          style={{
            width: o.size,
            height: o.size,
            left: o.x,
            top: o.y,
            background: `radial-gradient(closest-side, ${o.color}, transparent 70%)`,
            opacity: o.opacity,
            filter: "blur(40px)",
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,var(--color-bg)_70%)]" />
    </div>
  );
}
```

- [ ] **Step 2: Mount inside Hero**

In `components/sections/Hero.tsx`, import `BackgroundOrbs` and add as first child of the `<section>`:

```tsx
import { BackgroundOrbs } from "./BackgroundOrbs";
// inside section, before the z-10 container:
<BackgroundOrbs />
```

- [ ] **Step 3: Verify**

`npm run dev`. Visit `/en`. Confirm: three soft glowing color blobs drift behind the headline; bg fades to solid near bottom of hero. Reduce-motion OS setting freezes them (CSS in Task 2 handles this).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: animated gradient orbs behind hero"
```

---

## Task 9: SummitBar shimmer animation (Round 1.5 polish)

**Files:**
- Modify: `components/layout/SummitBar.tsx`

- [ ] **Step 1: Add an animated shimmer line under the bar**

Replace the SummitBar component:

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function SummitBar({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const dot = ref.current?.querySelector("[data-live-dot]");
      if (dot) {
        gsap.to(dot, {
          opacity: 0.3,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      const sheen = ref.current?.querySelector("[data-sheen]");
      if (sheen) {
        gsap.fromTo(
          sheen,
          { xPercent: -120 },
          { xPercent: 220, duration: 4, repeat: -1, ease: "power2.inOut", repeatDelay: 2 }
        );
      }
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="relative z-50 overflow-hidden border-b border-line bg-gradient-to-r from-accent/15 via-violet/10 to-cyan/15"
    >
      <div
        data-sheen
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-accent px-2 py-0.5 font-semibold text-bg">
            <span data-live-dot className="block h-1.5 w-1.5 rounded-full bg-bg" />
            {dict.summit.label}
          </span>
          <span className="text-ink">{dict.summit.text}</span>
        </div>
        <a href="#contact" className="text-accent hover:text-accent-bright">
          {dict.summit.cta} →
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

`npm run dev`. Confirm: pulsing live-dot in the gold pill; light sheen sweeps across the bar every few seconds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: animated live dot + sheen on summit bar"
```

---

## Task 10: AI widget with glowing animated border (Round 1.6)

**Files:**
- Create: `components/sections/AIWidget.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Build AIWidget**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function AIWidget({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const borderRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLSpanElement | null>(null);
  const [active, setActive] = useState(0);

  // Continuous conic rotation on the border element.
  useGSAP(
    () => {
      if (!borderRef.current) return;
      gsap.to(borderRef.current, {
        "--angle": "360deg",
        duration: 6,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: ref }
  );

  // Rotate active suggestion every 3.2s (interval in useEffect for clean teardown).
  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % dict.ai.suggestions.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [dict.ai.suggestions.length]);

  // Fade-swap the header text when `active` changes.
  useGSAP(
    () => {
      if (!headerRef.current) return;
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    },
    { scope: ref, dependencies: [active] }
  );

  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div ref={ref} className="relative rounded-[var(--radius-card)]">
          <div
            ref={borderRef}
            aria-hidden
            className="absolute inset-0 rounded-[var(--radius-card)]"
            style={
              {
                ["--angle" as string]: "0deg",
                padding: "1.5px",
                background:
                  "conic-gradient(from var(--angle), var(--color-accent), var(--color-violet), var(--color-cyan), var(--color-accent))",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              } as React.CSSProperties
            }
          />
          <div className="relative rounded-[var(--radius-card)] bg-bg-elev p-8">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-ink-dim">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
              <span ref={headerRef}>{dict.ai.suggestions[active]}</span>
            </div>
            <h3 className="mt-4 font-display text-3xl">{dict.ai.title}</h3>
            <div className="mt-6 flex items-center gap-3 rounded-full border border-line bg-bg px-5 py-3">
              <input
                type="text"
                placeholder={dict.ai.placeholder}
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
              />
              <button className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-bg">
                Ask →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Add the CSS custom property registration to `globals.css` (so `--angle` animates):

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

- [ ] **Step 2: Compose into page**

In `app/[locale]/page.tsx`:

```tsx
import { AIWidget } from "@/components/sections/AIWidget";
// inside <main>:
<Hero dict={dict} />
<AIWidget dict={dict} />
```

- [ ] **Step 3: Verify**

`npm run dev`. Confirm: card with rotating conic-gradient border (gold→violet→cyan), header text fades/swaps every ~3s through suggestions, input row with gold "Ask →" button.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: AI widget with conic glow border and rotating header"
```

---

## Task 11: Ramon section with stylised SVG monogram (Round 1.4)

**Files:**
- Create: `components/sections/Ramon.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Build Ramon section**

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function Ramon({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const shapes = ref.current.querySelectorAll<SVGElement>("[data-shape]");
      gsap.from(shapes, {
        scale: 0.6,
        opacity: 0,
        rotate: -8,
        transformOrigin: "50% 50%",
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
      });

      const text = ref.current.querySelectorAll<HTMLElement>("[data-reveal-child]");
      gsap.from(text, {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
      });
    },
    { scope: ref }
  );

  return (
    <section
      id="work"
      ref={ref}
      className="relative px-6 py-32 border-t border-line"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="relative aspect-square max-w-md">
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-bright)" />
                <stop offset="100%" stopColor="var(--color-accent)" />
              </linearGradient>
            </defs>
            <circle data-shape cx="200" cy="200" r="170" fill="none" stroke="var(--color-line)" strokeWidth="1" />
            <circle data-shape cx="200" cy="200" r="120" fill="none" stroke="var(--color-line)" strokeWidth="1" />
            <rect data-shape x="60" y="60" width="280" height="280" fill="none" stroke="url(#gold)" strokeWidth="2" rx="24" />
            <path
              data-shape
              d="M 130 110 L 130 290 M 130 110 L 230 110 Q 280 110 280 165 Q 280 215 230 215 L 130 215 M 215 215 L 285 290"
              fill="none"
              stroke="url(#gold)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle data-shape cx="320" cy="80" r="6" fill="var(--color-violet)" />
            <circle data-shape cx="90" cy="320" r="4" fill="var(--color-cyan)" />
          </svg>
        </div>

        <div className="space-y-8">
          <div data-reveal-child className="text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {dict.ramon.eyebrow}
          </div>
          <h2 data-reveal-child className="font-display text-4xl md:text-5xl leading-tight">
            {dict.ramon.title}
          </h2>
          <p data-reveal-child className="max-w-lg text-lg text-ink-dim">
            {dict.ramon.body}
          </p>
          <dl data-reveal-child className="grid grid-cols-3 gap-6 border-t border-line pt-8">
            {dict.ramon.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl text-accent">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-ink-dim">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page**

```tsx
import { Ramon } from "@/components/sections/Ramon";
// after AIWidget:
<Ramon dict={dict} />
```

- [ ] **Step 3: Verify**

`npm run dev`. Scroll to section. Confirm: geometric monogram (concentric circles + gold rounded square + stylised "R" letter form + two accent dots) assembles in with stagger; bio text slides up; stats bar visible at bottom of the section.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Ramon section with stylised geometric monogram"
```

---

## Task 12: Events section — YouTube keynote embeds (Round 2.1)

**Files:**
- Create: `components/sections/Events.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Build Events with Reveal-driven entry**

```tsx
"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  if (active) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-[var(--radius-card)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-line"
      aria-label={`Play ${title}`}
    >
      <img
        src={thumb}
        alt=""
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}

export function Events({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement | null>(null);

  return (
    <section
      id="speaking"
      ref={ref}
      className="relative px-6 py-32 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-16 flex items-end justify-between gap-8">
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
                <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                Stage
              </div>
              <h2 className="font-display text-4xl md:text-5xl">{dict.events.title}</h2>
            </div>
            <p className="max-w-sm text-ink-dim">{dict.events.body}</p>
          </div>
        </Reveal>

        <Reveal direction="up" stagger={0.15} className="grid gap-10 md:grid-cols-2">
          {dict.events.items.map((ev) => (
            <article key={ev.id} data-reveal-child className="space-y-4">
              <LiteYouTube id={ev.youtubeId} title={ev.title} />
              <div>
                <h3 className="font-display text-xl">{ev.title}</h3>
                <p className="mt-1 text-sm text-ink-dim">
                  {ev.venue} · {ev.date}
                </p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Allow youtube-nocookie images in next.config**

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
```

(We're using a plain `<img>` for the lite player to avoid LCP gotchas, so this is optional — keep for future.)

- [ ] **Step 3: Compose into page**

```tsx
import { Events } from "@/components/sections/Events";
// after Ramon:
<Events dict={dict} />
```

- [ ] **Step 4: Verify**

`npm run dev`. Scroll to Events. Confirm: two video cards with thumbnails, gold play button hover scales, clicking swaps to autoplaying nocookie iframe. Replace the placeholder youtubeIds (`dQw4w9WgXcQ`) in `lib/i18n/dictionaries/en.ts` with real ones before launch.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: events section with lite youtube embeds"
```

---

## Task 13: Values — full-width emotional strip (Round 2.2)

**Files:**
- Create: `components/sections/Values.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Build Values as horizontal emotional strip**

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function Values({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll<HTMLElement>("[data-value-card]");
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
      });

      const title = ref.current.querySelector<HTMLElement>("[data-values-title]");
      if (title) {
        gsap.from(title, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
      }
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden border-t border-line bg-bg-elev py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent)/8%,transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2
          data-values-title
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-tight"
        >
          {dict.values.title}
        </h2>
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-px bg-line px-6 md:grid-cols-4 md:px-0">
        {dict.values.items.map((v, i) => (
          <div
            key={v.title}
            data-value-card
            className="group relative bg-bg-elev p-10 transition hover:bg-bg"
          >
            <div className="mb-8 font-display text-5xl text-accent/40 transition group-hover:text-accent">
              0{i + 1}
            </div>
            <h3 className="font-display text-2xl">{v.title}</h3>
            <p className="mt-3 text-sm text-ink-dim">{v.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Compose into page**

```tsx
import { Values } from "@/components/sections/Values";
// after Events:
<Values dict={dict} />
```

- [ ] **Step 3: Verify**

`npm run dev`. Scroll. Confirm: title fades in, four full-bleed-feeling panels with large gold numerals stagger up, hover lifts the panel to darker bg and brightens the numeral.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: values emotional strip with numbered panels"
```

---

## Task 14: Hero copy refresh in Ramon's voice (Round 2.3)

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts`

- [ ] **Step 1: Rewrite hero strings**

Replace the `hero` object in `lib/i18n/dictionaries/en.ts`:

```ts
hero: {
  eyebrow: "HumanX",
  headline: ["I", "build", "AI", "that", "gives", "people", "their", "time", "back."],
  sub: "Twenty years shipping production systems taught me one thing: software is only worth building if a human comes out lighter on the other side. That's the only kind of AI I work on.",
  primary: "Watch the keynote",
  secondary: "Read the manifesto",
},
```

(First-person voice; longer headline tests the word-reveal stagger and wraps gracefully because the headline uses `flex-wrap` via inline-block words.)

- [ ] **Step 2: Verify wrap behaviour**

`npm run dev`. Hero headline should wrap to 2–3 lines on desktop and remain readable. If it collides with the eyebrow or sub on mobile, narrow the type clamp in `HeroHeadline.tsx` from `clamp(2.75rem,8vw,7rem)` to `clamp(2.25rem,7.5vw,6rem)`. Re-check.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "copy: rewrite hero in Ramon's first-person voice"
```

---

## Task 15: Mobile responsive polish pass (Round 3.1)

**Files:**
- Modify: `components/layout/Nav.tsx`
- Modify: `components/layout/SummitBar.tsx`
- Modify: `components/sections/Hero.tsx`
- Modify: `components/sections/Ramon.tsx`
- Modify: `components/sections/AIWidget.tsx`
- Modify: `components/sections/Values.tsx`

- [ ] **Step 1: Nav — collapse links on small screens**

In `Nav.tsx`, replace the link group `div`:

```tsx
<div className="hidden items-center gap-8 text-sm md:flex">
  <a href="#work" className="text-ink-dim hover:text-ink">{dict.nav.work}</a>
  <a href="#speaking" className="text-ink-dim hover:text-ink">{dict.nav.speaking}</a>
  <a href="#contact" className="text-ink-dim hover:text-ink">{dict.nav.contact}</a>
  <LangSwitcher current={locale} />
</div>
<div className="md:hidden">
  <LangSwitcher current={locale} />
</div>
```

- [ ] **Step 2: SummitBar — stack on mobile**

In `SummitBar.tsx`, change inner row to:

```tsx
<div className="relative mx-auto flex max-w-6xl flex-col items-start gap-1 px-6 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
```

- [ ] **Step 3: Hero padding + button stack**

In `Hero.tsx`, reduce vertical padding on mobile: `pt-32 pb-40` → `pt-20 pb-24 md:pt-32 md:pb-40`. The CTA row already uses `flex-wrap`, no change needed.

- [ ] **Step 4: Ramon — collapse two-column to stacked**

In `Ramon.tsx` the grid is already `grid-cols-1 md:grid-cols-[1fr_1.2fr]`. Constrain the SVG container on mobile: replace `max-w-md` with `max-w-xs md:max-w-md mx-auto md:mx-0`.

- [ ] **Step 5: AIWidget — tighten padding**

In `AIWidget.tsx`, inner card padding: `p-8` → `p-6 md:p-8`. Input row may wrap: change to `flex-col gap-3 sm:flex-row sm:items-center` on the input wrapper.

- [ ] **Step 6: Values — stack 4 panels into 2x2 then 1 column**

In `Values.tsx`, panel grid: `md:grid-cols-4` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`. The internal hairline `gap-px` will look correct in all configurations.

- [ ] **Step 7: Verify in browser at multiple widths**

`npm run dev`. Use devtools to test at 375px, 768px, 1280px. Confirm: no horizontal scroll, headline wraps cleanly, summit bar stacks at 375, nav collapses to logo + lang switcher, all sections legible.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: mobile responsive polish across all sections"
```

---

## Task 16: ES dictionary + animated EN/ES transition (Round 3.2)

**Files:**
- Create: `lib/i18n/dictionaries/es.ts`
- Modify: `lib/i18n/get-dictionary.ts`
- Modify: `components/layout/LangSwitcher.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Write ES dictionary**

`lib/i18n/dictionaries/es.ts`:

```ts
import type { Dictionary } from "./en";

export const es: Dictionary = {
  nav: { work: "Trabajo", speaking: "Conferencias", contact: "Contacto" },
  summit: {
    label: "En vivo",
    text: "Ramon como ponente principal en HumanX Summit — Madrid, Octubre 2026",
    cta: "Reservar plaza",
  },
  hero: {
    eyebrow: "HumanX",
    headline: ["Construyo", "IA", "que", "devuelve", "el", "tiempo", "a", "las", "personas."],
    sub: "Veinte años desplegando sistemas en producción me enseñaron una cosa: el software solo merece la pena si alguien sale más ligero al otro lado. Esa es la única IA en la que trabajo.",
    primary: "Ver la keynote",
    secondary: "Leer el manifiesto",
  },
  ramon: {
    eyebrow: "Quién",
    title: "Ramon — fundador, ponente, constructor.",
    body: "Dos décadas entregando sistemas en producción para banca, telecomunicaciones y sector público. Hoy, Ramon asesora a consejos y escenarios sobre cómo desplegar IA sin perder al equipo que te trajo hasta aquí.",
    stats: [
      { value: "20+", label: "Años construyendo" },
      { value: "40+", label: "Conferencias impartidas" },
      { value: "12", label: "Países en el escenario" },
    ],
  },
  ai: {
    title: "Pregunta al asistente HumanX",
    placeholder: "¿Qué debería saber sobre la keynote de Ramon?",
    suggestions: [
      "Contratar a Ramon para un evento",
      "Resume el manifiesto",
      "Muéstrame la charla de Caixa Bank",
    ],
  },
  events: {
    title: "En escenario",
    body: "Keynotes recientes, completas.",
    items: [
      { id: "ev-caixa", title: "La Capa Humana", venue: "Caixa Bank Forum", date: "Marzo 2026", youtubeId: "dQw4w9WgXcQ" },
      { id: "ev-pacifico", title: "Devolviendo el Tiempo a las Personas", venue: "Pacífico Summit", date: "Noviembre 2025", youtubeId: "dQw4w9WgXcQ" },
    ],
  },
  values: {
    title: "Lo que defiende HumanX",
    items: [
      { title: "Personas primero", body: "Herramientas que amplifican, nunca borran." },
      { title: "Tiempo devuelto", body: "Cada automatización regala una hora." },
      { title: "Lenguaje claro", body: "Si un consejo no lo entiende, no está terminado." },
      { title: "Enviado, no slides", body: "Sistemas en producción o no ocurrió." },
    ],
  },
  footer: { rights: "© 2026 HumanX. Todos los derechos reservados." },
};
```

- [ ] **Step 2: Wire ES loader**

Replace `lib/i18n/get-dictionary.ts`:

```ts
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.en),
  es: () => import("./dictionaries/es").then((m) => m.es),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
```

- [ ] **Step 3: Page-fade animation for locale transitions**

Wrap content in a fade-in keyed by locale in `app/[locale]/layout.tsx`. Create a tiny client wrapper to avoid moving the whole layout client.

`components/motion/LocaleFade.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function LocaleFade({ locale, children }: { locale: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    },
    { scope: ref, dependencies: [locale] }
  );
  return <div ref={ref}>{children}</div>;
}
```

In `app/[locale]/layout.tsx`, wrap children:

```tsx
import { LocaleFade } from "@/components/motion/LocaleFade";
// ...
<SmoothScroll>
  <SummitBar dict={dict} />
  <Nav locale={locale as Locale} dict={dict} />
  <LocaleFade locale={locale}>{children}</LocaleFade>
  <Footer dict={dict} />
</SmoothScroll>
```

- [ ] **Step 4: Animate the LangSwitcher pill**

Replace `LangSwitcher.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { locales, type Locale } from "@/lib/i18n/config";

export function LangSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const stripLocale = pathname.replace(/^\/(en|es)/, "") || "/";
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const active = ref.current.querySelector<HTMLElement>(`[data-locale="${current}"]`);
    const pill = ref.current.querySelector<HTMLElement>("[data-pill]");
    if (!active || !pill) return;
    const r = active.getBoundingClientRect();
    const parentR = ref.current.getBoundingClientRect();
    gsap.to(pill, {
      x: r.left - parentR.left,
      width: r.width,
      duration: 0.45,
      ease: "expo.out",
    });
  }, [current]);

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center gap-1 rounded-full border border-line px-1 py-1 text-xs uppercase tracking-widest"
    >
      <span
        data-pill
        aria-hidden
        className="absolute top-1 bottom-1 left-0 rounded-full bg-ink"
        style={{ width: 0 }}
      />
      {locales.map((loc) => (
        <Link
          key={loc}
          data-locale={loc}
          href={`/${loc}${stripLocale === "/" ? "" : stripLocale}`}
          className={`relative z-10 rounded-full px-3 py-1 transition-colors ${
            loc === current ? "text-bg" : "text-ink-dim hover:text-ink"
          }`}
        >
          {loc}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Verify**

`npm run dev`. Click EN → ES in the nav switcher. Confirm: the white pill slides between EN and ES with an expo ease, all copy swaps to Spanish, the page content fades up briefly. Hero word-reveal re-runs on the new headline.

- [ ] **Step 6: Final production build**

```bash
npm run build
```

Expected: clean build, no type errors, no a11y warnings.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: ES dictionary + animated locale switcher and page fade"
```

---

## Post-plan handoff checklist

Before the user takes the site to a projector:

- Swap placeholder YouTube IDs in `lib/i18n/dictionaries/{en,es}.ts` for real keynote videos.
- Drop `logo.png` (sitting in the parent dir) into `public/` and either reference from `Nav.tsx` or keep the typeset wordmark.
- Replace placeholder stat values in the Ramon section if more accurate numbers exist.
- Run `npm run build && npm run start` and walk every section on a 1080p/4K screen at the actual venue resolution. Animations look different at 4K.
- Test reduced-motion: macOS System Settings → Accessibility → Display → "Reduce motion" — confirm site stays usable.
