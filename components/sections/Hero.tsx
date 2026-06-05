import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { HomepageContent } from "@/lib/sanity/loaders";
import { HeroHeadline } from "./HeroHeadline";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { HeroShell } from "./HeroShell";
import { HeroVideoBackdrop } from "./HeroVideoBackdrop";

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
  const primary = content?.primaryCta ?? dict.hero.primary;
  const secondary = content?.secondaryCta ?? dict.hero.secondary;

  return (
    <HeroShell className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden px-6 pt-6 pb-10 md:pt-10 md:pb-12 lg:justify-end lg:pt-8 lg:pb-28">
      {/* Background drifting orbs (mobile, and behind the desktop video). */}
      <BackgroundOrbs />

      {/* Desktop background video + dark scrim. Replaces the old right-side
          portrait, which now lives in the OnStageTeaser section below. Hidden
          on mobile — phones get the plain dark hero. */}
      <HeroVideoBackdrop />

      <div className="relative z-10 flex w-full flex-col">
        {/* Hero copy. The keynote video now runs full-bleed behind a dark
            overlay on every breakpoint, so the copy is rendered white in BOTH
            themes. On desktop (lg+) it's anchored bottom-left (HeroShell's
            lg:justify-end); on mobile it stays vertically centered over the
            scrimmed mobile clip. */}
        <div className="z-10 flex flex-col text-center text-white lg:max-w-2xl lg:text-left">
          <div className="mb-3 text-xs uppercase tracking-[0.3em] text-white/80 animate-fade-in">
            {eyebrow}
          </div>
          {/* Emphasis defaults to index 1 ("experience") for the dict copy;
              Sanity authors can re-target the italic treatment by wrapping a
              different word in <<…>>. The h1 inherits color, so lg:text-white
              on the wrapper turns it white over the video on desktop. */}
          <HeroHeadline words={headlineWords} emphasis={headlineEmphasis} />
          {/* `mx-auto lg:mx-0` centres the max-w-xl block on mobile and pins it
              to the left at the bottom on desktop. */}
          <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-base md:text-lg text-white leading-snug animate-fade-in">
            {clarifier}
          </p>
          <p className="mt-3 max-w-xl mx-auto lg:mx-0 text-sm md:text-base text-white/75 leading-relaxed animate-fade-in">
            {sub}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in">
            <Link
              href={`/${locale}#contact`}
              className="rounded-full bg-cta px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-cta-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
            >
              {primary}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="rounded-full border border-white/40 px-6 py-3 text-sm text-white hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {secondary}
            </Link>
          </div>
        </div>
      </div>
    </HeroShell>
  );
}
