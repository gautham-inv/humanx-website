import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";
import { EventsList } from "./EventsList";
import { EventsCTA } from "@/components/sections/EventsCTA";

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
  return {
    title: "Events · HumanX",
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

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const t = dict.events;

  return (
    <main id="main">
      <section className="relative px-6 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {t.eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight max-w-3xl">
              {t.pageTitle}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">{t.pageBody}</p>
          </Reveal>
        </div>
      </section>

      <EventsList dict={dict} locale={locale as Locale} />

      <EventsCTA dict={dict} />
    </main>
  );
}
