import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";
import { BackdropMesh } from "@/components/motion/Backdrops";
import { TestimonialCard } from "@/components/sections/TestimonialCard";

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

  // A single quote stays one column; otherwise a staggered two-column wall.
  // `items-start` keeps every card at its own content height, so expanding one
  // card grows only that card — its row-mates never stretch to match.
  const gridClass =
    items.length <= 1
      ? "max-w-2xl grid-cols-1"
      : "grid-cols-1 sm:grid-cols-2 sm:items-start";

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

        {/* Staggered two-column wall (see TestimonialCard). Odd cards drop
            down so the columns read as a brick layout rather than a rigid
            grid; long quotes collapse to an excerpt and swipe the full text in
            on "Read full" — each card grows independently. */}
        <div className={`mt-12 grid gap-x-10 gap-y-12 md:gap-x-16 md:gap-y-14 ${gridClass}`}>
          {items.map((item, i) => (
            <TestimonialCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
