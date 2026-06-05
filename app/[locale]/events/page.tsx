import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadEvents, loadEventsPage } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { EventsList } from "./EventsList";
import { EventsCTA } from "@/components/sections/EventsCTA";
import { pageMetadata } from "@/lib/seo/metadata";

const SLUG = "events";

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
    title: "Events · HumanX Insights",
    description:
      "Where HumanX Insights is on stage next — keynotes, forums and roundtables on human experience, CX/EX and AI for leadership audiences worldwide.",
  });
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, events, eventsPage] = await Promise.all([
    getDictionary(locale as Locale),
    loadEvents(locale as Locale),
    loadEventsPage(locale as Locale),
  ]);
  const t = dict.events;
  const eyebrow = eventsPage?.page.eyebrow ?? t.eyebrow;
  const pageTitle = eventsPage?.page.title ?? t.pageTitle;
  const pageBody = eventsPage?.page.body ?? t.pageBody;

  return (
    <main id="main">
      <section className="relative px-6 pt-14 pb-8 md:pt-24 md:pb-14 lg:pt-32 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight max-w-3xl">
              {pageTitle}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">{pageBody}</p>
          </Reveal>
        </div>
      </section>

      <EventsList
        dict={dict}
        locale={locale as Locale}
        items={events}
        content={eventsPage}
      />

      <EventsCTA dict={dict} content={eventsPage?.book} />
    </main>
  );
}
