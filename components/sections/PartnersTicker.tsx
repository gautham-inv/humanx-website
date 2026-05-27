import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";

type PartnersTickerProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced partner names, already resolved at build time. When the
   * list is empty (Sanity unreachable, or the dataset has no partner docs
   * yet) we fall back to dict so the ticker never renders blank.
   */
  items?: readonly string[];
  /** Section header copy from the homepage singleton. Falls back to dict. */
  content?: HomepageContent["partners"];
};

export function PartnersTicker({
  dict,
  items: itemsProp,
  content,
}: PartnersTickerProps) {
  const items =
    itemsProp && itemsProp.length > 0 ? itemsProp : dict.partnersTicker.items;
  const heading = content?.heading ?? dict.partnersTicker.heading;
  // Duplicate the set so the translate animation loops seamlessly.
  const loop = [...items, ...items];

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
          {loop.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 font-display text-2xl md:text-3xl tracking-tight text-ink-dim/90 transition-colors hover:text-ink"
            >
              {name}
            </span>
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
