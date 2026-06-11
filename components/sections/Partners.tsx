import type { PartnerItem } from "@/lib/sanity/loaders";
import { LogoMark } from "@/components/sections/LogoMark";

type PartnersProps = {
  /** Visible label above the cluster — e.g. "Our partners". */
  heading: string;
  /** Accessible section label; defaults to `heading`. */
  ariaLabel?: string;
  /**
   * Already-resolved partner rows from Sanity. Each carries the brand name, an
   * optional theme-aware logo, and an optional website. Entries without a logo
   * fall back to the brand name as styled text.
   */
  items?: readonly PartnerItem[];
  /** String-only fallback names used when `items` is empty. */
  fallbackNames?: readonly string[];
};

/** Internal row shape after merging Sanity + string fallback. */
type PartnerRow = {
  key: string;
  name: string;
  website: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  logoLightUrl: string;
  logoLightWidth: number;
  logoLightHeight: number;
};

/**
 * Static partners cluster. Replaces the looping ticker for the short partners
 * list — a centered, distributed flex-wrap of theme-aware logos reads as a
 * deliberate "in good company" wall rather than scrolling filler. The clients
 * strip above the fold keeps the marquee (a longer list earns the motion).
 *
 * Logos sit muted at rest and lift to full opacity on hover; entries without a
 * logo render as the brand name in the display face. Renders nothing when
 * there's neither Sanity data nor a fallback list.
 */
export function Partners({
  heading,
  ariaLabel,
  items,
  fallbackNames = [],
}: PartnersProps) {
  const rows: PartnerRow[] =
    items && items.length > 0
      ? items.map((p) => ({
          key: p.id,
          name: p.name,
          website: p.website,
          logoUrl: p.logoUrl,
          logoWidth: p.logoWidth,
          logoHeight: p.logoHeight,
          // Fall back to the dark logo when no light variant was uploaded.
          logoLightUrl: p.logoLightUrl || p.logoUrl,
          logoLightWidth: p.logoLightWidth || p.logoWidth,
          logoLightHeight: p.logoLightHeight || p.logoHeight,
        }))
      : fallbackNames.map((name, i) => ({
          key: `fallback-${i}`,
          name,
          website: "",
          logoUrl: "",
          logoWidth: 0,
          logoHeight: 0,
          logoLightUrl: "",
          logoLightWidth: 0,
          logoLightHeight: 0,
        }));

  // Nothing to show — don't render an empty strip.
  if (rows.length === 0) return null;

  return (
    <section
      aria-label={ariaLabel || heading}
      className="relative overflow-hidden border-y border-line bg-bg py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center text-xs uppercase tracking-[0.3em] text-ink-dim md:mb-12">
          <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
          {heading}
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-16 md:gap-y-12">
          {rows.map((row) => {
            const inner =
              row.logoUrl || row.logoLightUrl ? (
                <LogoMark
                  name={row.name}
                  logoUrl={row.logoUrl}
                  logoWidth={row.logoWidth}
                  logoHeight={row.logoHeight}
                  logoLightUrl={row.logoLightUrl}
                  logoLightWidth={row.logoLightWidth}
                  logoLightHeight={row.logoLightHeight}
                />
              ) : (
                <span className="font-display text-2xl tracking-tight text-ink-dim/90 md:text-3xl">
                  {row.name}
                </span>
              );

            return (
              <li
                key={row.key}
                className="opacity-80 transition duration-300 hover:opacity-100"
              >
                {row.website ? (
                  <a
                    href={row.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={row.name}
                    aria-label={row.name}
                    className="inline-flex items-center justify-center rounded-sm transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    className="inline-flex items-center justify-center"
                    title={row.name}
                    aria-label={row.name}
                  >
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
