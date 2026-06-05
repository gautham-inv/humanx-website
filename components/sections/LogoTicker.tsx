import type { PartnerItem } from "@/lib/sanity/loaders";

type LogoTickerProps = {
  /** Visible label above the strip — e.g. "Trusted by" or "Our partners". */
  heading: string;
  /** Accessible section label; defaults to `heading`. */
  ariaLabel?: string;
  /**
   * Already-resolved rows (Sanity clients or partners). Each carries the
   * brand name, an optional logo URL, and an optional website. When a logo is
   * uploaded we render the image; when a website is set we wrap the tile in an
   * external anchor. Entries without either still appear as styled text.
   */
  items?: readonly PartnerItem[];
  /**
   * String-only fallback names used when `items` is empty (Sanity unreachable
   * or no docs yet). When this is empty too, the section renders nothing.
   */
  fallbackNames?: readonly string[];
};

/** Internal row shape after merging Sanity + string fallback. */
type TickerRow = {
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

// Below this many logos we keep a single row — splitting a short list into two
// rows leaves each one too sparse to fill the width and loop seamlessly. The
// 25-brand clients wall comfortably clears this; a short partners strip won't.
const TWO_ROW_THRESHOLD = 12;

// ~3.5s per logo reads as a calm drift; floor at 40s so a short strip isn't
// sluggish. Scaling by count keeps both rows drifting at the same speed even
// when they hold a different number of logos.
const trackDuration = (count: number) => Math.max(40, Math.round(count * 3.5));

/**
 * Looping logo marquee shared by the homepage Clients and Partners strips.
 * Logos sit directly on the page background; theme-appropriate variants come
 * from Sanity (`logo` / `logoLight`), falling back to the brand name as text.
 *
 * With enough logos (see `TWO_ROW_THRESHOLD`) it renders as two rows scrolling
 * in opposite directions — more brands are on screen at once and the
 * counter-motion adds life. Shorter strips stay a single row.
 *
 * Renders nothing when there's neither Sanity data nor a fallback list.
 */
export function LogoTicker({
  heading,
  ariaLabel,
  items: itemsProp,
  fallbackNames = [],
}: LogoTickerProps) {
  const rows: TickerRow[] =
    itemsProp && itemsProp.length > 0
      ? itemsProp.map((p) => ({
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

  const twoRows = rows.length >= TWO_ROW_THRESHOLD;

  return (
    <section
      aria-label={ariaLabel || heading}
      className="relative overflow-hidden border-y border-line bg-bg py-8 md:py-12 lg:py-16"
    >
      <div className="mx-auto mb-8 max-w-6xl px-6 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-ink-dim">
          <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
          {heading}
        </div>
      </div>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {twoRows ? (
          (() => {
            // Split roughly in half; the first (longer-or-equal) row drifts
            // left, the second drifts right.
            const mid = Math.ceil(rows.length / 2);
            return (
              <div className="flex flex-col gap-8 md:gap-12">
                <TickerTrack rows={rows.slice(0, mid)} reverse={false} />
                <TickerTrack rows={rows.slice(mid)} reverse />
              </div>
            );
          })()
        ) : (
          <TickerTrack rows={rows} reverse={false} />
        )}
      </div>

      <style>{`
        @keyframes humanx-ticker {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-track {
          animation: humanx-ticker linear infinite;
          will-change: transform;
        }
        /* Reverse plays the same -50% keyframe backwards, so the row scrolls
           the other way — seamless because the set is duplicated. */
        .ticker-track--reverse {
          animation-direction: reverse;
        }
        .group:hover .ticker-track,
        .group:focus-within .ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

/**
 * A single marquee row. The row set is duplicated so the -50% translate loops
 * seamlessly; `reverse` flips the scroll direction. Duration scales with the
 * logo count so every row drifts at the same pace.
 */
function TickerTrack({
  rows,
  reverse,
}: {
  rows: TickerRow[];
  reverse: boolean;
}) {
  const loop = [...rows, ...rows];
  return (
    <div
      className={`ticker-track flex w-max items-center gap-12 md:gap-16 px-8 motion-reduce:animation-none${
        reverse ? " ticker-track--reverse" : ""
      }`}
      style={{ animationDuration: `${trackDuration(rows.length)}s` }}
    >
      {loop.map((row, i) => {
        const itemClass =
          "shrink-0 inline-flex items-center justify-center transition";
        const inner =
          row.logoUrl || row.logoLightUrl ? (
            <>
              <img
                src={row.logoUrl}
                alt={row.name}
                width={row.logoWidth || undefined}
                height={row.logoHeight || undefined}
                loading="lazy"
                decoding="async"
                className="partner-logo-dark h-10 md:h-12 w-auto"
              />
              <img
                src={row.logoLightUrl}
                alt={row.name}
                width={row.logoLightWidth || undefined}
                height={row.logoLightHeight || undefined}
                loading="lazy"
                decoding="async"
                className="partner-logo-light h-10 md:h-12 w-auto"
              />
            </>
          ) : (
            <span className="font-display text-2xl md:text-3xl tracking-tight text-ink-dim/90 hover:text-ink transition-colors">
              {row.name}
            </span>
          );
        return row.website ? (
          <a
            key={`${row.key}-${i}`}
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            title={row.name}
            aria-label={row.name}
            className={`${itemClass} hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright rounded-sm`}
          >
            {inner}
          </a>
        ) : (
          <div
            key={`${row.key}-${i}`}
            className={itemClass}
            title={row.name}
            aria-label={row.name}
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
