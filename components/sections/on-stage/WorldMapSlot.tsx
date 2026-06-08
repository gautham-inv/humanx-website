"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SpeakingPin } from "./WorldMap";

/**
 * Lazy mount for the speaking-locations map.
 *
 * WorldMap pulls in d3-geo + topojson-client + a ~130 KB bundled world-atlas
 * TopoJSON — the single heaviest chunk on /on-stage. The map lives well below
 * the fold, so we defer it twice over: `ssr: false` keeps it out of the static
 * HTML and the initial bundle, and an IntersectionObserver holds the import
 * until the section is about to scroll into view. Visitors who never reach the
 * map never download it; those who do get it just ahead of time.
 *
 * A reserved aspect-ratio box (matching the SVG's 980×480 viewBox) stands in
 * before mount so there's no layout shift when the map swaps in.
 */
const WorldMap = dynamic(
  () => import("./WorldMap").then((m) => m.WorldMap),
  { ssr: false }
);

export function WorldMapSlot({
  pins,
  className,
}: {
  pins: readonly SpeakingPin[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // Start loading a little before the map enters the viewport.
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <WorldMap pins={pins} />
      ) : (
        <div className="aspect-[980/480] w-full" aria-hidden />
      )}
    </div>
  );
}
