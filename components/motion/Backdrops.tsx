/**
 * Backdrops
 * ---------
 * Two reusable background-treatment primitives that any section can drop in
 * to gain identity without inventing a one-off treatment:
 *
 *   <BackdropDrench variant="warm" />
 *     A diagonal brand-gradient wash. "warm" = orange→magenta, "cool" =
 *     violet→cyan→accent, "spectrum" = orange→violet→magenta. All sit at
 *     low opacity behind content and feather into the page background via a
 *     radial vignette so the edges of the section never read as harsh.
 *
 *   <BackdropGrid />
 *     A subtle line-grid pattern (think editorial dot/grid graph paper) that
 *     adds texture without distracting. Lines pick up --color-line-strong so
 *     they flip with the theme; the centre fades to transparent via a radial
 *     mask so the section's content always sits on quiet ground.
 *
 * Both are decorative: aria-hidden, pointer-events-none, absolute-positioned.
 * Mount them as the first child of a `relative` section.
 */

import type { CSSProperties } from "react";
import { useId } from "react";

type DrenchVariant = "warm" | "cool" | "spectrum";

const GRADIENTS: Record<DrenchVariant, string> = {
  warm: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-magenta) 100%)",
  cool: "linear-gradient(135deg, var(--color-violet) 0%, var(--color-magenta) 55%, var(--color-accent) 100%)",
  spectrum:
    "linear-gradient(135deg, var(--color-accent) 0%, var(--color-violet) 55%, var(--color-magenta) 100%)",
};

export function BackdropDrench({
  variant = "spectrum",
  opacity = 0.18,
  feather = "bottom-left",
}: {
  variant?: DrenchVariant;
  /** Strength of the colour wash, 0..1. */
  opacity?: number;
  /** Where the radial vignette anchors so the gradient fades into the page bg. */
  feather?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}) {
  const featherOrigin: Record<typeof feather, string> = {
    "top-left": "0% 0%",
    "top-right": "100% 0%",
    "bottom-left": "0% 100%",
    "bottom-right": "100% 100%",
    center: "50% 50%",
  };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: GRADIENTS[variant],
          opacity,
        }}
      />
      {/* Vignette: feathers the gradient into the page background so the
          section's borders never feel like hard cuts. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at ${featherOrigin[feather]}, transparent 30%, var(--color-bg) 80%)`,
        }}
      />
    </>
  );
}

/**
 * Resch-style square-lattice tessellation. Each tile is a unit square with
 * both diagonals drawn, so when the pattern tiles, eight triangular facets
 * meet at every grid vertex — the classic Ron Resch origami grid that reads
 * as a parametric architectural mesh.
 *
 * Implementation: one SVG `<pattern>` element, four square edges + two
 * diagonals in a single `<path>` for minimal DOM. The pattern tile is
 * `cell × cell` user-space units; the outer `<rect>` then tiles it across
 * the section so the mesh is genuinely seamless at any container size.
 *
 *   - `cell`        — tile size in px. Smaller = denser.
 *   - `opacity`     — overall pattern opacity (0..1).
 *   - `strokeWidth` — line width in px (we set vectorEffect="non-scaling-stroke").
 *   - `fade`        — how the mesh disappears at the edges of its container.
 *   - `feather`     — radial-fade origin when fade === "radial".
 */
export function BackdropMesh({
  cell = 26,
  opacity = 0.09,
  strokeWidth = 0.6,
  fade = "radial",
  feather = "center",
}: {
  cell?: number;
  opacity?: number;
  strokeWidth?: number;
  fade?: "radial" | "linear-y" | "none";
  feather?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const patternId = useId();
  const featherOrigin: Record<NonNullable<typeof feather>, string> = {
    center: "50% 50%",
    "top-left": "0% 0%",
    "top-right": "100% 0%",
    "bottom-left": "0% 100%",
    "bottom-right": "100% 100%",
  };
  const maskImage =
    fade === "radial"
      ? `radial-gradient(ellipse at ${featherOrigin[feather]}, black 30%, transparent 85%)`
      : fade === "linear-y"
      ? "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)"
      : undefined;

  // Single path for the unit tile:
  //   - The L-shape "M0 0 H{cell} V{cell}" + drawing back to origin gives all
  //     four square edges (paired with neighbouring tiles, double-strokes
  //     collapse to one visible line).
  //   - Two diagonals: "\" from (0,0) to (cell,cell), "/" from (cell,0) to (0,cell).
  const tilePath = [
    `M 0 0 H ${cell} V ${cell} H 0 Z`,
    `M 0 0 L ${cell} ${cell}`,
    `M ${cell} 0 L 0 ${cell}`,
  ].join(" ");

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        opacity,
        maskImage,
        WebkitMaskImage: maskImage,
      }}
    >
      <svg className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern
            id={patternId}
            width={cell}
            height={cell}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={tilePath}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

export function BackdropGrid({
  size = 56,
  opacity = 0.08,
  fade = "radial",
  style,
}: {
  /** Cell size in pixels. */
  size?: number;
  /** Overall grid opacity, 0..1. */
  opacity?: number;
  /** How the grid disappears at the edges. */
  fade?: "radial" | "linear-y" | "none";
  style?: CSSProperties;
}) {
  const maskImage =
    fade === "radial"
      ? "radial-gradient(ellipse at center, black 30%, transparent 80%)"
      : fade === "linear-y"
      ? "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)"
      : undefined;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        backgroundImage:
          "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
        opacity,
        maskImage,
        WebkitMaskImage: maskImage,
        ...style,
      }}
    />
  );
}
