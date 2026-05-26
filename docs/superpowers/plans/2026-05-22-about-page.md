# /about Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/about` route under `app/[locale]/about/` with a hero, four narrative sections (Mission, Vision, Experience, Founder), a floating scroll-spy pill nav, and a final CTA — both CTAs open a contact modal containing the existing `HumanForm`. Remove `<About />` and `<Ramon />` from the homepage and delete their source files.

**Architecture:** Server component for the `/about` page. Three small client components in `components/sections/about/`: `AboutModalProvider` (React Context + Modal rendering), `SectionPills` (IntersectionObserver-driven floating nav), and `AboutCTAButton` (context-consuming button). One generic `Modal` primitive in `components/ui/`. The Provider wraps the entire page so both CTAs share modal state.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), React 19, Tailwind, GSAP for entrance animations (already used by Reveal), `next/image`. No test framework is configured in this repo — verification per task is `npx tsc --noEmit`; a `npm run build` smoke runs at the end.

**Spec:** `docs/superpowers/specs/2026-05-22-about-page-design.md` (approved).

---

## File Map

**New:**
- `components/ui/Modal.tsx` — generic accessible modal primitive (portal, focus trap, ESC, scroll lock).
- `components/sections/about/AboutModalProvider.tsx` — client; React Context exposes `openModal()`. Renders the `<Modal>` with `HumanForm` inside.
- `components/sections/about/SectionPills.tsx` — client; floating bottom pills, IntersectionObserver scroll-spy, smooth-scroll on click.
- `components/sections/about/AboutCTAButton.tsx` — client; consumes the modal context, renders a styled button.
- `app/[locale]/about/page.tsx` — server; renders all 6 sections, wraps them in `<AboutModalProvider>`, mounts `<SectionPills>`.

**Edited:**
- `lib/i18n/dictionaries/en.ts` — add `nav.about`, extend `about` block.
- `lib/i18n/dictionaries/es.ts` — same translated.
- `components/layout/Nav.tsx` — add `about` as FIRST item.
- `app/[locale]/page.tsx` — remove `<About />` and `<Ramon />` mounts + imports.

**Deleted:**
- `components/sections/About.tsx`
- `components/sections/Ramon.tsx`

---

## Task 1: Extend dictionaries with `nav.about` and the new `about` keys

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts`
- Modify: `lib/i18n/dictionaries/es.ts`

This is the foundation. Adding unused keys is type-safe; later tasks consume them.

- [ ] **Step 1: Add `about` to the English `nav` block**

In `lib/i18n/dictionaries/en.ts`, change the `nav` object (top of file) to:

```ts
nav: {
  about: "About",
  services: "Services",
  events: "Events",
  insights: "Insights",
  publications: "Publications",
  menu: "Menu",
  close: "Close",
},
```

- [ ] **Step 2: Extend the existing English `about` block**

In `lib/i18n/dictionaries/en.ts`, find the `about: {` block and replace it with:

```ts
about: {
  eyebrow: "About",
  title: "About HumanX Insights",
  missionTitle: "Our Mission",
  missionBody: "To accelerate customer and employee loyalty for purpose-driven companies by designing and implementing a human experience strategy, uniquely tailored from their own mission and purpose.",
  visionTitle: "Our Vision",
  visionBody: "A world where every organisation treats customer and employee experience as a single discipline — measured by the hours returned to people, not the dashboards delivered to leadership.",
  experienceTitle: "Our Experience",
  experienceBody: "Over 30 years of insights and analytics expertise across retail, social media and various industries. Leader in utilizing and synthesizing enormous databases for decision-making, pioneering CX/EX strategies, with proven business results. Storyteller, public speaker, community leader, and mentor.",

  pageEyebrow: "About",
  pageTitle: "Why HumanX exists",
  pageBody: "A practice built around one bet: human experience is the operating principle that makes everything else — AI, CX, EX — actually work.",
  primaryCta: "Start a conversation",

  missionImageAlt: "Ramon in conversation",
  visionIntro: "A world where every organisation treats customer and employee experience as one discipline — measured by the hours returned to people, not the dashboards delivered to leadership.",
  experienceStatValue: "30+",
  experienceStatLabel: "Years of insights & analytics expertise",
  experienceStatNote: "Pioneering loyalty, retail insight-driven narratives, and CX/EX frameworks with proven results.",
  founderEyebrow: "Founder",

  finalCtaTitle: "Want to work together?",
  finalCtaBody: "One inbox. One reply within two working days. Tell us the moment.",

  modalTitle: "Open a conversation",
  modalClose: "Close",

  sectionNav: {
    mission: "Mission",
    vision: "Vision",
    experience: "Experience",
    founder: "Founder",
  },
},
```

- [ ] **Step 3: Apply the same shape to `es.ts`**

In `lib/i18n/dictionaries/es.ts`, update `nav` to:

```ts
nav: {
  about: "Sobre nosotros",
  services: "Servicios",
  events: "Eventos",
  insights: "Insights",
  publications: "Publicaciones",
  menu: "Menú",
  close: "Cerrar",
},
```

Then replace the `about: {` block with:

```ts
about: {
  eyebrow: "Sobre nosotros",
  title: "Sobre HumanX Insights",
  missionTitle: "Nuestra Misión",
  missionBody: "Acelerar la lealtad de clientes y empleados de empresas con propósito, diseñando e implementando una estrategia de experiencia humana adaptada a su misión y propósito.",
  visionTitle: "Nuestra Visión",
  visionBody: "Un mundo donde toda organización trate la experiencia de cliente y empleado como una sola disciplina — medida por las horas devueltas a las personas, no por los dashboards entregados al liderazgo.",
  experienceTitle: "Nuestra Experiencia",
  experienceBody: "Más de 30 años de experiencia en insights y analítica en retail, redes sociales e industrias diversas. Líder en sintetizar grandes bases de datos para la toma de decisiones, pionero en estrategias de CX/EX, con resultados de negocio comprobados. Narrador, conferencista, líder comunitario y mentor.",

  pageEyebrow: "Sobre nosotros",
  pageTitle: "Por qué existe HumanX",
  pageBody: "Una práctica construida sobre una apuesta: la experiencia humana es el principio operativo que hace que todo lo demás — IA, CX, EX — realmente funcione.",
  primaryCta: "Iniciar una conversación",

  missionImageAlt: "Ramon en conversación",
  visionIntro: "Un mundo donde toda organización trate la experiencia de cliente y empleado como una sola disciplina — medida por las horas devueltas a las personas, no por los dashboards entregados al liderazgo.",
  experienceStatValue: "30+",
  experienceStatLabel: "Años de experiencia en insights y analítica",
  experienceStatNote: "Pioneros en narrativas de lealtad e insight retail, y en marcos de CX/EX con resultados comprobados.",
  founderEyebrow: "Fundador",

  finalCtaTitle: "¿Quieres trabajar con nosotros?",
  finalCtaBody: "Una sola bandeja. Una respuesta en dos días laborables. Cuéntanos el momento.",

  modalTitle: "Abrir una conversación",
  modalClose: "Cerrar",

  sectionNav: {
    mission: "Misión",
    vision: "Visión",
    experience: "Experiencia",
    founder: "Fundador",
  },
},
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/es.ts
git commit -m "i18n: add nav.about and extend about dict for /about page"
```

---

## Task 2: Create the generic `Modal` primitive

**Files:**
- Create: `components/ui/Modal.tsx`

A self-contained accessible modal: portal, ESC, backdrop click, focus trap, body scroll lock, ARIA dialog, Tailwind transitions.

- [ ] **Step 0: Investigate existing SmoothScroll wrapper**

Run:
```bash
grep -n "SmoothScroll\|Lenis" components/motion/SmoothScroll.tsx app/[locale]/layout.tsx 2>/dev/null
```

If `SmoothScroll` mounts a Lenis (or similar) instance globally and that instance intercepts `body` overflow, our `document.body.style.overflow = "hidden"` will fight it. If you find an active Lenis/similar instance, replace the scroll-lock effect in Step 1 with `lenis.stop()` / `lenis.start()` (or document the integration point). If `SmoothScroll` is a no-op / not mounted in the layout, the `body.style.overflow` approach is sufficient — proceed to Step 1 unchanged.

- [ ] **Step 1: Write the Modal component**

Create `components/ui/Modal.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Visible title rendered inside the panel header. */
  title: ReactNode;
  /** Accessible label for the close button. */
  closeLabel: string;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, closeLabel, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusables[0] ?? panel).focus();
    }
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Focus trap on Tab
  const onPanelKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    []
  );

  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center px-4 py-6 sm:items-center sm:px-6 motion-safe:animate-[fadeIn_180ms_ease-out_both]"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-bg/80 backdrop-blur-md"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="relative z-[61] w-full max-w-2xl rounded-2xl border border-line bg-bg-elev p-6 shadow-2xl outline-none sm:p-8 motion-safe:animate-[scaleIn_220ms_ease-out_both] max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={titleId.current} className="font-display text-2xl leading-tight text-ink md:text-3xl">
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:bg-bg hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 2: Add the keyframes used by the modal**

Open `app/globals.css`. After the existing `@theme` / token block (or anywhere at the top level, outside `@layer`), append:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
```

(If the keyframes already exist, skip this step.)

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/Modal.tsx app/globals.css
git commit -m "feat(ui): add generic accessible Modal primitive"
```

---

## Task 3: Create `AboutModalProvider`

**Files:**
- Create: `components/sections/about/AboutModalProvider.tsx`

Owns the modal open/close state, exposes `useAboutModal()` for descendants, and mounts the modal with the existing `HumanForm` inside.

- [ ] **Step 1: Write the provider**

Create `components/sections/about/AboutModalProvider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { HumanForm, type FieldConfig } from "@/components/forms/HumanForm";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type AboutModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const AboutModalContext = createContext<AboutModalContextValue | null>(null);

export function useAboutModal(): AboutModalContextValue {
  const ctx = useContext(AboutModalContext);
  if (!ctx) throw new Error("useAboutModal must be used inside <AboutModalProvider>");
  return ctx;
}

export function AboutModalProvider({
  dict,
  children,
}: {
  dict: Dictionary;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  const fields: readonly FieldConfig[] = [
    { kind: "text", id: "name", label: dict.forms.name, required: true, autoComplete: "name" },
    { kind: "email", id: "email", label: dict.forms.email, required: true, autoComplete: "email" },
    {
      kind: "select",
      id: "topic",
      label: dict.cta.topicLabel,
      required: true,
      options: dict.cta.topicOptions,
    },
    {
      kind: "textarea",
      id: "message",
      label: dict.cta.messageLabel,
      placeholder: dict.cta.messagePlaceholder,
      required: true,
      rows: 4,
    },
  ];

  return (
    <AboutModalContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={close}
        title={dict.about.modalTitle}
        closeLabel={dict.about.modalClose}
      >
        <HumanForm dict={dict} title="" fields={fields} submitLabel={dict.cta.submit} />
      </Modal>
    </AboutModalContext.Provider>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/about/AboutModalProvider.tsx
git commit -m "feat(about): add AboutModalProvider with HumanForm modal"
```

---

## Task 4: Create `SectionPills`

**Files:**
- Create: `components/sections/about/SectionPills.tsx`

Floating bottom pills with `IntersectionObserver` scroll-spy. Hidden while the modal is open.

- [ ] **Step 1: Write the component**

Create `components/sections/about/SectionPills.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useAboutModal } from "./AboutModalProvider";

type Pill = { id: string; label: string };

const SECTION_IDS = ["mission", "vision", "experience", "founder"] as const;
type SectionId = (typeof SECTION_IDS)[number];

export function SectionPills({
  labels,
}: {
  labels: Record<SectionId, string>;
}) {
  const [active, setActive] = useState<SectionId>("mission");
  const { isOpen } = useAboutModal();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;

    const visibleRatios = new Map<SectionId, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          visibleRatios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: { id: SectionId; ratio: number } | null = null;
        for (const id of SECTION_IDS) {
          const ratio = visibleRatios.get(id) ?? 0;
          if (best === null || ratio > best.ratio) {
            best = { id, ratio };
          }
        }
        if (best && best.ratio > 0) setActive(best.id);
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const t of targets) observerRef.current.observe(t);
    return () => observerRef.current?.disconnect();
  }, []);

  const onPillClick = (e: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  };

  const pills: Pill[] = SECTION_IDS.map((id) => ({ id, label: labels[id] }));

  return (
    <nav
      aria-label="About sections"
      aria-hidden={isOpen}
      className={`fixed bottom-6 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-200 ${
        isOpen ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
      }`}
    >
      <ul className="flex max-w-[90vw] items-center gap-1 overflow-x-auto rounded-full border border-line bg-bg/80 px-1.5 py-1.5 backdrop-blur-md shadow-lg">
        {pills.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => onPillClick(e, id)}
                aria-current={isActive ? "true" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive ? "bg-bg-elev text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/about/SectionPills.tsx
git commit -m "feat(about): add floating SectionPills with scroll-spy"
```

---

## Task 5: Create `AboutCTAButton`

**Files:**
- Create: `components/sections/about/AboutCTAButton.tsx`

Small client component the server page can drop into hero and final CTA. Consumes the modal context.

- [ ] **Step 1: Write the button**

Create `components/sections/about/AboutCTAButton.tsx`:

```tsx
"use client";

import { useAboutModal } from "./AboutModalProvider";

type Variant = "primary" | "secondary";

export function AboutCTAButton({
  label,
  variant = "primary",
  className = "",
}: {
  label: string;
  variant?: Variant;
  className?: string;
}) {
  const { open } = useAboutModal();

  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2";
  const styles =
    variant === "primary"
      ? "bg-accent text-bg hover:bg-accent-bright focus-visible:outline-accent-bright"
      : "border border-line text-ink hover:border-ink focus-visible:outline-ink";

  return (
    <button type="button" onClick={open} className={`${base} ${styles} ${className}`}>
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/sections/about/AboutCTAButton.tsx
git commit -m "feat(about): add AboutCTAButton consuming modal context"
```

---

## Task 6: Build the `/about` page

**Files:**
- Create: `app/[locale]/about/page.tsx`

All six sections rendered inline. Server component, statically generated. Wraps everything in `<AboutModalProvider>` and mounts `<SectionPills />`.

- [ ] **Step 1: Write the page**

Create `app/[locale]/about/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { AboutModalProvider } from "@/components/sections/about/AboutModalProvider";
import { AboutCTAButton } from "@/components/sections/about/AboutCTAButton";
import { SectionPills } from "@/components/sections/about/SectionPills";

const SLUG = "about";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About — HumanX",
    alternates: {
      canonical: `/${locale}/${SLUG}`,
      languages: {
        en: `/en/${SLUG}`,
        es: `/es/${SLUG}`,
        "x-default": `/en/${SLUG}`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.about;

  return (
    <AboutModalProvider dict={dict}>
      <main id="main">
        {/* 1. HERO */}
        <section className="relative overflow-hidden px-6 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Reveal direction="up">
                <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
                  <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                  {t.pageEyebrow}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight">
                  {t.pageTitle}
                </h1>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 max-w-xl text-lg text-ink-dim">{t.pageBody}</p>
              </Reveal>
              <Reveal direction="up" delay={0.15}>
                <div className="mt-8">
                  <AboutCTAButton label={t.primaryCta} />
                </div>
              </Reveal>
            </div>
            <Reveal direction="up" delay={0.1}>
              <div className="relative mx-auto aspect-square w-full max-w-md">
                <div className="absolute inset-[8%] rounded-full border border-line" />
                <div className="absolute inset-[20%] rounded-full border border-line" />
                <Image
                  src="/ramon2.png"
                  alt={t.missionImageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, 24rem"
                  className="object-contain object-bottom"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 2. MISSION — image-left / text-right */}
        <section
          id="mission"
          className="relative border-t border-line px-6 py-20 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
            <Reveal direction="up">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line">
                <Image
                  src="/person.webp"
                  alt={t.missionImageAlt}
                  fill
                  sizes="(min-width: 768px) 32rem, 100vw"
                  className="object-cover object-[center_30%]"
                />
              </div>
            </Reveal>
            <div>
              <Reveal direction="up">
                <div className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                  {t.sectionNav.mission}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {t.missionTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed text-ink-dim">
                  {t.missionBody}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3. VISION — intro left, numbered values right */}
        <section
          id="vision"
          className="relative border-t border-line px-6 py-20 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="up">
                <div className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                  {t.sectionNav.vision}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {t.visionTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 text-lg leading-relaxed text-ink-dim">
                  {t.visionIntro}
                </p>
              </Reveal>
            </div>
            <ol className="space-y-6">
              {dict.values.items.map((v, i) => (
                <li key={v.title}>
                  <Reveal direction="up" delay={i * 0.05}>
                    <div className="flex items-start gap-5 rounded-2xl border border-line bg-bg-elev/40 p-6 transition-colors hover:border-accent/60">
                      <div className="shrink-0 font-display text-2xl text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-ink">{v.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                          {v.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. EXPERIENCE — body + 30+ stat callout */}
        <section
          id="experience"
          className="relative border-t border-line px-6 py-20 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl items-start gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
            <div>
              <Reveal direction="up">
                <div className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
                  {t.sectionNav.experience}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {t.experienceTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 text-base leading-relaxed text-ink-dim">
                  {t.experienceBody}
                </p>
              </Reveal>
            </div>
            <Reveal direction="up" delay={0.15}>
              <div className="flex items-center gap-6 rounded-2xl border border-line bg-bg-elev/40 p-8 backdrop-blur-sm">
                <div className="shrink-0 font-display text-5xl font-semibold tracking-tight text-accent md:text-6xl">
                  {t.experienceStatValue}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-ink">
                    {t.experienceStatLabel}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-dim">
                    {t.experienceStatNote}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 5. FOUNDER — ramon2.png + rings/dots */}
        <section
          id="founder"
          className="relative border-t border-line px-6 py-20 md:py-32"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-[1fr_1.2fr]">
            <div className="relative mx-auto aspect-square w-full max-w-xs md:mx-0 md:max-w-md">
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="200" cy="200" r="180" fill="none" stroke="var(--color-line)" strokeWidth="1" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="var(--color-line)" strokeWidth="1" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx="320" cy="70" r="6" fill="var(--color-violet)" />
                <circle cx="90" cy="320" r="4" fill="var(--color-cyan)" />
                <circle cx="60" cy="120" r="3" fill="var(--color-accent)" />
                <circle cx="350" cy="280" r="3" fill="var(--color-accent)" />
                <circle cx="40" cy="220" r="2" fill="var(--color-accent-bright)" />
                <circle cx="360" cy="180" r="2" fill="var(--color-accent-bright)" />
              </svg>
              <div className="absolute inset-0">
                <Image
                  src="/ramon2.png"
                  alt={dict.ramon.title}
                  fill
                  sizes="(min-width: 768px) 28rem, 20rem"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
            <div className="space-y-8">
              <Reveal direction="up">
                <div className="text-xs uppercase tracking-[0.3em] text-ink-dim">
                  <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                  {t.founderEyebrow}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {dict.ramon.title}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="max-w-lg text-lg text-ink-dim">{dict.ramon.body}</p>
              </Reveal>
              <Reveal direction="up" delay={0.15}>
                <dl className="grid grid-cols-3 gap-6 border-t border-line pt-8">
                  {dict.ramon.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="font-display text-3xl text-accent">{s.value}</dt>
                      <dd className="mt-1 text-xs uppercase tracking-widest text-ink-dim">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="relative overflow-hidden border-t border-line px-6 py-24 md:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent)/8%,transparent_60%)]" />
          <div className="mx-auto max-w-4xl text-center">
            <Reveal direction="up">
              <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight">
                {t.finalCtaTitle}
              </h2>
            </Reveal>
            <Reveal direction="up" delay={0.05}>
              <p className="mx-auto mt-6 max-w-xl text-lg text-ink-dim">
                {t.finalCtaBody}
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <div className="mt-10 flex justify-center">
                <AboutCTAButton label={t.primaryCta} />
              </div>
            </Reveal>
          </div>
        </section>

        <SectionPills labels={t.sectionNav} />
      </main>
    </AboutModalProvider>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Smoke the build**

Run: `npm run build`
Expected: build succeeds. Static export emits `/en/about/index.html` and `/es/about/index.html`.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/about/page.tsx
git commit -m "feat(about): add /about page with 6 sections, scroll-spy, modal CTA"
```

---

## Task 7: Add `about` as the first nav item

**Files:**
- Modify: `components/layout/Nav.tsx`

- [ ] **Step 1: Update the NavKey + NAV_ITEMS**

In `components/layout/Nav.tsx`, replace the two existing constants near the top:

```ts
type NavKey = "about" | "services" | "events" | "insights" | "publications";

const NAV_ITEMS: NavKey[] = ["about", "services", "events", "insights", "publications"];
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/Nav.tsx
git commit -m "nav: surface /about as first item"
```

---

## Task 8: Remove `<About />` and `<Ramon />` from homepage; delete source files

**Files:**
- Modify: `app/[locale]/page.tsx`
- Delete: `components/sections/About.tsx`
- Delete: `components/sections/Ramon.tsx`

- [ ] **Step 1: Confirm nothing else imports these two**

Run:
```bash
grep -rn "from \"@/components/sections/About\"\|from \"@/components/sections/Ramon\"" app components lib 2>/dev/null | grep -v "about/AboutModalProvider\|about/SectionPills\|about/AboutCTAButton"
```
Expected: only `app/[locale]/page.tsx` shows up. If anything else does, stop and investigate before deleting.

- [ ] **Step 2: Remove the two mounts and imports from homepage**

In `app/[locale]/page.tsx`, delete these two import lines:

```ts
import { Ramon } from "@/components/sections/Ramon";
import { About } from "@/components/sections/About";
```

And inside the returned JSX, delete these two lines:

```tsx
<About dict={dict} />
<Ramon dict={dict} />
```

- [ ] **Step 3: Delete the orphaned files**

Run:
```bash
rm components/sections/About.tsx components/sections/Ramon.tsx
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Final build smoke**

Run: `npm run build`
Expected: build succeeds. `/about` static pages emitted for both locales, homepage builds without About/Ramon.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/page.tsx components/sections/About.tsx components/sections/Ramon.tsx
git commit -m "feat: remove About + Ramon homepage sections; content now lives at /about"
```

---

## Manual verification (post-implementation)

After Task 8 commits, do a quick browser smoke pass:

1. `npm run dev`, open `http://localhost:3000/en/about`.
2. Hero loads with title, sub, "Start a conversation" button.
3. Scroll: pills nav appears at bottom-center; active pill updates as Mission → Vision → Experience → Founder enter the viewport center.
4. Click each pill: page smooth-scrolls to that section, URL hash updates to `#mission` etc.
5. Click hero "Start a conversation": modal opens centered, body scroll is locked, ESC closes, backdrop click closes, Tab cycles inside the panel, X button closes. Pills nav fades out while modal is open.
6. Submit the form to verify HumanForm's existing behavior is unaffected.
7. Visit `/en/` — confirm About and Ramon sections are no longer there.
8. Click "About" in the top nav — confirm it's the first item and routes to `/en/about`.
9. Repeat on `/es/about` for translations.
10. Deep link `http://localhost:3000/en/about#vision` — page loads scrolled to Vision.
