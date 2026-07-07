import Image from "next/image";
import Link from "next/link";

/**
 * Loose shape so both real `InsightItem` rows (lib/sanity/loaders.ts) and
 * the dict-fallback teaser objects in lib/i18n/dictionaries/en.ts's
 * `insights.items` satisfy this type — the fallback objects don't carry
 * `slug`/`body`/`imageAlt`, which is fine since those are optional here.
 */
export type InsightCardData = {
  id: string;
  title: string;
  kind: string;
  date: string;
  href?: string;
  slug?: string;
  /** Portable Text blocks (real insights) — absent/empty for teaser-only
   * insights and dict-fallback items. Only array length is checked here. */
  body?: unknown[];
  image?: string;
  imageAlt?: string;
};

// Decorative fallback when an item has no image yet. Each card pulls a brand
// token (orange/violet/magenta) so the grid looks composed instead of empty.
// Using design tokens means a theme flip recolours these naturally.
export const TILE_ROLES = [
  { hue: "var(--color-accent)", angle: 130 },
  { hue: "var(--color-violet)", angle: 25 },
  { hue: "var(--color-magenta)", angle: 215 },
  { hue: "var(--color-accent)", angle: 305 },
  { hue: "var(--color-violet)", angle: 95 },
  { hue: "var(--color-magenta)", angle: 165 },
] as const;

/**
 * One insight card. Links to the on-site /insights/[slug] page when the
 * insight has both a slug and a body (i.e. a dedicated page was actually
 * generated for it at build time — see loadInsights's build-safety
 * fallback). Otherwise falls back to an external `href` if present, or
 * renders non-interactive.
 */
export function InsightCard({
  item,
  index,
  locale,
}: {
  item: InsightCardData;
  index: number;
  locale: string;
}) {
  const role = TILE_ROLES[index % TILE_ROLES.length];
  const hasImage = Boolean(item.image);
  const imageAlt = item.imageAlt || item.title;
  const hasDetailPage = Boolean(item.slug && item.body && item.body.length > 0);
  const externalHref =
    !hasDetailPage && item.href && /^https?:\/\//.test(item.href)
      ? item.href
      : "";

  const cardInner = (
    <article className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
        {hasImage ? (
          <Image
            src={item.image as string}
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
              background: `radial-gradient(120% 90% at ${30 + (index % 3) * 20}% ${30 + (index % 2) * 30}%, color-mix(in oklch, ${role.hue} 35%, transparent), transparent 65%), linear-gradient(${role.angle}deg, var(--color-bg-elev), var(--color-bg))`,
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
          {String(index + 1).padStart(2, "0")}
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

  if (hasDetailPage) {
    return (
      <Link
        href={`/${locale}/insights/${item.slug}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {cardInner}
      </Link>
    );
  }

  if (externalHref) {
    return (
      <a
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {cardInner}
      </a>
    );
  }

  return cardInner;
}
