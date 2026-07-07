import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadInsights, loadInsightsPage } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { InsightCard } from "@/components/sections/InsightCard";
import { pageMetadata } from "@/lib/seo/metadata";

const SLUG = "insights";

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
    title: "Insights · HumanX Insights",
    description:
      "Field notes and frameworks on customer and employee experience — practical thinking on making human experience the operating principle of your organization.",
  });
}


export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const [dict, sanityInsights, insightsPage] = await Promise.all([
    getDictionary(locale as Locale),
    loadInsights(locale as Locale),
    loadInsightsPage(locale as Locale),
  ]);
  const t = dict.insights;
  const items = sanityInsights.length > 0 ? sanityInsights : t.items;
  const eyebrow = insightsPage?.eyebrow ?? t.eyebrow;
  const title = insightsPage?.title ?? t.title;
  const body = insightsPage?.body ?? t.body;
  const listTitle = insightsPage?.listTitle ?? t.listTitle;
  const linkedinUrl = insightsPage?.linkedinUrl ?? t.linkedinUrl;
  const linkedinLabel = insightsPage?.linkedinLabel ?? t.linkedinLabel;

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
              {title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">{body}</p>
          </Reveal>
          {linkedinUrl ? (
            <Reveal direction="up" delay={0.15}>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                {linkedinLabel}
              </a>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Card grid — see components/sections/InsightCard.tsx for the
       * link/fallback logic. */}
      <section className="relative px-6 py-10 md:py-16 lg:py-24 border-t border-line">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
              {listTitle}
            </h2>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <li key={item.id}>
                <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                  <InsightCard item={item} index={idx} locale={locale} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
