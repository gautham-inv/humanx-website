"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { LangSwitcher } from "./LangSwitcher";
import { ThemeToggle } from "./ThemeToggle";

type NavKey = "about" | "services" | "events" | "insights" | "publications";

const NAV_ITEMS: NavKey[] = ["about", "services", "events", "insights", "publications"];

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
      className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-bg/95 border-b border-line"
    >
      <Link
        href={`/${locale}`}
        aria-label="HumanX home"
        className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Image
          src="/logo.webp"
          alt="HumanX"
          width={140}
          height={40}
          priority
          className="h-8 w-auto"
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
