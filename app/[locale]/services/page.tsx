import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  loadServices,
  loadServicesPage,
  loadContactCta,
} from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { GlobalCTA } from "@/components/sections/GlobalCTA";
import { SolarSystemSlot } from "@/components/sections/services/SolarSystemSlot";
import { SERVICE_ICONS } from "@/components/sections/services/ServiceIcons";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import { pageMetadata } from "@/lib/seo/metadata";

const SLUG = "services";

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
    title: "Services · HumanX",
    description:
      "Three disciplines, one through-line: human experience as the operating principle. CX & EX strategy, insight-driven narratives, and operational playbooks for leadership teams.",
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, sanityServices, servicesPage, contactCta] = await Promise.all([
    getDictionary(locale as Locale),
    loadServices(locale as Locale),
    loadServicesPage(locale as Locale),
    loadContactCta(locale as Locale),
  ]);
  const t = dict.services;
  // Sanity is the source of truth once seeded; fall back to dict items if
  // the fetch returned nothing (e.g. dataset still empty).
  const items = sanityServices.length > 0 ? sanityServices : t.items;
  const eyebrow = servicesPage?.eyebrow ?? t.eyebrow;
  const titleRaw = servicesPage?.title ?? t.title;
  const body = servicesPage?.body ?? t.body;

  return (
    <main id="main">
      {/* HERO — text left / solar system right */}
      <section className="relative overflow-hidden px-6 pt-14 pb-10 md:pt-24 md:pb-16 lg:pt-32 lg:pb-24">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.2fr_auto]">
          <div className="order-2 lg:order-1">
            <Reveal direction="up">
              <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
                <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                {eyebrow}
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.05}>
              <HighlightedTitle
                as="h1"
                className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-tight"
              >
                {titleRaw}
              </HighlightedTitle>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
                {body}
              </p>
            </Reveal>
          </div>
          <div className="order-1 hidden lg:order-2 lg:block">
            <Reveal direction="up" delay={0.1}>
              <SolarSystemSlot className="mx-auto aspect-square w-[28rem] max-w-full" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* EDITORIAL ZIGZAG — each service is a wide row, icon and text alternate sides.
       * No numbers, no eyebrows, no audience/deliverable dl, no per-card CTA.
       * Just the icon, the title, the body. A hairline rule between rows. */}
      <section className="relative border-t border-line px-6 py-14 md:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl divide-y divide-line/70">
          {items.map((item, idx) => {
            const Icon = SERVICE_ICONS[item.id];
            const reverse = idx % 2 === 1;
            return (
              <article
                key={item.id}
                className={`grid items-center gap-10 py-16 md:gap-20 md:py-24 ${
                  reverse
                    ? "md:grid-cols-[1fr_auto]"
                    : "md:grid-cols-[auto_1fr]"
                }`}
              >
                {/* Icon column — visually anchored, alternates side per row.
                    Lucide icons rendered at generous size so each row reads
                    as its own chapter, not a list item. */}
                <Reveal
                  direction="up"
                  className={`${
                    reverse ? "md:order-2 md:justify-self-end" : "md:order-1"
                  }`}
                >
                  <div className="flex h-28 w-28 items-center justify-center text-accent md:h-40 md:w-40">
                    {Icon ? (
                      <Icon className="h-20 w-20 md:h-28 md:w-28" strokeWidth={1.25} />
                    ) : null}
                  </div>
                </Reveal>

                {/* Text column */}
                <div
                  className={`${
                    reverse ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <Reveal direction="up" delay={0.05}>
                    <h2 className="font-display text-3xl leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
                      {item.title}
                    </h2>
                  </Reveal>
                  <Reveal direction="up" delay={0.1}>
                    <p className="mt-5 max-w-2xl font-serif text-base leading-relaxed text-ink-dim md:mt-6 md:text-lg">
                      {item.body}
                    </p>
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <GlobalCTA dict={dict} variant="centered" content={contactCta} />
    </main>
  );
}
