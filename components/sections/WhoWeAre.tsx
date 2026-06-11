import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";

type WhoWeAreProps = {
  dict: Dictionary;
  /** Sanity-resolved homepage.whoWeAre slice. Each leaf falls back to dict. */
  content?: HomepageContent["whoWeAre"];
};

// Each discipline carries the rotating brand hue — orange, violet, magenta —
// so the three read as distinct moments rather than a uniform list.
const HUES = [
  { rule: "bg-accent", numeral: "text-accent" },
  { rule: "bg-violet", numeral: "text-violet" },
  { rule: "bg-magenta", numeral: "text-magenta" },
];

// Descending offsets break the rigid row into a staggered, editorial cascade
// on desktop; they collapse to a clean single column below `md`.
const OFFSETS = ["", "md:mt-14", "md:mt-28"];

export function WhoWeAre({ dict, content }: WhoWeAreProps) {
  const t = dict.whoWeAre;
  if (!t) return null;

  const title = content?.title ?? t.title;
  const lead = content?.lead ?? t.lead;
  const stepsHeading = content?.stepsHeading ?? t.stepsHeading;
  const items =
    content?.items && content.items.length > 0 ? content.items : t.items;

  return (
    <section className="relative border-t border-line px-6 py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Header — asymmetric: headline left, lead settling to the baseline
            on the right. The old "how it works" line becomes the eyebrow. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal direction="up" className="lg:col-span-7">
            <div className="mb-5 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {stepsHeading}
            </div>
            <h2 className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight">
              {title}
            </h2>
          </Reveal>
          <Reveal
            direction="up"
            delay={0.05}
            className="max-w-md text-base leading-relaxed text-ink-dim md:text-lg lg:col-span-5 lg:pb-2"
          >
            <p>{lead}</p>
          </Reveal>
        </div>

        {/* Disciplines — staggered three-up. Large hue numerals, a short hue
            rule, and a descending offset replace the old vertical chip list. */}
        <ol className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-3 md:gap-10 lg:gap-12">
          {items.map((item, idx) => {
            const hue = HUES[idx % 3];
            return (
              <li key={idx} className={OFFSETS[idx % OFFSETS.length]}>
                <Reveal direction="up" delay={Math.min(idx * 0.08, 0.2)}>
                  <span
                    aria-hidden
                    className={`block h-[3px] w-12 ${hue.rule}`}
                  />
                  <div
                    className={`mt-6 font-display text-5xl leading-none md:text-6xl ${hue.numeral}`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-6 font-display text-xl leading-snug text-ink md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
                    {item.body}
                  </p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
