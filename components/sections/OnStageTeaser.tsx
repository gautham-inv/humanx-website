import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { VideoItem } from "@/lib/sanity/loaders";
import { resolveVideos } from "./on-stage/resolve-videos";

/**
 * A single teaser tile. Today it shows a still poster (a YouTube thumbnail)
 * linking through to /on-stage. When real looping clips are ready, pass
 * `webmSrc` and it renders a muted autoplay `<video>` instead — a one-prop
 * swap, no markup change for callers.
 */
function PosterTile({
  poster,
  webmSrc,
  href,
  label,
}: {
  poster: string;
  webmSrc?: string;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group relative block aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-line focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
    >
      {webmSrc ? (
        <video
          src={webmSrc}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <img
          src={poster}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-accent shadow-glow transition group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </Link>
  );
}

type OnStageTeaserProps = {
  dict: Dictionary;
  locale: Locale;
  /** Sanity-sourced videos; falls back to past events via `resolveVideos`. */
  items?: readonly VideoItem[];
};

/**
 * Homepage "on stage" teaser. A centered credentials line, headline, and CTA
 * point visitors to the full /on-stage page; beneath sit two poster tiles
 * pulled from the most recent talks (still images for now, swappable to
 * looping clips later — see PosterTile).
 */
export function OnStageTeaser({ dict, locale, items }: OnStageTeaserProps) {
  const t = dict.onStage;
  const videos = resolveVideos(items, dict);
  const posters = videos.slice(0, 2);
  if (posters.length === 0) return null;

  const href = `/${locale}/on-stage`;

  return (
    <section
      id="on-stage"
      className="relative border-t border-line px-6 py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal direction="up">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
              {t.credentials}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <HighlightedTitle
              as="h2"
              className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight"
            >
              {t.teaserTitle}
            </HighlightedTitle>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
              {t.teaserBody}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.15}>
            <div className="mt-8 flex justify-center">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright"
              >
                {t.cta}
                <span aria-hidden className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal
          direction="up"
          delay={0.1}
          stagger={0.12}
          className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8"
        >
          {posters.map((v) => (
            <div data-reveal-child key={v.id}>
              <PosterTile
                poster={`https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`}
                href={href}
                label={`${t.cta}: ${v.title}`}
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
