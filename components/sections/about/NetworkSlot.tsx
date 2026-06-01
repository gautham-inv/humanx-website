"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Desktop-only mount for the About hero WebGL network scene. See
 * SolarSystemSlot for the full rationale: gating the dynamic import behind a
 * min-width media query keeps three.js + @react-three/fiber off mobile
 * entirely instead of merely hiding the painted canvas. `ssr: false` because
 * the scene needs the browser (WebGL + matchMedia).
 */
const AboutHeroNetwork = dynamic(
  () => import("./AboutHeroNetwork").then((m) => m.AboutHeroNetwork),
  { ssr: false }
);

export function NetworkSlot({ className }: { className?: string }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isDesktop) return null;
  return <AboutHeroNetwork className={className} />;
}
