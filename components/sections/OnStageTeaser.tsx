import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import { HeroImage } from "./HeroImage";

type OnStageTeaserProps = {
  dict: Dictionary;
  locale: Locale;
};

/**
 * Homepage "on stage" teaser: a two-column editorial block — credentials,
 * Ramon's name as the headline, a positioning line, and the "Watch me on
 * stage" CTA on the left; Ramon's portrait on the right. The portrait moved
 * here from
 * the hero (which now runs the keynote reel as its background), so the same
 * "text left / portrait right" composition continues into this section. No top
 * border, so the hero crossfades straight into it. Stacks on mobile.
 */
export function OnStageTeaser({ dict, locale }: OnStageTeaserProps) {
  const t = dict.onStage;
  const href = `/${locale}/on-stage`;
  // Split the name so the surname carries the brand accent ("Ramon Portilla"
  // → white first name + accent surname). Falls back gracefully to a single
  // (all-white) word if the name has no space.
  const [firstName, ...rest] = t.name.split(" ");
  const surname = rest.join(" ");

  return (
    <section
      id="on-stage"
      className="relative flex flex-col justify-center px-6 py-16 md:py-24 lg:min-h-svh lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Text + CTA — left on desktop, centered on mobile. */}
        <div className="text-center lg:text-left">
          <Reveal direction="up">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              {t.credentials}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h2 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0] tracking-tight">
              {firstName}
              {surname ? <span className="text-accent"> {surname}</span> : null}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-dim lg:mx-0">
              {t.teaserBody}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-cta-bright"
              >
                {t.cta}
                <span aria-hidden className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Portrait — right on desktop, below the text on mobile. */}
        <Reveal direction="up" delay={0.1}>
          <div className="relative mx-auto h-[24rem] w-full max-w-sm sm:h-[28rem] lg:h-[calc(100svh-12rem)] lg:max-w-none">
            <HeroImage fill alt={dict.hero.portraitAlt} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
