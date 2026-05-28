import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent, PartnerItem } from "@/lib/sanity/loaders";

type PartnersTickerProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced partner rows, already resolved at build time. Each row
   * carries the brand name AND a (possibly empty) logo URL — the ticker
   * renders the logo image when present, falling back to the brand name
   * as styled text so partners without uploaded logos still appear.
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
          logoUrl: p.logoUrl,
          logoWidth: p.logoWidth,
          logoHeight: p.logoHeight,
        }))
      : dict.partnersTicker.items.map((name, i) => ({
          key: `dict-${i}`,
          name,
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
      className="relative border-y border-line bg-bg py-8 md:py-12 lg:py-16"
    >
      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-hidden
      >
        <div className="ticker-track flex w-max items-center gap-16 px-8 motion-reduce:animation-none">
          {loop.map((row, i) => (
            <div
              key={`${row.key}-${i}`}
              className="shrink-0 flex items-center"
              title={row.name}
            >
              {row.logoUrl ? (
                /* `next/image` is intentionally NOT used here — the ticker
                 * duplicates each logo and renders it inside an animating
                 * track, which `next/image`'s layout reservation fights
                 * with. Plain <img> + height cap keeps the loop seamless
                 * and works under `output: "export"` without remote
                 * patterns gymnastics. */
                <img
                  src={row.logoUrl}
                  alt={row.name}
                  width={row.logoWidth || undefined}
                  height={row.logoHeight || undefined}
                  loading="lazy"
                  decoding="async"
                  className="h-10 md:h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
                  // `dark:` variants aren't reliable for arbitrary partner
                  // brand colours; we rely on opacity to soften logos so
                  // the ticker stays legible against both themes.
                />
              ) : (
                <span className="font-display text-2xl md:text-3xl tracking-tight text-ink-dim/90 transition-colors hover:text-ink">
                  {row.name}
                </span>
              )}
            </div>
          ))}
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
