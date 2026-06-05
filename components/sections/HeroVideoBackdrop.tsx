"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Hero background video. Serves a lighter, portrait-friendly encode on phones
 * (`mobile.webm`) and the full-bleed landscape encode on desktop
 * (`desktop.webm`). The source is chosen in an effect via `matchMedia`, so each
 * device only ever downloads the single file it needs (and a resize / rotation
 * swaps to the matching clip). A dark scrim sits on top so the white hero copy
 * stays readable over the footage in both themes — slightly heavier on mobile,
 * where the copy is vertically centred over the middle of the frame.
 *
 * The video autoplays on mount (muted + playsInline satisfies autoplay policy)
 * and pauses whenever it scrolls offscreen. Under reduced-motion it never plays
 * — the paused first frame shows beneath the scrim.
 */
export function HeroVideoBackdrop() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);

  // Pick the encode for the current viewport. Runs after mount (never during
  // SSR), so the markup hydrates with no <video> and we only fetch the one
  // file the device actually needs.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const pick = () =>
      setSrc(mq.matches ? "/videos/desktop.webm" : "/videos/mobile.webm");
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

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
  }, [src]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {src ? (
        <video
          ref={ref}
          key={src}
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />
      ) : null}
      {/* Dark scrim: a uniform tint (heavier on mobile so the centred copy
          reads) plus a stronger bottom gradient under the desktop bottom-left
          copy. The hero text is white in both themes, so this same treatment
          works for light and dark. */}
      <div className="absolute inset-0 bg-black/45 lg:bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 lg:via-black/25 lg:to-transparent" />
    </div>
  );
}
