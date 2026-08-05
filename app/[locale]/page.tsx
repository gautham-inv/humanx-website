import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, type Locale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { sanityClient } from "@/lib/sanity/client";
import {
  testimonialsQuery,
  type TestimonialDoc,
} from "@/lib/sanity/queries";
import {
  loadEvents,
  loadPartners,
  loadClients,
  loadHomepage,
  loadAboutPage,
  loadEventsPage,
  loadContactCta,
  loadPublications,
  loadNews,
} from "@/lib/sanity/loaders";
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Credentials } from "@/components/sections/Credentials";
import { Assessment } from "@/components/sections/Assessment";
import { PullQuote } from "@/components/sections/PullQuote";
import { Events } from "@/components/sections/Events";
import { OnStageTeaser } from "@/components/sections/OnStageTeaser";
import { LogoTicker } from "@/components/sections/LogoTicker";
import { Partners } from "@/components/sections/Partners";
import {
  Testimonials,
  type TestimonialItem,
} from "@/components/sections/Testimonials";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { ConferencePush } from "@/components/sections/ConferencePush";
import { LatestNews } from "@/components/sections/LatestNews";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Per-locale homepage metadata. The homepage is the only route without its own
 * generateMetadata, so without this it inherited the locale layout's
 * hardcoded English title — making /es serve the English <title>. Pull the
 * localized title/description from the dictionary so each locale gets its own.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: "",
    title: dict.seo.home.title,
    description: dict.seo.home.description,
  });
}

/**
 * Pull testimonials from Sanity at build time. Static export (`output:
 * "export"`) means this runs exactly once per `next build` per locale —
 * the visitor never waits on the network. If Sanity is unreachable we
 * return [] and `<Testimonials>` falls back to the dict items so the
 * homepage still ships.
 */
async function loadTestimonials(locale: Locale): Promise<TestimonialItem[]> {
  try {
    const rows = await sanityClient.fetch<TestimonialDoc[]>(testimonialsQuery);
    return rows
      .map((row) => ({
        id: row.id,
        quote: row.quote?.[locale] ?? row.quote?.en ?? "",
        author: row.author?.[locale] ?? row.author?.en ?? "",
        org: row.org?.[locale] ?? row.org?.en,
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        linkedinUrl: row.linkedinUrl,
      }))
      .filter((row) => row.quote && row.author);
  } catch (err) {
    console.warn("Sanity testimonials fetch failed; using dict fallback.", err);
    return [];
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  // All Sanity fetches run in parallel at build time. With static export
  // they happen during `next build`; visitors never wait on these.
  const [
    dict,
    testimonials,
    events,
    partners,
    clients,
    homepage,
    eventsPage,
    contactCta,
    publications,
    about,
    news,
  ] = await Promise.all([
    getDictionary(locale),
    loadTestimonials(locale),
    loadEvents(locale),
    loadPartners(),
    loadClients(),
    loadHomepage(locale),
    loadEventsPage(locale),
    loadContactCta(locale),
    loadPublications(locale),
    loadAboutPage(locale),
    loadNews(locale),
  ]);
  return (
    <main id="main">
      {/* Conference paper push — renders nothing unless the homepage is opened
          via a tagged link (?paper=<campaignKey>). */}
      <ConferencePush dict={dict} publications={publications} />
      <Hero dict={dict} locale={locale} content={homepage?.hero} />
      {/* Press mentions — renders nothing until a news item is enabled in
          Sanity. Anchored at #news for direct linking from social posts. */}
      <LatestNews dict={dict} items={news} />
      <OnStageTeaser
        dict={dict}
        locale={locale}
        linkedinUrl={homepage?.onStage?.linkedinUrl || about?.founder?.linkedinUrl}
      />
      {/* Clients lead the homepage social proof — the more credible wall of
          brands HumanX has served. Renders only once clients are seeded. */}
      <LogoTicker
        heading={dict.clientsTicker.heading}
        ariaLabel="Clients"
        items={clients}
        fallbackNames={dict.clientsTicker.items}
      />
      <WhoWeAre dict={dict} content={homepage?.whoWeAre} />
      <Credentials dict={dict} />
      <Assessment dict={dict} content={homepage?.assessment} />
      <PullQuote
        quote={homepage?.pullQuote.text ?? dict.pullQuote.quote}
        author={homepage?.pullQuote.author ?? dict.pullQuote.author}
        role={homepage?.pullQuote.role ?? dict.pullQuote.role}
        imageSrc={homepage?.pullQuote.imageUrl ?? "/quote-image.jpg"}
        imageAlt={homepage?.pullQuote.imageAlt ?? dict.pullQuote.imageAlt}
      />
      <Events dict={dict} locale={locale} items={events} content={eventsPage} />
      <Testimonials
        dict={dict}
        items={testimonials}
        content={homepage?.testimonials}
      />
      {/* Partners — a static distributed cluster (not a marquee), clearly
          labelled so it reads as partners, distinct from the scrolling clients
          wall above the fold. */}
      <Partners
        heading={dict.partnersTicker.heading}
        ariaLabel="Partners"
        items={partners}
        fallbackNames={dict.partnersTicker.items}
      />
      <GlobalCTA dict={dict} variant="home" content={contactCta} />
    </main>
  );
}
