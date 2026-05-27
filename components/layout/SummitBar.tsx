"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { SummitBarContent } from "@/lib/sanity/loaders";
import { prefersReducedMotion } from "@/lib/motion";

type SummitBarProps = {
  dict: Dictionary;
  /**
   * Sanity-resolved summit bar copy. The bar can be toggled off entirely
   * via `enabled: false` in the studio; when absent, dict copy is used.
   */
  content?: SummitBarContent | null;
};

export function SummitBar({ dict, content }: SummitBarProps) {
  // Allow editors to hide the bar without touching code.
  if (content && content.enabled === false) return null;

  const label = content?.label ?? dict.summit.label;
  const text = content?.text ?? dict.summit.text;
  const cta = content?.cta ?? dict.summit.cta;
  const ctaUrl = content?.ctaUrl ?? "/events#humanx-summit";

  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
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
      className="relative z-50 overflow-hidden border-b border-line bg-gradient-to-r from-accent/8 via-violet/5 to-magenta/8"
    >
      <div
        data-sheen
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-1 px-6 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-magenta/60 bg-magenta/15 px-2 py-0.5 text-magenta">
            <span data-live-dot className="block h-1.5 w-1.5 rounded-full bg-magenta" />
            {label}
          </span>
          <span className="text-ink-dim">{text}</span>
        </div>
        <a href={ctaUrl} className="text-ink-dim transition-colors hover:text-ink">
          {cta} →
        </a>
      </div>
    </div>
  );
}
