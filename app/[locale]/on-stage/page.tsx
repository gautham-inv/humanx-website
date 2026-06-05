import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  loadVideos,
  loadAboutPage,
  loadContactCta,
  loadConferences,
  loadOnStagePage,
  type ContactCtaContent,
} from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { GlobalSpeaking } from "@/components/sections/about/GlobalSpeaking";
import { MajorConferences } from "@/components/sections/on-stage/MajorConferences";
import { AreasOfExpertise } from "@/components/sections/on-stage/AreasOfExpertise";
import { VideoGrid } from "@/components/sections/on-stage/VideoGrid";
import { WorldMap, type SpeakingPin } from "@/components/sections/on-stage/WorldMap";
import { resolveVideos } from "@/components/sections/on-stage/resolve-videos";
import { JsonLd } from "@/components/seo/JsonLd";
import { videoObjectSchema } from "@/lib/seo/schema";
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
    title: "On stage · HumanX Insights",
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
  const [dict, videos, about, contactCta, conferences, onStage] =
    await Promise.all([
      getDictionary(locale as Locale),
      loadVideos(locale as Locale),
      loadAboutPage(locale as Locale),
      loadContactCta(locale as Locale),
      loadConferences(),
      loadOnStagePage(locale as Locale),
    ]);

  const t = dict.onStagePage;
  const resolved = resolveVideos(videos, dict);

  // Areas of expertise + speaking-experience intro: onStagePage Sanity
  // singleton with dict fallback.
  const areas = {
    // Eyebrow intentionally has no dict fallback (removed by the client);
    // shows only if set on the onStagePage Sanity singleton.
    eyebrow: onStage?.areas.eyebrow,
    title: onStage?.areas.title ?? t.areasTitle,
    items:
      onStage?.areas.items && onStage.areas.items.length > 0
        ? onStage.areas.items
        : t.areasItems,
  };
  const speakingExp = {
    eyebrow: onStage?.speakingExp.eyebrow ?? t.speakingExpEyebrow,
    title: onStage?.speakingExp.title ?? t.speakingExpTitle,
    body: onStage?.speakingExp.body ?? t.speakingExpBody,
  };
  // On-stage CTA copy overrides the generic contact CTA so it speaks to
  // speaking + consulting + workshops + partnerships, not just bookings.
  const ctaContent: ContactCtaContent = {
    ...(contactCta ?? {}),
    eyebrow: onStage?.cta.eyebrow ?? t.cta.eyebrow,
    title: onStage?.cta.title ?? t.cta.title,
    body: onStage?.cta.body ?? t.cta.body,
    openModalLabel: onStage?.cta.label ?? t.cta.label,
  };

  // Speaking copy + regions: Sanity override (lives on the aboutPage
  // singleton) with dict fallback. Relocated here from /about.
  const speaking = {
    // Eyebrow intentionally has no dict fallback (removed by the client);
    // shows only if set on the aboutPage Sanity singleton.
    eyebrow: about?.speaking.eyebrow,
    title: about?.speaking.title ?? dict.about.speaking.title,
    body: about?.speaking.body ?? dict.about.speaking.body,
    regions:
      about?.speaking.regions && about.speaking.regions.length > 0
        ? about.speaking.regions
        : dict.about.speaking.regions,
  };

  return (
    <main id="main">
      {resolved.length > 0 ? (
        <JsonLd data={resolved.map((v) => videoObjectSchema(v))} />
      ) : null}
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

      {/* AREAS OF EXPERTISE — icon grid, editable via onStagePage singleton. */}
      <AreasOfExpertise
        eyebrow={areas.eyebrow}
        title={areas.title}
        items={areas.items}
      />

      {/* GLOBAL SPEAKING EXPERIENCE — narrative lead-in to the conferences +
          map below. Editable via the onStagePage singleton. */}
      <section className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal direction="up">
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {speakingExp.eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h2 className="font-display text-3xl leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
              {speakingExp.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-lg leading-relaxed text-ink-dim">
              {speakingExp.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* MAJOR CONFERENCES — logo wall of marquee summits, above the speaking
          list. Sanity-driven (`conference` docs); renders nothing until any
          are added. */}
      <MajorConferences
        title={t.conferencesTitle}
        body={t.conferencesBody}
        items={conferences}
      />

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
            <div className="mb-12">
              <h2 className="font-display text-3xl leading-[1.1] tracking-tight md:text-4xl">
                {t.videosTitle}
              </h2>
            </div>
          </Reveal>
          <VideoGrid videos={resolved} />
        </div>
      </section>

      <GlobalCTA dict={dict} variant="centered" content={ctaContent} />
    </main>
  );
}
