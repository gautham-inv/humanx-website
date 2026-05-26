import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Reveal } from "@/components/motion/Reveal";

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
  return {
    title: "Insights · HumanX",
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
  const dict = await getDictionary(locale as Locale);
  const t = dict.insights;

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
              {t.title}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">{t.body}</p>
          </Reveal>
        </div>
      </section>

      {/* Card grid. When item.image is provided, the tile fills with that
       * photo; otherwise we render a brand-token decorative tile so the grid
       * never has empty placeholders. Cards are not interactive until real
       * detail pages exist (current item.href values are anchors-only). */}
      <section className="relative px-6 py-16 md:py-24 border-t border-line">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
              {t.listTitle}
            </h2>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {t.items.map((item, idx) => {
              const role = TILE_ROLES[idx % TILE_ROLES.length];
              const hasImage = Boolean(item.image);
              return (
                <li key={item.id}>
                  <Reveal direction="up" delay={Math.min(idx * 0.04, 0.2)}>
                    <article className="group">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                        {hasImage ? (
                          <Image
                            src={item.image}
                            alt={item.title}
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
                        <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl">
                          {item.title}
                        </h3>
                      </div>
                    </article>
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
