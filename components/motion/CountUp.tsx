"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  /** Final string to display, including any non-digit suffix ("30+", "35+", "3"). */
  value: string;
  className?: string;
  /** Animation duration in seconds. Defaults to 1.6s, matches Reveal pacing. */
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * Stat counter that animates from 0 up to a numeric target when scrolled into
 * view. Non-digit characters (`+`, `%`, `M`, `k`, etc.) are preserved as the
 * static suffix.
 *
 * SSR-safe: renders the final value statically. On client mount the element
 * is reset to "0{suffix}" only after the IntersectionObserver fires, so there
 * is no flash for users who load the page above the fold.
 *
 * Used only for *data* numbers (years of experience, brand counts, etc.).
 * Never use this for positional list numbering ("01", "02") — those aren't
 * counting, they're labels.
 */
export function CountUp({ value, className, duration = 1.6, style }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  // Split into leading-digits + suffix. "30+" -> ["30", "+"]. "3" -> ["3", ""].
  // If the value doesn't start with digits at all, we render it static.
  const match = value.match(/^([\d,.]+)(.*)$/);
  const target = match ? parseFloat(match[1].replace(/,/g, "")) : NaN;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!match || Number.isNaN(target)) return;
    if (prefersReducedMotion()) return;

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (!entries.some((e) => e.isIntersecting)) return;
        started = true;

        const obj = { n: 0 };
        el.textContent = "0" + suffix;
        gsap.to(obj, {
          n: target,
          duration,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.n) + suffix;
          },
        });
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [match, target, suffix, duration]);

  return (
    <span ref={ref} className={className} style={style} suppressHydrationWarning>
      {value}
    </span>
  );
}
