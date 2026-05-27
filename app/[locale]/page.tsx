import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, type Locale } from "@/lib/i18n/config";
import { sanityClient } from "@/lib/sanity/client";
import {
  testimonialsQuery,
  type TestimonialDoc,
} from "@/lib/sanity/queries";
import {
  loadEvents,
  loadPartners,
  loadHomepage,
  loadEventsPage,
  loadContactCta,
} from "@/lib/sanity/loaders";
import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { Assessment } from "@/components/sections/Assessment";
import { Events } from "@/components/sections/Events";
import { OnStage } from "@/components/sections/OnStage";
import { PartnersTicker } from "@/components/sections/PartnersTicker";
import {
  Testimonials,
  type TestimonialItem,
} from "@/components/sections/Testimonials";
import { GlobalCTA } from "@/components/sections/GlobalCTA";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
    homepage,
    eventsPage,
    contactCta,
  ] = await Promise.all([
    getDictionary(locale),
    loadTestimonials(locale),
    loadEvents(locale),
    loadPartners(),
    loadHomepage(locale),
    loadEventsPage(locale),
    loadContactCta(locale),
  ]);
  return (
    <main id="main">
      <Hero dict={dict} locale={locale} content={homepage?.hero} />
      <WhoWeAre dict={dict} content={homepage?.whoWeAre} />
      <Assessment dict={dict} content={homepage?.assessment} />
      <Events dict={dict} locale={locale} items={events} content={eventsPage} />
      <OnStage dict={dict} items={events} content={homepage?.onStage} />
      <PartnersTicker
        dict={dict}
        items={partners}
        content={homepage?.partners}
      />
      <Testimonials
        dict={dict}
        items={testimonials}
        content={homepage?.testimonials}
      />
      <GlobalCTA dict={dict} variant="home" content={contactCta} />
    </main>
  );
}
