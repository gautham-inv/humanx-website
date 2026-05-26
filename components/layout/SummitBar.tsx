"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { prefersReducedMotion } from "@/lib/motion";

export function SummitBar({ dict }: { dict: Dictionary }) {
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
            {dict.summit.label}
          </span>
          <span className="text-ink-dim">{dict.summit.text}</span>
        </div>
        <a href="/events#humanx-summit" className="text-ink-dim transition-colors hover:text-ink">
          {dict.summit.cta} →
        </a>
      </div>
    </div>
  );
}
