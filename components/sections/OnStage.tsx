"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent, VideoItem } from "@/lib/sanity/loaders";

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

type OnStageProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced video docs (decoupled from `event` so a video can exist
   * without an event and vice versa). Empty falls back to the dict-derived
   * legacy shape that piggybacked on past events.
   */
  items?: readonly VideoItem[];
  /** Section header copy from the homepage singleton. Per-field dict fallback. */
  content?: HomepageContent["onStage"];
};

export function OnStage({ dict, items: itemsProp, content }: OnStageProps) {
  const title = content?.title ?? dict.onStage.title;
  const body = content?.body ?? dict.onStage.body;
  // `note` is small static UI flair, not editable in the studio — keep dict.
  const note = dict.onStage.note;
  const ref = useRef<HTMLElement | null>(null);

  // Map dict events (legacy shape, has youtubeId + title + venue + date) into
  // the VideoItem shape only when Sanity returned nothing. Once an author
  // creates real `video` docs in the studio, this branch is dead code — but
  // it keeps the homepage from going blank on a fresh-dataset deploy.
  const videos: readonly VideoItem[] =
    itemsProp && itemsProp.length > 0
      ? itemsProp
      : dict.events.items
          .filter((ev) => Boolean(ev.youtubeId))
          .map((ev) => ({
            id: ev.id,
            title: ev.title,
            caption: `${ev.venue} · ${ev.date}`,
            youtubeId: ev.youtubeId,
          }));

  if (videos.length === 0) return null;

  return (
    <section
      id="speaking"
      ref={ref}
      className="relative px-6 py-16 md:py-24 lg:py-32 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.0] tracking-tight">{title}</h2>
              <p
                className="mt-3 text-xs text-ink-dim"
                style={{ fontVariationSettings: '"slnt" -8' }}
              >
                ({note})
              </p>
            </div>
            <p className="max-w-sm text-ink-dim">{body}</p>
          </div>
        </Reveal>

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
      </div>
    </section>
  );
}
