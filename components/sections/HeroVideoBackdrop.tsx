"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Desktop-only hero background: the keynote reel playing muted + looping behind
 * the hero text, with a left-weighted dark scrim so the left-aligned copy stays
 * readable. Hidden on mobile (<lg) entirely — phones get the plain dark hero,
 * so they never download the ~12 MB clip.
 *
 * The video autoplays on mount (muted + playsInline satisfies desktop autoplay
 * policy) and pauses whenever it scrolls offscreen. Under reduced-motion it
 * never plays — the paused first frame shows beneath the scrim.
 */
export function HeroVideoBackdrop() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;

    // Play while visible, pause when scrolled away (saves decode/battery once
    // the hero has faded out of view).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
    >
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      >
        <source src="/videos/keynote.webm" type="video/webm" />
      </video>
      {/* Left-weighted dark scrim — darkest under the text, clearing toward the
          right so the footage still reads. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklch, var(--color-bg) 88%, transparent) 0%, color-mix(in oklch, var(--color-bg) 60%, transparent) 45%, color-mix(in oklch, var(--color-bg) 28%, transparent) 100%)",
        }}
      />
      {/* Faint bottom fade into the page so the hero dissolves into what's next. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/85 to-transparent" />
    </div>
  );
}
