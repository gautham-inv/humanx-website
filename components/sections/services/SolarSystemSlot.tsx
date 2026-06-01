"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Desktop-only mount for the Services hero WebGL scene.
 *
 * The scene pulls in three.js + @react-three/fiber — the heaviest chunk on the
 * page. CSS `hidden lg:block` only stops it from *painting* on mobile; the JS
 * still downloads, parses, and executes. Gating the dynamic import behind a
 * media query means phones never request that chunk at all (real LCP/TBT/INP
 * win), while the import is code-split out of the initial bundle on desktop
 * too. `ssr: false` because the scene is browser-only (WebGL + matchMedia).
 */
const ServicesHeroSolarSystem = dynamic(
  () =>
    import("./ServicesHeroSolarSystem").then(
      (m) => m.ServicesHeroSolarSystem
    ),
  { ssr: false }
);

export function SolarSystemSlot({ className }: { className?: string }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isDesktop) return null;
  return <ServicesHeroSolarSystem className={className} />;
}
