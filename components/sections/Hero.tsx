import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import { HeroHeadline } from "./HeroHeadline";
import { BackgroundOrbs } from "./BackgroundOrbs";
import { HeroImage } from "./HeroImage";

export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-6 pb-12 md:pt-10 md:pb-16 lg:flex lg:min-h-svh lg:items-center lg:pt-8 lg:pb-0">
      {/* Background drifting orbs */}
      <BackgroundOrbs />

      {/* Desktop portrait — fills hero top→bottom. Section sits below the
          sticky nav in the DOM, so inset-y-0 places the image just under
          the nav. HeroImage internally handles the scale + bottom-anchor +
          parallax so the visible crop keeps Ramon's face + torso in frame. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden lg:block lg:w-[42%] xl:w-[46%]">
        <HeroImage fill alt={dict.hero.portraitAlt} />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1300px] flex-col lg:pb-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Portrait — mobile only, rendered FIRST so it sits above the
              text on small screens. Hidden on lg+ where the absolute
              desktop image takes over. */}
          <div className="col-span-1 z-10 mx-auto block w-full max-w-sm lg:hidden">
            <div className="aspect-[1086/724] w-full">
              <HeroImage alt={dict.hero.portraitAlt} />
            </div>
          </div>

          {/* Text Content Column */}
          <div className="z-10 flex flex-col justify-center lg:col-span-7">
            <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-ink-dim animate-fade-in">
              <span className="h-px w-8 bg-accent" />
              {dict.hero.eyebrow}
            </div>
            {/* Emphasis on "experience" (index 1) — italic serif in accent
                hue, mirrors the Litmus7 standout. The brand promise lives in
                that one word; the rest of the line is the assertion. */}
            <HeroHeadline words={dict.hero.headline} emphasis={[1]} />
            <p className="mt-5 max-w-xl text-base md:text-lg text-ink leading-snug animate-fade-in">
              {dict.hero.clarifier}
            </p>
            <p className="mt-3 max-w-xl text-sm md:text-base text-ink-dim leading-relaxed animate-fade-in">
              {dict.hero.sub}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 animate-fade-in">
              <Link
                href={`/${locale}#contact`}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
              >
                {dict.hero.primary}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="rounded-full border border-line px-6 py-3 text-sm text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {dict.hero.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
