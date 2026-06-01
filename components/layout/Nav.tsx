"use client";

import { useEffect, useId, useRef, useState } from "react";
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

const NAV_ITEMS: NavKey[] = [
  "about",
  "services",
  "events",
  "on-stage",
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

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  return (
    <nav
      aria-label="Primary"
      // `py-2` (was `py-4`) compensates for the new SummitBar strip
      // sitting above the nav. Combined SummitBar (~26px) + Nav (~52px)
      // ≈ old standalone Nav height (~76px), so the page below doesn't
      // get pushed down compared to the pre-summit layout.
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-2 backdrop-blur-md bg-bg/95 border-b border-line"
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
        {/* The dark logo file (681×286) carries ~14% more vertical padding
            than the light file (676×250), so at an identical CSS height its
            glyph looks smaller. Bumping the dark variant one size step
            (h-9/h-10 vs h-8/h-9) makes the two read at the same visual size.
            Robust long-term fix: re-export both with matched padding. */}
        <Image
          src="/human-logo-dark.webp"
          alt="HumanX"
          width={180}
          height={52}
          priority
          className="brand-logo-dark h-9 w-auto md:h-10"
        />
        <Image
          src="/logo.webp"
          alt="HumanX"
          width={180}
          height={52}
          priority
          className="brand-logo-light h-8 w-auto md:h-9"
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
