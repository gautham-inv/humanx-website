import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadInsights, loadInsightsPage } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
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
    title: "Insights · HumanX",
    description:
      "Field notes and frameworks on customer and employee experience — practical thinking on making human experience the operating principle of your organization.",
  });
}

// Decorative fallback when an item has no image yet. Each card pulls a brand
// token (orange/violet/magenta) so the grid looks composed instead of empty.
// Using design tokens means a theme flip recolours these naturally.
const TILE_ROLES = [
  { hue: "var(--color-accent)", angle: 130 },
  { hue: "var(--color-violet)", angle: 25 },
  { hue: "var(--color-magenta)", angle: 215 },
  { hue: "var(--color-accent)", angle: 305 },
  { hue: "var(--color-violet)", angle: 95 },
  { hue: "var(--color-magenta)", angle: 165 },
] as const;

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
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
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

      {/* Card grid. When item.image is provided, the tile fills with that
       * photo; otherwise we render a brand-token decorative tile so the grid
       * never has empty placeholders. Cards are not interactive until real
       * detail pages exist (current item.href values are anchors-only). */}
      <section className="relative px-6 py-10 md:py-16 lg:py-24 border-t border-line">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
              {listTitle}
            </h2>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              const role = TILE_ROLES[idx % TILE_ROLES.length];
              const hasImage = Boolean(item.image);
              // Sanity-sourced items may carry author-provided alt text;
              // dict fallback items don't have the field, so we default to
              // the title for accessibility either way.
              const imageAlt =
                ("imageAlt" in item && (item as { imageAlt?: string }).imageAlt) || item.title;
              // Real external link (LinkedIn post, etc.). Dict items use
              // anchor-only hrefs like "#i1" — treat those as non-clickable.
              const externalHref = item.href && /^https?:\/\//.test(item.href) ? item.href : "";
              const cardInner = (
                <article className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                    {hasImage ? (
                      <Image
                        src={item.image}
                        alt={imageAlt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(120% 90% at ${30 + (idx % 3) * 20}% ${30 + (idx % 2) * 30}%, color-mix(in oklch, ${role.hue} 35%, transparent), transparent 65%), linear-gradient(${role.angle}deg, var(--color-bg-elev), var(--color-bg))`,
                        }}
                      />
                    )}
                    {!hasImage && (
                      <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                          backgroundImage:
                            "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                        }}
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute left-5 top-5 font-display text-2xl tabular-nums text-ink/80 mix-blend-difference"
                      style={{ fontVariationSettings: '"SHRP" 80' }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-4 px-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
                      {item.kind} · {item.date}
                    </div>
                    <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl transition group-hover:text-accent">
                      {item.title}
                    </h3>
                  </div>
                </article>
              );
              return (
                <li key={item.id}>
                  <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                    {externalHref ? (
                      <a
                        href={externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
                      >
                        {cardInner}
                      </a>
                    ) : (
                      cardInner
                    )}
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
