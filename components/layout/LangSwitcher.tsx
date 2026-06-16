"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { locales, type Locale } from "@/lib/i18n/config";
import { prefersReducedMotion } from "@/lib/motion";

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
    if (prefersReducedMotion()) {
      gsap.set(pill, { x: r.left - parentR.left, width: r.width });
      return;
    }
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
          onClick={() => {
            if (loc !== current) {
              window.gtag?.("event", "select_language", { language: loc, previous_language: current });
            }
          }}
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
