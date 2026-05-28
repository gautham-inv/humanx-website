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
      // `.partners-band` (globals.css) paints the strip in
      // `--color-accent` for dark theme so the yellow surface lets dark
      // partner logos pop. In light theme that same class flattens to
      // transparent, so the section inherits the cream page bg — no
      // saturated band on cream, which would clash with the rest of the
      // light-theme rhythm.
      className="partners-band relative overflow-hidden border-y border-line py-10 md:py-14 lg:py-18"
    >
      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="ticker-track flex w-max items-center gap-12 md:gap-16 px-8 motion-reduce:animation-none">
          {loop.map((row, i) => {
            // No tile chip anymore — logos sit directly on the yellow band.
            // Dark/colourful logos read against the bright surface; the
            // hover lift gives interactive entries a tactile cue without
            // adding chrome.
            const itemClass =
              "shrink-0 inline-flex items-center justify-center transition";
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
              // Text fallback uses dark ink so it reads against the warm
              // yellow strip regardless of theme.
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
                className={`${itemClass} hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a1620] rounded-sm`}
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
