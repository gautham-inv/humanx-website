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
  /** Dark-theme logo URL (empty if none uploaded). */
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  /** Light-theme logo URL. Falls back to `logoUrl` when not uploaded. */
  logoLightUrl: string;
  logoLightWidth: number;
  logoLightHeight: number;
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
          // Fall back to the dark logo when no light variant was uploaded
          // — partners with only one logo then show the same image in both
          // themes, which is the safer default than rendering nothing.
          logoLightUrl: p.logoLightUrl || p.logoUrl,
          logoLightWidth: p.logoLightWidth || p.logoWidth,
          logoLightHeight: p.logoLightHeight || p.logoHeight,
        }))
      : dict.partnersTicker.items.map((name, i) => ({
          key: `dict-${i}`,
          name,
          website: "",
          logoUrl: "",
          logoWidth: 0,
          logoHeight: 0,
          logoLightUrl: "",
          logoLightWidth: 0,
          logoLightHeight: 0,
        }));
  const heading = content?.heading ?? dict.partnersTicker.heading;
  // Duplicate the set so the translate animation loops seamlessly.
  const loop = [...rows, ...rows];

  return (
    <section
      aria-label={heading}
      // Bare strip — inherits the normal page bg (`bg-bg`) so it blends
      // with the sections above and below in both themes. Visibility for
      // dark logos is handled per-partner via the `logoLight` Sanity
      // field: authors upload a dark variant for the dark theme and a
      // light variant for the cream-bg light theme. Falls back to the
      // single uploaded logo when only one variant exists.
      className="relative overflow-hidden border-y border-line bg-bg py-8 md:py-12 lg:py-16"
    >
      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="ticker-track flex w-max items-center gap-12 md:gap-16 px-8 motion-reduce:animation-none">
          {loop.map((row, i) => {
            // No tile chips — logos sit directly on the page bg in both
            // themes, with theme-appropriate variants supplied by Sanity.
            const itemClass =
              "shrink-0 inline-flex items-center justify-center transition";
            const inner = row.logoUrl || row.logoLightUrl ? (
              /* Both <img> tags render in DOM; CSS `display` swap (in
               * globals.css under `.partner-logo-light` / `.partner-logo-dark`)
               * picks whichever matches `[data-theme]`. Plain <img>
               * rather than `next/image` — `next/image` fights the
               * duplicated ticker track's layout calc, and we have
               * `images.unoptimized: true` (static export) so there's
               * nothing to gain from the wrapper. */
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
              // Text fallback — uses the ink token so it reads in both
              // themes (light text on dark bg, dark text on cream bg).
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
