import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  loadAboutPage,
  loadContactCta,
  loadRecommendations,
} from "@/lib/sanity/loaders";
import { RECOMMENDATIONS } from "@/lib/data/recommendations";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ContactCTAButton } from "@/components/layout/ContactCTAButton";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { NetworkSlot } from "@/components/sections/about/NetworkSlot";
import {
  MissionTargetIcon,
  ValuesCompassIcon,
  FounderDotIcon,
} from "@/components/sections/about/SectionIcons";
import { BackdropMesh } from "@/components/motion/Backdrops";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import { FeaturedVideo } from "@/components/sections/FeaturedVideo";
import { FeaturedRecommendation } from "@/components/sections/about/FeaturedRecommendation";
import { pageMetadata } from "@/lib/seo/metadata";

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
  return pageMetadata({
    locale,
    path: `/${SLUG}`,
    title: "About · HumanX Insights",
    description:
      "Ramon Portilla — founder, speaker and advisor. 30+ years of CX/EX and analytics across Meta, Walmart, Nielsen and Sam's Club, turning strategy into systems teams can run.",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, about, contactCta, recs] = await Promise.all([
    getDictionary(locale as Locale),
    loadAboutPage(locale as Locale),
    loadContactCta(locale as Locale),
    loadRecommendations(locale as Locale),
  ]);
  const t = dict.about;
  // Recommendations: live Sanity docs when present, else the bundled list.
  const recommendations = recs.length > 0 ? recs : RECOMMENDATIONS;
  // Only one endorsement is featured on /about — Alejandra's. Match by id or
  // name across both the Sanity (`recommendation-alejandra-h`) and the bundled
  // (`alejandra-h`) sources; fall back to the first item if she's missing.
  const featuredRec =
    recommendations.find(
      (r) => /alejandra/i.test(r.id) || /^alejandra/i.test(r.name)
    ) ?? recommendations[0];
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
                <NetworkSlot className="mx-auto aspect-square w-[28rem] max-w-full" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* 2. FOUNDER — moved up to lead the page (right below the hero).
            Top padding is tightened so the hero's network visual and the
            founder portrait don't read as two stacked hero blocks. */}
        <section id="founder" className="relative border-t border-line px-6 pt-10 pb-14 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32">
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
            </div>
          </div>

          {/* Career metrics — merged in from the former Experience section and
              shown large so the numbers carry the beat on their own. */}
          <Reveal direction="up" delay={0.1}>
            <dl className="mx-auto mt-14 grid max-w-6xl grid-cols-3 gap-6 border-t border-line pt-10 md:mt-20 md:gap-12">
              {founderStats.map((s, i) => {
                // Three stats, three brand colours — orange, violet, magenta.
                const valColor =
                  ["text-accent", "text-violet", "text-magenta"][i % 3];
                return (
                  <div key={s.label} className="text-center">
                    <dt>
                      <CountUp
                        value={s.value}
                        className={`font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.9] tabular-nums tracking-tight ${valColor}`}
                        style={{ fontVariationSettings: '"SHRP" 90' }}
                      />
                    </dt>
                    <dd className="mt-2 text-xs uppercase tracking-[0.2em] text-ink-dim md:text-sm">
                      {s.label}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        </section>

        {/* 3. MISSION — image-left / text-right */}
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

        {/* 4. VALUES — intro left (sticky), single-column editorial list right.
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


        {/* 5. FEATURED VIDEO — Sanity-driven (aboutPage.featuredVideo) with
            the dict as fallback, so Ramon can swap the video + related-article
            link from Studio without a deploy. */}
        <FeaturedVideo
          eyebrow={about?.featuredVideo.eyebrow ?? dict.about.featuredVideo.eyebrow}
          title={about?.featuredVideo.title ?? dict.about.featuredVideo.title}
          body={about?.featuredVideo.body ?? dict.about.featuredVideo.body}
          youtubeId={
            about?.featuredVideo.youtubeId ?? dict.about.featuredVideo.youtubeId
          }
          blogUrl={about?.featuredVideo.blogUrl ?? dict.about.featuredVideo.blogUrl}
          blogLabel={
            about?.featuredVideo.blogLabel ?? dict.about.featuredVideo.blogLabel
          }
        />

        {/* 6. RECOMMENDATION — a single featured LinkedIn endorsement
            (Alejandra's) in the editorial two-column spread. Sanity-sourced
            with the bundled RECOMMENDATIONS list as fallback; her portrait
            comes from the recommendation's image in Studio (monogram until
            uploaded). */}
        {featuredRec ? (
          <FeaturedRecommendation
            name={featuredRec.name}
            headline={featuredRec.headline}
            relationship={featuredRec.relationship}
            date={featuredRec.date}
            body={featuredRec.body}
            imageUrl={featuredRec.imageUrl}
            imageAlt={featuredRec.imageAlt}
            linkedinUrl={featuredRec.linkedinUrl}
          />
        ) : null}

        <GlobalCTA dict={dict} variant="centered" content={contactCta} />
      </main>
  );
}
