import type { SVGProps } from "react";

/**
 * Minimalist line icons for the /about page section eyebrows. Stroke-only,
 * 1.25px, currentColor so they pick up whatever text colour the parent has.
 * The same geometric vocabulary as ServiceIcons but tuned smaller (size 22)
 * for the eyebrow context.
 *
 *   Mission     → concentric circles (target / aim)
 *   Values      → 4-pointed compass star (cardinal anchors)
 *   Experience  → ascending horizon wave (time / arc)
 *   Founder     → dot-on-axis (single grounded source)
 */

function Base({
  children,
  size = 22,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function MissionTargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ValuesCompassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 13.2 10.8 21 12 13.2 13.2 12 21 10.8 13.2 3 12 10.8 10.8 Z" />
    </Base>
  );
}

export function ExperienceArcIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 17 Q 8 7, 14 12 T 21 9" />
      <circle cx="3" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="21" cy="9" r="1.4" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function FounderDotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 12 H 21" />
      <circle cx="12" cy="12" r="2.8" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </Base>
  );
}
