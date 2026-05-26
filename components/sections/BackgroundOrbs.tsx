"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * One committed brand gradient instead of three drifting orbs.
 *
 * The single radial plume mirrors the brand-x wordmark gradient
 * (orange -> magenta diagonal), anchored upper-right behind the
 * portrait so the hero has one asymmetric weight rather than three
 * competing decorative blobs. A second, quieter violet wash sits
 * lower-left as a counterweight.
 */
export function BackgroundOrbs() {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) return;
      const plume = ref.current.querySelector<HTMLDivElement>("[data-plume]");
      const wash = ref.current.querySelector<HTMLDivElement>("[data-wash]");
      if (plume) {
        gsap.to(plume, {
          x: () => gsap.utils.random(-40, 40),
          y: () => gsap.utils.random(-30, 30),
          scale: () => gsap.utils.random(0.95, 1.08),
          duration: 14,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        });
      }
      if (wash) {
        gsap.to(wash, {
          x: () => gsap.utils.random(-30, 30),
          y: () => gsap.utils.random(-20, 20),
          duration: 20,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        });
      }
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      data-orbs
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        data-plume
        className="absolute right-[-12%] top-[-18%] h-[820px] w-[820px] rounded-full opacity-[0.32] [filter:blur(60px)]"
        style={{
          background:
            "conic-gradient(from 220deg at 50% 50%, var(--color-accent) 0deg, var(--color-magenta) 110deg, transparent 220deg, transparent 360deg)",
          mask: "radial-gradient(closest-side, black 30%, transparent 75%)",
          WebkitMask: "radial-gradient(closest-side, black 30%, transparent 75%)",
        }}
      />
      <div
        data-wash
        className="absolute left-[-8%] bottom-[-20%] h-[640px] w-[640px] rounded-full opacity-[0.18] [filter:blur(80px)]"
        style={{
          background:
            "radial-gradient(closest-side, var(--color-violet), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,var(--color-bg)_72%)]" />
    </div>
  );
}
