import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";
import { BackdropMesh } from "@/components/motion/Backdrops";

/**
 * Row shape after the page component has picked a locale from the Sanity
 * localized fields. Matches the legacy `dict.testimonials.items` rows so the
 * markup doesn't care where the data came from.
 */
export type TestimonialItem = {
  id: string;
  quote: string;
  author: string;
  org?: string;
  /** Sanity CDN URL of the author headshot. Empty / undefined → no avatar. */
  imageUrl?: string;
  imageAlt?: string;
  /** LinkedIn profile URL. When set, the author block becomes a link. */
  linkedinUrl?: string;
};

type TestimonialsProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced items (already localized). Falls back to dict items when
   * empty so the section never renders blank.
   */
  items?: TestimonialItem[];
  /** Section header copy from the homepage singleton; dict fallback per field. */
  content?: HomepageContent["testimonials"];
};

/**
 * Static masonry wall of testimonials. Replaced the auto-advancing carousel
 * because a single visible quote buries the rest of the social proof — and
 * with names like Paco Underhill on the list, every quote earns its place on
 * screen. CSS multi-column layout (`columns-*` + `break-inside-avoid`) packs
 * the varying-height cards into a true masonry flow with no JS.
 */
export function Testimonials({ dict, items: itemsProp, content }: TestimonialsProps) {
  const items: readonly TestimonialItem[] =
    itemsProp && itemsProp.length > 0 ? itemsProp : dict.testimonials.items;
  const eyebrow = content?.eyebrow ?? dict.testimonials.eyebrow;
  const heading = content?.heading ?? dict.testimonials.heading;

  // Cap the column count at the number of items so a short list never leaves a
  // trailing column empty (e.g. 2 quotes under `lg:grid-cols-3` left col 3 blank).
  const columnsClass =
    items.length <= 1
      ? "grid-cols-1"
      : items.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      aria-label={heading}
      className="relative overflow-hidden border-t border-line px-6 py-16 md:py-24 lg:py-28"
    >
      <BackdropMesh
        cell={30}
        opacity={0.1}
        strokeWidth={0.55}
        fade="radial"
        feather="center"
      />
      <div className="relative mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {eyebrow}
          </div>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2 className="max-w-2xl font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            {heading}
          </h2>
        </Reveal>

        {/* Grid of cards. Each card fills its grid cell, so cards in the same
            row share a height (tallest in the row wins) while rows size to
            their own content — full quotes stay visible, never truncated. The
            attribution pins to the bottom of each card via `mt-auto`. */}
        <div className={`mt-12 grid gap-6 ${columnsClass}`}>
          {items.map((item, i) => {
            const attribution = (
              <>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt || item.author}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 flex-shrink-0 rounded-full object-cover border border-line"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="text-base font-medium text-ink group-hover:text-accent transition-colors md:text-lg">
                    {item.author}
                  </div>
                  {item.org ? (
                    <div className="text-sm text-ink-dim/80 leading-snug">
                      {item.org}
                    </div>
                  ) : null}
                </div>
              </>
            );
            return (
              <div key={item.id} className="h-full">
                <Reveal direction="up" delay={Math.min(i * 0.04, 0.25)} className="h-full">
                  <figure className="flex h-full flex-col rounded-2xl border border-line bg-bg-elev/30 p-6 backdrop-blur-sm transition hover:border-accent/50">
                    <span
                      aria-hidden
                      className="block font-serif text-4xl leading-[0.6] text-accent/40 select-none"
                    >
                      &ldquo;
                    </span>
                    <blockquote className="mt-3 font-serif text-base leading-relaxed text-ink md:text-lg">
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-auto border-t border-line/70 pt-4 text-sm text-ink-dim">
                      {item.linkedinUrl ? (
                        <a
                          href={item.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.author} on LinkedIn`}
                          className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                        >
                          {attribution}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3">{attribution}</div>
                      )}
                    </figcaption>
                  </figure>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
