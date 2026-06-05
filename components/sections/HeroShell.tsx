"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * The homepage hero <section>, rendered as a client component so it can fade
 * itself out on scroll. As the hero scrolls above the viewport top, a scrubbed
 * GSAP tween drives its opacity 1 → 0 (and a slight upward drift) — so moving
 * from the hero into the next section reads as a crossfade rather than a hard
 * cut. No-op under reduced motion (the hero just scrolls away normally).
 * Synced to Lenis via the global ScrollTrigger.update wiring in SmoothScroll.
 */
export function HeroShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      gsap.to(ref.current, {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
