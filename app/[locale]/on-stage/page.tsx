import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadVideos, loadAboutPage, loadContactCta } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { GlobalSpeaking } from "@/components/sections/about/GlobalSpeaking";
import { VideoGrid } from "@/components/sections/on-stage/VideoGrid";
import { WorldMap, type SpeakingPin } from "@/components/sections/on-stage/WorldMap";
import { resolveVideos } from "@/components/sections/on-stage/resolve-videos";
import { pageMetadata } from "@/lib/seo/metadata";

const SLUG = "on-stage";

// Curated coordinates for the real engagement cities (webinar-only entries
// in the speaking list have no place on the map and are omitted). The region
// list below still renders the full editable list from Sanity/dict.
const SPEAKING_PINS: SpeakingPin[] = [
  { city: "Chantilly, VA", lng: -77.43, lat: 38.89, talks: 1 },
  { city: "Bentonville, AR", lng: -94.21, lat: 36.37, talks: 1 },
  { city: "Madrid", lng: -3.7, lat: 40.42, talks: 3 },
  { city: "Lima", lng: -77.04, lat: -12.05, talks: 2 },
  { city: "Cartagena", lng: -75.51, lat: 10.39, talks: 1 },
];

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
    title: "On stage · HumanX",
    description:
      "Book Ramon Portilla to speak — keynotes and talks that turn human-experience strategy into ideas audiences apply the next day, on stages across three continents.",
  });
}

export default async function OnStagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, videos, about, contactCta] = await Promise.all([
    getDictionary(locale as Locale),
    loadVideos(locale as Locale),
    loadAboutPage(locale as Locale),
    loadContactCta(locale as Locale),
  ]);

  const t = dict.onStagePage;
  const resolved = resolveVideos(videos, dict);

  // Speaking copy + regions: Sanity override (lives on the aboutPage
  // singleton) with dict fallback. Relocated here from /about.
  const speaking = {
    eyebrow: about?.speaking.eyebrow ?? dict.about.speaking.eyebrow,
    title: about?.speaking.title ?? dict.about.speaking.title,
    body: about?.speaking.body ?? dict.about.speaking.body,
    regions:
      about?.speaking.regions && about.speaking.regions.length > 0
        ? about.speaking.regions
        : dict.about.speaking.regions,
  };

  return (
    <main id="main">
      {/* HERO */}
      <section className="relative px-6 pt-14 pb-10 md:pt-24 md:pb-14 lg:pt-28 lg:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {t.eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <HighlightedTitle
              as="h1"
              className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight"
            >
              {t.title}
            </HighlightedTitle>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
              {t.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SPEAKING MAP + REGION LIST (relocated from /about) — leads the page
          so the global reach reads before the talks themselves. */}
      <GlobalSpeaking
        {...speaking}
        map={<WorldMap pins={SPEAKING_PINS} className="mx-auto w-full max-w-4xl" />}
      />

      {/* VIDEOS — every recorded keynote */}
      <section className="relative border-t border-line px-6 py-12 md:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-3xl leading-[1.1] tracking-tight md:text-4xl">
                {t.videosTitle}
              </h2>
              <p className="max-w-sm text-ink-dim">{t.videosBody}</p>
            </div>
          </Reveal>
          <VideoGrid videos={resolved} />
        </div>
      </section>

      <GlobalCTA dict={dict} variant="centered" content={contactCta} />
    </main>
  );
}
