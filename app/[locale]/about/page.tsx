import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadAboutPage, loadContactCta } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ContactCTAButton } from "@/components/layout/ContactCTAButton";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { AboutHeroNetwork } from "@/components/sections/about/AboutHeroNetwork";
import {
  MissionTargetIcon,
  ValuesCompassIcon,
  ExperienceArcIcon,
  FounderDotIcon,
} from "@/components/sections/about/SectionIcons";
import { BackdropMesh } from "@/components/motion/Backdrops";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";

const SLUG = "about";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About · HumanX",
    alternates: {
      canonical: `/${locale}/${SLUG}`,
      languages: {
        en: `/en/${SLUG}`,
        es: `/es/${SLUG}`,
        "x-default": `/en/${SLUG}`,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, about, contactCta] = await Promise.all([
    getDictionary(locale as Locale),
    loadAboutPage(locale as Locale),
    loadContactCta(locale as Locale),
  ]);
  const t = dict.about;
  // Resolve every editable string once at the top. Each leaf falls back to
  // the dict value if Sanity hasn't supplied it; the section markup below
  // stays the same shape it has today.
  const pageEyebrow = about?.hero.eyebrow ?? t.pageEyebrow;
  const pageTitleRaw = about?.hero.titleRaw ?? t.pageTitle;
  const pageBody = about?.hero.body ?? t.pageBody;
  const primaryCta = about?.hero.primaryCta ?? t.primaryCta;
  const missionTitle = about?.mission.title ?? t.missionTitle;
  const missionBody = about?.mission.body ?? t.missionBody;
  const missionImageAlt = about?.mission.imageAlt ?? t.missionImageAlt;
  const valuesTitle = about?.values.title ?? dict.values.title;
  const valuesBody = about?.values.body ?? dict.values.body;
  const valuesItems =
    about?.values.items && about.values.items.length > 0
      ? about.values.items
      : dict.values.items;
  const experienceTitle = about?.experience.title ?? t.experienceTitle;
  const experienceBody = about?.experience.body ?? t.experienceBody;
  const experienceStatValue =
    about?.experience.statValue ?? t.experienceStatValue;
  const experienceStatLabel =
    about?.experience.statLabel ?? t.experienceStatLabel;
  const experienceStatNote =
    about?.experience.statNote ?? t.experienceStatNote;
  const founderTitle = about?.founder.name ?? dict.ramon.title;
  const founderBio = about?.founder.bio ?? dict.ramon.body;
  const founderImageAlt = about?.founder.imageAlt ?? dict.ramon.title;
  const founderStats =
    about?.founder.stats && about.founder.stats.length > 0
      ? about.founder.stats
      : dict.ramon.stats;

  return (
    <main id="main">
        {/* 1. HERO */}
        <section className="relative overflow-hidden px-6 pt-14 pb-10 md:pt-24 md:pb-16 lg:pt-32 lg:pb-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.2fr_auto]">
            <div className="order-2 lg:order-1">
              <Reveal direction="up">
                <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
                  <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                  {pageEyebrow}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <HighlightedTitle
                  as="h1"
                  className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight"
                >
                  {pageTitleRaw}
                </HighlightedTitle>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">{pageBody}</p>
              </Reveal>
              <Reveal direction="up" delay={0.15}>
                <div className="mt-8">
                  <ContactCTAButton label={primaryCta} />
                </div>
              </Reveal>
            </div>
            <div className="order-1 hidden lg:order-2 lg:block">
              <Reveal direction="up" delay={0.1}>
                <AboutHeroNetwork className="mx-auto aspect-square w-[28rem] max-w-full" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* 2. MISSION — image-left / text-right */}
        <section id="mission" className="relative border-t border-line px-6 py-12 md:py-20 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
            <Reveal direction="up">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line">
                <Image
                  src="/mission.jpeg"
                  alt={missionImageAlt}
                  fill
                  sizes="(min-width: 768px) 32rem, 100vw"
                  className="object-cover object-[center_30%]"
                />
              </div>
            </Reveal>
            <div>
              <Reveal direction="up">
                <div className="mb-6 text-violet">
                  <MissionTargetIcon width={36} height={36} />
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {missionTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 font-serif text-lg leading-relaxed text-ink-dim">{missionBody}</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 3. VALUES — intro left (sticky), single-column editorial list right.
           Replaces the 2-col numbered card grid; no card chrome, no backdrop
           blur, no rotating accent colour. Letterforms + a thin rule do the
           work. */}
        <section id="values" className="relative overflow-hidden border-t border-line px-6 py-12 md:py-20 lg:py-28">
          <BackdropMesh
            cell={32}
            opacity={0.09}
            strokeWidth={0.5}
            fade="radial"
            feather="center"
          />
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="up">
                <div className="mb-6 text-accent">
                  <ValuesCompassIcon width={36} height={36} />
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {valuesTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="mt-6 font-serif text-lg leading-relaxed text-ink-dim">{valuesBody}</p>
              </Reveal>
            </div>
            <ol className="divide-y divide-line">
              {valuesItems.map((v, i) => (
                <li key={v.title}>
                  <Reveal direction="up" delay={i * 0.05}>
                    <div className="grid grid-cols-[3rem_1fr] gap-6 py-8 md:gap-10 md:py-10">
                      <span
                        aria-hidden
                        className="font-display text-2xl tabular-nums text-accent/50"
                        style={{ fontVariationSettings: '"SHRP" 80' }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-2xl text-ink md:text-3xl">{v.title}</h3>
                        <p className="mt-3 font-serif text-base leading-relaxed text-ink-dim md:text-lg">{v.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. EXPERIENCE — heading + marginalia stat in the gutter. No card
           chrome, no backdrop blur, no border. The 30+ numeral floats in the
           margin like a magazine pull-quote; the body sits in the main column
           in the editorial serif.

           Previous layout put icon, heading, and body in three separate grid
           rows with `gap-y-10` (2.5rem) between them — that made the
           icon→heading gap ~2.5× larger than the equivalent transition in
           Mission/Values/Founder, where icon and heading sit in normal flow
           with `mb-6` (1.5rem). The grid now has two rows: icon+heading
           stacked together in row 1 (right column), and stat (left) + body
           (right) sharing row 2. This restores the editorial rhythm so all
           four sections feel like siblings, not third-cousin variants. */}
        <section id="experience" className="relative border-t border-line px-6 py-12 md:py-20 lg:py-28">
          <div className="mx-auto grid max-w-6xl gap-x-12 gap-y-10 md:grid-cols-[auto_1fr] md:gap-x-16">
            {/* Row 1, right column: icon + heading stacked in normal flow
                so `mb-6` controls the icon→heading gap, matching the other
                sections (Mission/Values/Founder). */}
            <div className="md:col-start-2">
              <Reveal direction="up">
                <div className="mb-6 text-magenta">
                  <ExperienceArcIcon width={36} height={36} />
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {experienceTitle}
                </h2>
              </Reveal>
            </div>

            {/* Row 2, left column: the 30+ stat as a magazine pull-quote. */}
            <Reveal direction="up" delay={0.15} className="md:self-start">
              <div className="flex items-start gap-5 md:flex-col md:gap-3">
                <CountUp
                  value={experienceStatValue}
                  className="font-display text-[clamp(4rem,9vw,7rem)] leading-[0.85] tabular-nums tracking-tight text-accent"
                  style={{ fontVariationSettings: '"SHRP" 100' }}
                />
                <div className="max-w-[14rem] pt-2 md:pt-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">{experienceStatLabel}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-dim">{experienceStatNote}</p>
                </div>
              </div>
            </Reveal>

            {/* Row 2, right column: body copy. */}
            <Reveal direction="up" delay={0.2} className="md:col-start-2">
              <p className="font-serif text-lg leading-relaxed text-ink-dim md:text-xl">{experienceBody}</p>
            </Reveal>
          </div>
        </section>

        {/* 5. FOUNDER — ramon2.png + rings/dots */}
        <section id="founder" className="relative border-t border-line px-6 py-14 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-[1fr_1.2fr]">
            <div className="relative mx-auto aspect-square w-full max-w-xs md:mx-0 md:max-w-md">
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
                <circle cx="200" cy="200" r="180" fill="none" stroke="var(--color-line)" strokeWidth="1" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="var(--color-line)" strokeWidth="1" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="2 6" />
                <circle cx="320" cy="70" r="6" fill="var(--color-violet)" />
                <circle cx="90" cy="320" r="4" fill="var(--color-magenta)" />
                <circle cx="60" cy="120" r="3" fill="var(--color-accent)" />
                <circle cx="350" cy="280" r="3" fill="var(--color-accent)" />
                <circle cx="40" cy="220" r="2" fill="var(--color-accent-bright)" />
                <circle cx="360" cy="180" r="2" fill="var(--color-accent-bright)" />
              </svg>
              <div className="absolute inset-0">
                <Image
                  src="/ramon2.png"
                  alt={founderImageAlt}
                  fill
                  sizes="(min-width: 768px) 28rem, 20rem"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
            <div className="space-y-8">
              <Reveal direction="up">
                <div className="text-violet">
                  <FounderDotIcon width={36} height={36} />
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.05}>
                <h2 className="font-display text-4xl leading-tight md:text-5xl">
                  {founderTitle}
                </h2>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <p className="max-w-lg font-serif text-lg leading-relaxed text-ink-dim">{founderBio}</p>
              </Reveal>
              <Reveal direction="up" delay={0.15}>
                <dl className="grid grid-cols-3 gap-6 border-t border-line pt-8">
                  {founderStats.map((s, i) => {
                    // Three stats, three brand colours — orange, violet, magenta.
                    const valColor =
                      ["text-accent", "text-violet", "text-magenta"][i % 3];
                    return (
                      <div key={s.label}>
                        <dt>
                          <CountUp
                            value={s.value}
                            className={`font-display text-3xl tabular-nums ${valColor}`}
                          />
                        </dt>
                        <dd className="mt-1 text-xs uppercase tracking-widest text-ink-dim">
                          {s.label}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        <GlobalCTA dict={dict} variant="centered" content={contactCta} />
      </main>
  );
}
