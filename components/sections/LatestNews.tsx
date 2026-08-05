import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { aspectCropLoader } from "@/lib/sanity/image-loader";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { NewsItem } from "@/lib/sanity/loaders";

// News cards render in a fixed 16:9 frame; crop author uploads to that ratio
// at the CDN so every card is framed identically (see image-loader).
const NEWS_CARD_LOADER = aspectCropLoader(16, 9);

/** Most recent items to surface. Older ones roll off automatically. */
const MAX_ITEMS = 3;

/**
 * Grid layout adapts to how many items are actually showing, rather than
 * always reserving 3 columns: a single item centers instead of hugging the
 * left edge, two items sit as an evenly-spaced centered pair, three fill a
 * full row, and four (if `MAX_ITEMS` is ever raised) become a 4-up grid.
 */
function gridClassesFor(count: number): string {
  switch (count) {
    case 1:
      return "mx-auto max-w-md grid-cols-1";
    case 2:
      return "mx-auto max-w-3xl grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  }
}

/**
 * Homepage "Latest news" section — press mentions linking out to the
 * publisher. Anchored at `#news` so it can be linked directly from social
 * posts (e.g. humanxinsights.com/en#news).
 *
 * Renders nothing when no news item is enabled, so the homepage shows no
 * empty box before the first article is published.
 */
export function LatestNews({
  dict,
  items,
}: {
  dict: Dictionary;
  items: NewsItem[];
}) {
  const t = dict.news;
  const visible = items.slice(0, MAX_ITEMS);
  if (visible.length === 0) return null;

  return (
    <section
      id="news"
      className="relative scroll-mt-24 border-t border-line px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {t.eyebrow}
          </div>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight">
            {t.title}
          </h2>
        </Reveal>

        <ul className={`mt-10 grid gap-8 ${gridClassesFor(visible.length)}`}>
          {visible.map((item, idx) => {
            const meta = [item.source, item.date].filter(Boolean).join(" · ");
            const paragraphs = item.body
              .split(/\n{2,}/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
              <li key={item.id}>
                <Reveal direction="up" delay={Math.min(idx * 0.05, 0.2)}>
                  <article className="group flex h-full flex-col">
                    {item.imageUrl ? (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
                        <Image
                          loader={NEWS_CARD_LOADER}
                          src={item.imageUrl}
                          alt={item.imageAlt || item.title}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}

                    <div className={item.imageUrl ? "mt-5" : ""}>
                      {meta ? (
                        <div className="text-[11px] uppercase tracking-[0.2em] text-accent">
                          {meta}
                        </div>
                      ) : null}
                      <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl">
                        {item.title}
                      </h3>
                      {paragraphs.length > 0 ? (
                        <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-dim">
                          {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <a
                      href={item.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 self-start text-sm font-medium text-accent transition hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                    >
                      {t.readArticle}
                      <span aria-hidden>↗</span>
                    </a>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
