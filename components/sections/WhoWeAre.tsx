import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";

type WhoWeAreProps = {
  dict: Dictionary;
  /** Sanity-resolved homepage.whoWeAre slice. Each leaf falls back to dict. */
  content?: HomepageContent["whoWeAre"];
};

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
      <div className="mx-auto max-w-[1300px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          {/* Left column — intro + CTA, sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[1.05] tracking-tight">
              {title}
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
              {lead}
            </p>
          </div>

          {/* Right column — numbered process steps */}
          <div>
            <h3 className="mb-10 font-display text-3xl tracking-tight md:mb-14 md:text-4xl">
              {stepsHeading}
            </h3>
            <ol className="relative">
              {/* Gradient connector running through the numbered chips */}
              <div
                aria-hidden
                className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-accent/50 via-accent/15 to-transparent"
              />
              {items.map((item, idx) => {
                // Step chip rotates colour so the three steps read as
                // distinct moments — orange, violet, magenta.
                const chipColor =
                  ["text-accent", "text-violet", "text-magenta"][idx % 3];
                return (
                <li
                  key={idx}
                  className="relative grid grid-cols-[2.5rem_1fr] items-start gap-6 border-t border-line py-8 first:border-t-0 first:pt-0 md:gap-10 md:py-10"
                >
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elev text-xs font-semibold ${chipColor}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h4 className="font-display text-xl leading-snug text-ink md:text-2xl">
                      {item.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-ink-dim md:text-base">
                      {item.body}
                    </p>
                  </div>
                </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
