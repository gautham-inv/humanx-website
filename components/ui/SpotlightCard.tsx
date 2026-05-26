"use client";

import {
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Radius of the glow in px. Defaults to 450. */
  radius?: number;
  /** Inner area glow color. */
  glowColor?: string;
  /** Border ring glow color (typically more saturated than glowColor). */
  borderColor?: string;
};

const ringMaskStyle: CSSProperties = {
  padding: "1px",
  WebkitMask:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
};

export function SpotlightCard({
  children,
  className = "",
  radius = 450,
  glowColor = "rgba(201,169,97,0.15)",
  borderColor = "rgba(201,169,97,0.6)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  }

  return (
    <article
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden ${className}`}
    >
      {/* Inner-area glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${glowColor}, transparent 60%)`,
        }}
      />
      {/* Border ring glow — only the section near the cursor lights up */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          ...ringMaskStyle,
          background: `radial-gradient(${radius}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${borderColor}, transparent 60%)`,
        }}
      />
      <div className="relative">{children}</div>
    </article>
  );
}
