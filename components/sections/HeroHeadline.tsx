"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";

export function HeroHeadline({
  words,
  /**
   * Indices (into `words`) that should render with the editorial-emphasis
   * treatment — italic serif in the accent hue. Mirrors the Litmus7-style
   * one-word standout that lets a long display H1 still have a focal point.
   */
  emphasis = [],
}: {
  words: readonly string[];
  emphasis?: readonly number[];
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const emphasisSet = new Set(emphasis);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) return;
      const spans = ref.current.querySelectorAll<HTMLSpanElement>("[data-word]");
      gsap.set(spans, { yPercent: 110, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(spans, {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.07,
      });
    },
    { scope: ref }
  );

  return (
    <h1
      ref={ref}
      className="font-display text-[clamp(2.25rem,6.2vw,4.75rem)] leading-[0.98] tracking-[-0.02em]"
    >
      {words.map((w, i) => {
        const isEmphasis = emphasisSet.has(i);
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom pb-[0.15em] pr-[0.18em]"
          >
            <span
              data-word
              className={
                isEmphasis
                  ? "inline-block italic text-accent font-highlight"
                  : "inline-block"
              }
              style={isEmphasis ? { fontFamily: "var(--font-highlight)" } : undefined}
            >
              {w}
            </span>
          </span>
        );
      })}
    </h1>
  );
}
