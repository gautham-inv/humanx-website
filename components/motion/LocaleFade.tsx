"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/motion";

export function LocaleFade({ locale, children }: { locale: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    },
    { scope: ref, dependencies: [locale] }
  );
  return <div ref={ref}>{children}</div>;
}
