"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { getLenis } from "@/lib/lenis";

type FeaturedVideoProps = {
  eyebrow: string;
  title: string;
  body: string;
  youtubeId: string;
  /** Optional outbound link (e.g. a related blog post) shown below the video. */
  blogUrl?: string;
  blogLabel?: string;
};

/**
 * A single "featured insight" video block, à la the video section on peer
 * speaker sites. Renders a lite player — a thumbnail with a play button that
 * only swaps in the YouTube iframe on click, so the page doesn't pay the
 * cost of loading YouTube's player on every visit. Text sits left, video
 * right on desktop; stacked on mobile.
 */
export function FeaturedVideo({
  eyebrow,
  title,
  body,
  youtubeId,
  blogUrl,
  blogLabel,
}: FeaturedVideoProps) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

  // The YouTube iframe is cross-origin, so Lenis (smooth scroll) can't read
  // wheel events over it and animates the page back to its last target —
  // the "pull back" when you scroll over the playing video. While the pointer
  // is over the active iframe we pause Lenis so the wheel scrolls the page
  // natively, then resume on leave. Always resume on unmount so smooth scroll
  // is never left disabled.
  useEffect(() => {
    return () => {
      getLenis()?.start();
    };
  }, []);

  return (
    <section
      id="featured-video"
      aria-label={title}
      className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal direction="up">
            <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h2 className="font-display text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
              {body}
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.15} className="mt-10 block md:mt-14">
          <div
            className="mx-auto w-full"
            onMouseEnter={() => {
              if (active) getLenis()?.stop();
            }}
            onMouseLeave={() => getLenis()?.start()}
          >
          {active ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              data-lenis-prevent
              className="aspect-video w-full rounded-[var(--radius-card)] border border-line"
            />
          ) : (
            <button
              type="button"
              onClick={() => setActive(true)}
              aria-label={`Play: ${title}`}
              className="group relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-line focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
            >
              <img
                src={thumb}
                alt=""
                width={1280}
                height={720}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cta text-on-accent shadow-glow transition group-hover:scale-110">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
          </div>
        </Reveal>

        {blogUrl ? (
          <Reveal direction="up" delay={0.2} className="mt-8 block text-center">
            <a
              href={blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-accent underline underline-offset-4 transition hover:text-accent-bright"
            >
              {blogLabel || "Read the related article"}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
