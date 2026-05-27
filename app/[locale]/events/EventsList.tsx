"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { EventRow } from "@/components/sections/Events";
import type { EventsPageContent } from "@/lib/sanity/loaders";

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
      <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_0_60px_-10px_var(--color-accent)] transition group-hover:scale-110">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  );
}

type EventsListProps = {
  dict: Dictionary;
  locale: Locale;
  /** Sanity-sourced events. Empty falls back to dict items. */
  items?: readonly EventRow[];
  /** Section headers + empty-state strings from the eventsPage singleton. */
  content?: EventsPageContent | null;
};

export function EventsList({
  dict,
  locale,
  items: itemsProp,
  content,
}: EventsListProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const items: readonly EventRow[] =
    itemsProp && itemsProp.length > 0 ? itemsProp : dict.events.items;
  const upcomingHeading = content?.upcomingHeading ?? dict.events.upcomingHeading;
  const pastHeading = content?.pastHeading ?? dict.events.pastHeading;
  const noUpcoming = content?.noUpcoming ?? dict.events.noUpcoming;
  const noPast = content?.noPast ?? dict.events.noPast;
  const upcoming =
    now === null
      ? []
      : items
          .filter((ev) => new Date(ev.startsAt).getTime() >= now)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const past =
    now === null
      ? []
      : items
          .filter((ev) => new Date(ev.startsAt).getTime() < now)
          .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <>
      <section className="relative px-6 py-10 md:py-16 lg:py-24 border-t border-line">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <h2 className="font-display text-3xl md:text-4xl">{upcomingHeading}</h2>
          </Reveal>

          {now !== null && upcoming.length === 0 ? (
            <Reveal direction="up">
              <p className="mt-8 text-ink-dim">{noUpcoming}</p>
            </Reveal>
          ) : (
            <Reveal direction="up" stagger={0.1} className="mt-12 grid gap-6 md:grid-cols-2">
              {upcoming.map((ev) => {
                const when = new Date(ev.startsAt);
                const day = when.toLocaleDateString(dateLocale, { day: "2-digit" });
                const month = when.toLocaleDateString(dateLocale, { month: "short" }).toUpperCase();
                return (
                  <article
                    key={ev.id}
                    data-reveal-child
                    className="flex items-start gap-6 p-6 rounded-2xl border border-line bg-bg-elev/30 backdrop-blur-sm transition hover:border-accent/60"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-line bg-bg">
                      <span className="font-display text-2xl leading-none text-accent">{day}</span>
                      <span className="mt-1 text-[10px] tracking-[0.2em] text-ink-dim">{month}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl">{ev.title}</h3>
                      <p className="mt-1 text-sm text-ink-dim">
                        {ev.venue} · {ev.date}
                      </p>
                    </div>
                  </article>
                );
              })}
            </Reveal>
          )}
        </div>
      </section>

      <section className="relative px-6 py-10 md:py-16 lg:py-24 border-t border-line">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <h2 className="font-display text-3xl md:text-4xl">{pastHeading}</h2>
          </Reveal>

          {now !== null && past.length === 0 ? (
            <Reveal direction="up">
              <p className="mt-8 text-ink-dim">{noPast}</p>
            </Reveal>
          ) : (
            <Reveal direction="up" stagger={0.15} className="mt-12 grid gap-10 md:grid-cols-2">
              {past.map((ev) => (
                <article key={ev.id} data-reveal-child className="space-y-4">
                  {ev.youtubeId ? (
                    <LiteYouTube id={ev.youtubeId} title={ev.title} />
                  ) : (
                    <div className="aspect-video w-full rounded-[var(--radius-card)] border border-line bg-bg-elev/40" />
                  )}
                  <div>
                    <h3 className="font-display text-xl">{ev.title}</h3>
                    <p className="mt-1 text-sm text-ink-dim">
                      {ev.venue} · {ev.date}
                    </p>
                  </div>
                </article>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
