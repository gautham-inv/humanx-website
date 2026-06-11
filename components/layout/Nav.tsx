"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type NavKey =
  | "about"
  | "services"
  | "events"
  | "on-stage"
  | "insights"
  | "publications";

// Order reflects the intended hierarchy: lead with who/what, then the thought
// leadership (insights), the speaking platform (on-stage), the dated calendar
// (events), and finally publications. On-stage sits before events because it's
// the broader speaking/consulting story; events is the dated subset.
const NAV_ITEMS: NavKey[] = [
  "about",
  "services",
  "on-stage",
  "events",
  "insights",
  "publications",
];

function isActive(pathname: string, locale: Locale, key: NavKey): boolean {
  return pathname === `/${locale}/${key}` || pathname.startsWith(`/${locale}/${key}/`);
}

export function Nav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // The homepage is the only page with a full-bleed hero behind the sticky
  // nav, so it's the only place that gets the transparent-over-hero treatment.
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  // Start transparent on the homepage (matches first paint over the hero); the
  // observer below flips it solid once the hero scrolls up past the nav.
  const [overHero, setOverHero] = useState(isHome);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Transparent over the homepage hero; solid once scrolled past it. Only the
  // homepage renders `#hero`, so every other page keeps `overHero` false via
  // the early return. Native IntersectionObserver matches the pattern already
  // used in HeroVideoBackdrop / CountUp.
  useEffect(() => {
    // Only the homepage hero drives transparency; bail on every other page.
    // The early returns leave `overHero` untouched — `transparent` below also
    // gates on `isHome`, so a stale value can never leak onto an inner page.
    if (!isHome) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    const navHeight = navRef.current?.offsetHeight ?? 80;
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      // Shrink the root's top by the nav height so the flip lands exactly as
      // the hero's bottom edge slides under the sticky nav.
      { rootMargin: `-${Math.round(navHeight)}px 0px 0px 0px`, threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome, pathname]);

  // Esc to close + body scroll lock + focus first link on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Transparent only on the homepage, while over the hero, and not while the
  // mobile menu (a solid panel) is open. Gating on `isHome` here means the
  // observer never has to reset `overHero` on navigation.
  const transparent = isHome && overHero && !open;
  // Over the always-dark hero the nav must read light in BOTH themes. Rather
  // than theme-branch every child, re-point the palette tokens to their
  // on-dark values on the nav scope — links, theme toggle and lang switcher
  // all inherit through these CSS vars. (The logo is a display-swap, not
  // token-driven, so it's forced to the dark-bg variant on its <Image>s below.)
  const heroVars = {
    "--color-ink": "#f5f1ec",
    "--color-ink-dim": "rgba(245, 241, 236, 0.78)",
    "--color-line": "rgba(245, 241, 236, 0.28)",
    "--color-bg": "#0c0a16",
  } as CSSProperties;

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      style={transparent ? heroVars : undefined}
      // `py-2` (was `py-4`) compensates for the SummitBar strip above the nav.
      // Over the homepage hero the nav is transparent and fades to the solid
      // frosted style on scroll (see `transparent` / `overHero` above).
      className={`sticky top-0 z-40 flex items-center justify-between px-6 py-2 transition-colors duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-line bg-bg/95 backdrop-blur-md"
      }`}
    >
      <Link
        href={`/${locale}`}
        aria-label="HumanX home"
        // No more cream tile — we now have a dedicated dark-theme logo
        // (`/human-logo-dark.webp`) that reads on the dark indigo nav strip
        // directly. Both variants render in the DOM; CSS `display` swap
        // (see `.brand-logo-dark` / `.brand-logo-light` in globals.css)
        // picks whichever matches `[data-theme]` so a theme flip is
        // instant with no network round-trip.
        className="inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
      >
        {/* The dark logo file (548×211, ratio 2.60) carries more vertical
            padding than the light file (676×250, ratio 2.70), so at an
            identical CSS height its glyph looks smaller. The dark variant runs one size step larger
            (h-12/md:h-16 vs light h-11/md:h-14 — 64px vs 56px on desktop, a
            ~14% bump that matches the padding gap) so the two read alike.
            Robust long-term fix: re-export both with matched padding. */}
        {/* Over the (always-dark) hero we force the dark-bg logo regardless of
            theme; otherwise the usual data-theme display-swap applies. */}
        <Image
          src="/logo-dark.webp"
          alt="HumanX"
          width={548}
          height={211}
          priority
          className={`${transparent ? "inline-block" : "brand-logo-dark"} h-12 w-auto md:h-16`}
        />
        <Image
          src="/logo.webp"
          alt="HumanX"
          width={676}
          height={250}
          priority
          className={`${transparent ? "hidden" : "brand-logo-light"} h-11 w-auto md:h-14`}
        />
      </Link>

      <div className="hidden items-center gap-8 text-sm md:flex">
        {NAV_ITEMS.map((key) => {
          const active = isActive(pathname, locale, key);
          return (
            <Link
              key={key}
              href={`/${locale}/${key}`}
              aria-current={active ? "page" : undefined}
              className={`relative transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-sm ${
                active ? "text-ink" : "text-ink-dim hover:text-ink"
              }`}
            >
              {dict.nav[key]}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                />
              )}
            </Link>
          );
        })}
        <ThemeToggle />
        <LangSwitcher current={locale} />
      </div>

      <div className="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <LangSwitcher current={locale} />
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? dict.nav.close : dict.nav.menu}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <>
          <button
            type="button"
            aria-label={dict.nav.close}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[57px] z-30 bg-bg/60 backdrop-blur-sm md:hidden"
          />
          <div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="fixed inset-x-0 top-[57px] z-40 border-b border-line bg-bg-elev px-6 py-6 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((key) => {
                const active = isActive(pathname, locale, key);
                return (
                  <li key={key}>
                    <Link
                      href={`/${locale}/${key}`}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        active
                          ? "bg-bg text-ink"
                          : "text-ink-dim hover:bg-bg hover:text-ink"
                      }`}
                    >
                      <span>{dict.nav[key]}</span>
                      {active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}
