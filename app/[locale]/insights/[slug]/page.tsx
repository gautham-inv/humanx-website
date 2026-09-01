import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadInsights } from "@/lib/sanity/loaders";
import { sanityImageUrl } from "@/lib/sanity/image-loader";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleSchema } from "@/lib/seo/schema";
import { InsightCard } from "@/components/sections/InsightCard";
import { InsightShare } from "@/components/sections/InsightShare";
import { InsightCtaRow } from "@/components/sections/InsightCtaRow";
import { InsightBody, portableTextToPlainText } from "@/lib/sanity/portableText";
import { pageMetadata, SITE_URL } from "@/lib/seo/metadata";

/**
 * Dedicated insight article at /[locale]/insights/[slug].
 *
 * `output: "export"` means every (locale, slug) pair has to be enumerated
 * by `generateStaticParams` at build time. Only insights with BOTH a slug
 * and a body get a page — see loadInsights's build-safety fallback in
 * lib/sanity/loaders.ts. Mirrors app/[locale]/events/[slug]/page.tsx.
 */

type Params = { locale: string; slug: string };

function hasDetailPage(insight: { slug: string; body: unknown[] }) {
  return Boolean(insight.slug && insight.body.length > 0);
}

export async function generateStaticParams() {
  // English as the source of truth for slug enumeration — slugs aren't
  // localized (same URL segment in every locale).
  const insights = await loadInsights("en");
  const params: Params[] = [];
  for (const locale of locales) {
    for (const insight of insights) {
      if (hasDetailPage(insight)) params.push({ locale, slug: insight.slug });
    }
  }
  // `output: "export"` requires at least one param to pre-render the route.
  // When no insight has a slug+body yet (fresh schema rollout), register a
  // placeholder so the build can resolve the route; the page calls
  // notFound() so it renders a 404.
  if (params.length === 0) {
    for (const locale of locales) {
      params.push({ locale, slug: "_placeholder" });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const insights = await loadInsights(locale as Locale);
  const insight = insights.find((i) => i.slug === slug && hasDetailPage(i));
  if (!insight) return {};
  const description = portableTextToPlainText(insight.body).slice(0, 160);
  return pageMetadata({
    locale,
    path: `/insights/${slug}`,
    title: `${insight.title} · HumanX Insights`,
    description,
    images: insight.image
      ? [{ url: insight.image, alt: insight.imageAlt || insight.title }]
      : undefined,
  });
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const [dict, insights] = await Promise.all([
    getDictionary(locale as Locale),
    loadInsights(locale as Locale),
  ]);
  const t = dict.insights;

  const insight = insights.find((i) => i.slug === slug && hasDetailPage(i));
  if (!insight) notFound();

  // Related insights: same `kind` first, backfilled with the most recent
  // remaining ones (insights is already ordered newest-first by the
  // query), excluding the current one, capped at 3. Only insights with a
  // dedicated page are eligible.
  const candidates = insights.filter(
    (i) => i.slug !== insight.slug && hasDetailPage(i)
  );
  const sameKind = candidates.filter((i) => i.kind === insight.kind);
  const rest = candidates.filter((i) => i.kind !== insight.kind);
  const related = [...sameKind, ...rest].slice(0, 3);

  const readingLabel = t.readingTime.replace(
    "{n}",
    String(insight.readingTimeMinutes)
  );
  const canonicalUrl = `${SITE_URL}/${locale}/insights/${slug}`;

  return (
    <main id="main" className="relative">
      <JsonLd data={articleSchema(insight, locale)} />
      <section className="relative px-6 pt-10 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-32">
        <div className="mx-auto max-w-3xl">
          <Reveal direction="up">
            <Link
              href={`/${locale}/insights`}
              className="inline-flex items-center text-xs uppercase tracking-[0.3em] text-ink-dim hover:text-ink transition"
            >
              {t.backToInsights}
            </Link>
          </Reveal>

          <article className="mt-8">
            <Reveal direction="up" delay={0.05}>
              <div className="text-xs uppercase tracking-[0.3em] text-accent">
                {[insight.kind, insight.date, readingLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.08}>
              <div className="mt-3 flex items-center gap-2 text-sm text-ink-dim">
                {insight.authorPhotoUrl ? (
                  <img
                    src={sanityImageUrl(insight.authorPhotoUrl, 64)}
                    alt={insight.authorPhotoAlt || insight.authorName}
                    width={insight.authorPhotoWidth || undefined}
                    height={insight.authorPhotoHeight || undefined}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : null}
                <span>{insight.authorName}</span>
              </div>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tight">
                {insight.title}
              </h1>
            </Reveal>

            {insight.image ? (
              <Reveal direction="up" delay={0.15}>
                <img
                  src={sanityImageUrl(insight.image, 900)}
                  alt={insight.imageAlt || insight.title}
                  width={insight.imageWidth || undefined}
                  height={insight.imageHeight || undefined}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="mt-8 w-full rounded-2xl border border-line object-cover"
                />
              </Reveal>
            ) : null}

            {insight.body.length > 0 ? (
              <Reveal direction="up" delay={0.2}>
                <div className="mt-8">
                  <InsightBody value={insight.body} />
                </div>
              </Reveal>
            ) : null}

            {insight.href ? (
              <Reveal direction="up" delay={0.25}>
                <a
                  href={insight.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-bright"
                >
                  {t.viewOnLinkedIn}
                  <span aria-hidden>↗</span>
                </a>
              </Reveal>
            ) : null}

            <Reveal direction="up" delay={0.3}>
              <InsightShare
                url={canonicalUrl}
                labels={{
                  share: t.share,
                  copyLink: t.copyLink,
                  linkCopied: t.linkCopied,
                }}
              />
            </Reveal>

            <Reveal direction="up" delay={0.35}>
              <InsightCtaRow
                locale={locale}
                labels={{
                  explorePublications: t.explorePublications,
                  seeEvents: t.seeEvents,
                }}
              />
            </Reveal>
          </article>

          {related.length > 0 ? (
            <aside className="mt-16 border-t border-line pt-10">
              <Reveal direction="up" delay={0.1}>
                <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
                  {t.moreInsights}
                </h2>
                <span aria-hidden className="mt-3 inline-block h-px w-8 bg-accent" />
              </Reveal>

              <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item, idx) => (
                  <li key={item.id}>
                    <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                      <InsightCard item={item} index={idx} locale={locale} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
