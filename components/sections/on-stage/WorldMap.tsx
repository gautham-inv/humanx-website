"use client";

import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import worldTopo from "world-atlas/countries-110m.json";

export type SpeakingPin = {
  city: string;
  lng: number;
  lat: number;
  /** Number of engagements at this location — surfaced in the aria-label. */
  talks?: number;
};

// Fixed drawing surface; the SVG scales fluidly via viewBox.
const WIDTH = 980;
const HEIGHT = 480;

/**
 * Interactive speaking-locations map. Uses d3-geo's Natural Earth projection
 * over a bundled world-atlas TopoJSON (no runtime fetch — works under the
 * site's static export). Country shapes are drawn as faint, theme-aware
 * landmasses; each speaking city is a glowing accent pin with a radar pulse
 * and a hover/focus tooltip. Geometry is derived once via useMemo.
 */
export function WorldMap({
  pins,
  className,
}: {
  pins: readonly SpeakingPin[];
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const { paths, project } = useMemo(() => {
    const topology = worldTopo as unknown as Topology;
    const fc = feature(
      topology,
      topology.objects.countries as GeometryCollection
    ) as FeatureCollection<Geometry, GeoJsonProperties>;
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], fc);
    const path = geoPath(projection);
    return {
      paths: fc.features.map((f) => path(f) ?? ""),
      project: (lng: number, lat: number) => projection([lng, lat]),
    };
  }, []);

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="World map of Ramon's speaking locations"
        className="h-auto w-full"
      >
        {/* Landmasses — faint, theme-aware (ink + line tokens flip per theme). */}
        <g className="fill-ink/5 stroke-line" strokeWidth={0.5}>
          {paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Pins */}
        {pins.map((p, i) => {
          const xy = project(p.lng, p.lat);
          if (!xy) return null;
          const [x, y] = xy;
          const isActive = active === i;
          return (
            <g
              key={p.city}
              transform={`translate(${x}, ${y})`}
              tabIndex={0}
              role="button"
              aria-label={
                p.talks
                  ? `${p.city} — ${p.talks} engagement${p.talks > 1 ? "s" : ""}`
                  : p.city
              }
              className="cursor-pointer outline-none"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() =>
                setActive((cur) => (cur === i ? null : cur))
              }
              onFocus={() => setActive(i)}
              onBlur={() => setActive((cur) => (cur === i ? null : cur))}
            >
              {/* Radar pulse — staggered so the map breathes asynchronously. */}
              <circle
                r={4}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={1.25}
                opacity={0.55}
              >
                <animate
                  attributeName="r"
                  values="4;16"
                  dur="2.6s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.55;0"
                  dur="2.6s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Hover halo */}
              <circle
                r={isActive ? 12 : 0}
                fill="var(--color-accent)"
                opacity={0.18}
                className="transition-all duration-300"
              />
              {/* Dot */}
              <circle
                r={isActive ? 5 : 3.5}
                fill="var(--color-accent)"
                stroke="var(--color-bg)"
                strokeWidth={1}
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* Tooltip for the active pin — drawn last so it sits on top. */}
        {active !== null &&
          (() => {
            const p = pins[active];
            const xy = project(p.lng, p.lat);
            if (!xy) return null;
            const [x, y] = xy;
            const w = Math.max(p.city.length * 7 + 22, 64);
            return (
              <g transform={`translate(${x}, ${y})`} style={{ pointerEvents: "none" }}>
                <g transform={`translate(${-w / 2}, -40)`}>
                  <rect width={w} height={24} rx={6} fill="var(--color-ink)" />
                  <text
                    x={w / 2}
                    y={16}
                    textAnchor="middle"
                    fontSize={12}
                    fill="var(--color-bg)"
                    className="font-display"
                  >
                    {p.city}
                  </text>
                </g>
              </g>
            );
          })()}
      </svg>
    </figure>
  );
}
