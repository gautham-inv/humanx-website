"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";

type FeaturedVideoProps = {
  eyebrow: string;
  title: string;
  body: string;
  youtubeId: string;
};

/**
 * A single "featured insight" video block, à la the video section on peer
 * speaker sites. Renders a lite player — a thumbnail with a play button that
 * only swaps in the YouTube iframe on click, so the page doesn't pay the
 * cost of loading YouTube's player on every visit. Text sits left, video
 * right on desktop; stacked on mobile.
 */
export function FeaturedVideo({ eyebrow, title, body, youtubeId }: FeaturedVideoProps) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

  return (
    <section
      id="featured-video"
      aria-label={title}
      className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
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
            <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ink-dim">
              {body}
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.1}>
          {active ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-accent shadow-glow transition group-hover:scale-110">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </Reveal>
      </div>
    </section>
  );
}
