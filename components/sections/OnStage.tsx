"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

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

export function OnStage({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const past =
    now === null
      ? dict.events.items
      : dict.events.items
          .filter((ev) => ev.youtubeId && new Date(ev.startsAt).getTime() < now)
          .sort(
            (a, b) =>
              new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
          );

  if (past.length === 0) return null;

  return (
    <section
      id="speaking"
      ref={ref}
      className="relative px-6 py-28 md:py-40 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.0] tracking-tight">{dict.onStage.title}</h2>
              <p
                className="mt-3 text-xs text-ink-dim"
                style={{ fontVariationSettings: '"slnt" -8' }}
              >
                ({dict.onStage.note})
              </p>
            </div>
            <p className="max-w-sm text-ink-dim">{dict.onStage.body}</p>
          </div>
        </Reveal>

        <Reveal direction="up" stagger={0.15} className="grid gap-10 md:grid-cols-2">
          {past.map((ev) => (
            <article key={ev.id} data-reveal-child className="space-y-4">
              <LiteYouTube id={ev.youtubeId} title={ev.title} />
              <div>
                <h3 className="font-display text-xl">{ev.title}</h3>
                <p className="mt-1 text-sm text-ink-dim">
                  {ev.venue} · {ev.date}
                </p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
