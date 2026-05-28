import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent, PartnerItem } from "@/lib/sanity/loaders";

type PartnersTickerProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced partner rows, already resolved at build time. Each row
   * carries the brand name, an optional logo URL, and an optional website.
   * When a logo is uploaded we render the image; when a website is set we
   * wrap the tile in an external anchor. Partners without either still
   * appear, rendered as styled text.
   *
   * When the list is empty (Sanity unreachable, or the dataset has no
   * partner docs yet) we fall back to the dict's string-only list so the
   * ticker never renders blank.
   */
  items?: readonly PartnerItem[];
  /** Section header copy from the homepage singleton. Falls back to dict. */
  content?: HomepageContent["partners"];
};

/** Internal row shape after merging Sanity + dict fallback. */
type TickerRow = {
  key: string;
  name: string;
  website: string;
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
};

export function PartnersTicker({
  dict,
  items: itemsProp,
  content,
}: PartnersTickerProps) {
  const rows: TickerRow[] =
    itemsProp && itemsProp.length > 0
      ? itemsProp.map((p) => ({
          key: p.id,
          name: p.name,
          website: p.website,
          logoUrl: p.logoUrl,
          logoWidth: p.logoWidth,
          logoHeight: p.logoHeight,
        }))
      : dict.partnersTicker.items.map((name, i) => ({
          key: `dict-${i}`,
          name,
          website: "",
          logoUrl: "",
          logoWidth: 0,
          logoHeight: 0,
        }));
  const heading = content?.heading ?? dict.partnersTicker.heading;
  // Duplicate the set so the translate animation loops seamlessly.
  const loop = [...rows, ...rows];

  return (
    <section
      aria-label={heading}
      className="relative overflow-hidden border-y border-line bg-bg py-10 md:py-14 lg:py-18"
    >
      {/* Spectrum brand wash mirrors the section above the footer
          (`GlobalCTA variant="home"`) — orange → violet → magenta diagonal
          at 0.18 opacity, feathered with a bottom-left radial vignette so
          the gradient hands off into the page bg without a hard edge.
          Identical treatment so the partners block reads as part of the
          same conversion-funnel rhythm as the contact CTA. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, var(--color-violet) 55%, var(--color-magenta) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, transparent 30%, var(--color-bg) 75%)",
        }}
      />

      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="ticker-track flex w-max items-center gap-10 md:gap-14 px-8 motion-reduce:animation-none">
          {loop.map((row, i) => {
            // Each logo sits inside an amber tile (`.partner-tile-chip`).
            // - Dark theme: amber bg (`var(--color-accent-bright)`) gives
            //   dark partner logos a luminous card to sit on against the
            //   spectrum gradient backdrop.
            // - Light theme: chip flattens to transparent via the
            //   `:root[data-theme="light"]` override in globals.css —
            //   logos sit directly on the cream page bg, no chip needed.
            const tileClass =
              "partner-tile-chip shrink-0 inline-flex items-center justify-center rounded-2xl px-5 py-3 md:px-6 md:py-4 transition";
            const inner = row.logoUrl ? (
              /* Plain <img> — `next/image` fights the duplicated ticker
               * track's layout calc. The image is small + lazy-loaded so
               * CLS isn't a concern, and `images.unoptimized: true` means
               * next/image wouldn't optimize anyway under static export. */
              <img
                src={row.logoUrl}
                alt={row.name}
                width={row.logoWidth || undefined}
                height={row.logoHeight || undefined}
                loading="lazy"
                decoding="async"
                className="h-12 md:h-16 w-auto"
              />
            ) : (
              // Text fallback uses the dark-ink colour. Reads on amber in
              // dark theme; reads on cream page bg in light theme.
              <span className="font-display text-2xl md:text-3xl tracking-tight text-[#1a1620]">
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
                className={`${tileClass} hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright`}
              >
                {inner}
              </a>
            ) : (
              <div
                key={`${row.key}-${i}`}
                className={tileClass}
                title={row.name}
                aria-label={row.name}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes humanx-ticker {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .ticker-track {
          animation: humanx-ticker 38s linear infinite;
          will-change: transform;
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
