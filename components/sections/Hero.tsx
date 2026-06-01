import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { HomepageContent } from "@/lib/sanity/loaders";
import { HeroHeadline } from "./HeroHeadline";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { HeroImage } from "./HeroImage";

type HeroProps = {
  dict: Dictionary;
  locale: Locale;
  /**
   * Resolved homepage.hero slice from Sanity. Every leaf falls back to the
   * dict equivalent if absent, so the section never renders blank. The
   * headline is pre-parsed (words + emphasis indices) so HeroHeadline's
   * existing array-driven API doesn't have to change.
   */
  content?: HomepageContent["hero"];
};

export function Hero({ dict, locale, content }: HeroProps) {
  const headlineWords = content?.headline?.words ?? dict.hero.headline;
  // Default emphasis = index 1 ("experience" in the original copy). If a
  // Sanity author wrapped different word(s) in <<…>>, those indices win.
  const headlineEmphasis = content?.headline?.emphasis ?? [1];
  const eyebrow = content?.eyebrow ?? dict.hero.eyebrow;
  const clarifier = content?.clarifier ?? dict.hero.clarifier;
  const sub = content?.sub ?? dict.hero.sub;
  const portraitAlt = content?.portraitAlt ?? dict.hero.portraitAlt;
  const primary = content?.primaryCta ?? dict.hero.primary;
  const secondary = content?.secondaryCta ?? dict.hero.secondary;

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-6 pt-6 pb-10 md:pt-10 md:pb-12 lg:pt-8 lg:pb-0">
      {/* Background drifting orbs */}
      <BackgroundOrbs />

      {/* Desktop portrait — fills hero top→bottom. Section sits below the
          sticky nav in the DOM, so inset-y-0 places the image just under
          the nav. HeroImage internally handles the scale + bottom-anchor +
          parallax so the visible crop keeps Ramon's face + torso in frame. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-[42%] xl:w-[46%]">
        <HeroImage fill alt={portraitAlt} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col lg:pb-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Mobile portrait removed — on small screens the hero is text-only;
              the absolute desktop image kicks in at lg+ via the wrapper above. */}

          {/* Text Content Column.
             *
             * Mobile (< lg): text-center because there's no image to balance
             * the left-aligned text — keeps the eyebrow, headline, paragraphs
             * and buttons visually anchored to the column's centre.
             *
             * Desktop (lg+): text-left because the absolute portrait fills
             * the right side of the section, and the two-column read works
             * better with the text starting at the leading edge.
             */}
          <div className="z-10 flex flex-col justify-center text-center lg:text-left lg:col-span-7">
            <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-ink-dim animate-fade-in">
              <span className="h-px w-8 bg-accent" />
              {eyebrow}
            </div>
            {/* Emphasis defaults to index 1 ("experience") for the dict copy;
                Sanity authors can re-target the italic-accent treatment by
                wrapping a different word in <<…>>. */}
            <HeroHeadline words={headlineWords} emphasis={headlineEmphasis} />
            {/* `mx-auto lg:mx-0` centres the max-w-xl block on mobile/tablet
                (where parent is wider than xl) and pins it to the left on
                desktop alongside the portrait. */}
            <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-ink leading-snug animate-fade-in">
              {clarifier}
            </p>
            <p className="mt-3 max-w-xl mx-auto lg:mx-0 text-sm md:text-base text-ink-dim leading-relaxed animate-fade-in">
              {sub}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in">
              <Link
                href={`/${locale}#contact`}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
              >
                {primary}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="rounded-full border border-line px-6 py-3 text-sm text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
