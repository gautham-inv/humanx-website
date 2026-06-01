"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { VideoItem } from "@/lib/sanity/loaders";

/**
 * Lite YouTube embed — renders the thumbnail with a play button and only
 * swaps in the iframe on click, so the page never pays the cost of YouTube's
 * player until the visitor actually wants it.
 */
function LiteYouTube({ id, title }: { id: string; title: string }) {
  const [active, setActive] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  if (active) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-[var(--radius-card)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-line"
      aria-label={`Play ${title}`}
    >
      <img
        src={thumb}
        alt=""
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-accent shadow-glow transition group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}

/**
 * Responsive grid of lite YouTube players. Used by the /on-stage page to list
 * every recorded keynote.
 */
export function VideoGrid({ videos }: { videos: readonly VideoItem[] }) {
  if (videos.length === 0) return null;

  return (
    <Reveal direction="up" stagger={0.15} className="grid gap-10 md:grid-cols-2">
      {videos.map((v) => (
        <article key={v.id} data-reveal-child className="space-y-4">
          <LiteYouTube id={v.youtubeId} title={v.title} />
          <div>
            <h3 className="font-display text-xl">{v.title}</h3>
            {v.caption ? (
              <p className="mt-1 text-sm text-ink-dim">{v.caption}</p>
            ) : null}
          </div>
        </article>
      ))}
    </Reveal>
  );
}
