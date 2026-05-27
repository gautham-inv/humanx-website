"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { EventsPageContent } from "@/lib/sanity/loaders";

/**
 * Row shape this component (and OnStage / EventsList) renders. Matches the
 * Sanity-localized payload from `lib/sanity/loaders.ts#loadEvents` and the
 * legacy dict row 1:1, so swapping data sources requires no markup change.
 */
export type EventRow = {
  id: string;
  title: string;
  venue: string;
  date: string;
  startsAt: string;
  youtubeId: string;
};

type EventsProps = {
  dict: Dictionary;
  locale: Locale;
  /** Sanity-sourced rows (already localized). Empty falls back to dict. */
  items?: readonly EventRow[];
  /** Resolved eventsPage singleton. Drives section headers + view-all label. */
  content?: EventsPageContent | null;
};

export function Events({
  dict,
  locale,
  items: itemsProp,
  content,
}: EventsProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const items: readonly EventRow[] =
    itemsProp && itemsProp.length > 0 ? itemsProp : dict.events.items;
  const title = content?.homepage.title ?? dict.events.title;
  const body = content?.homepage.body ?? dict.events.body;
  const noUpcoming = content?.noUpcoming ?? dict.events.noUpcoming;
  const viewAllLabel = content?.viewAllLabel ?? dict.events.viewAll;

  const upcoming =
    now === null
      ? []
      : items
          .filter((ev) => new Date(ev.startsAt).getTime() >= now)
          .sort(
            (a, b) =>
              new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );

  return (
    <section
      id="events"
      ref={ref}
      className="relative px-6 py-12 md:py-20 lg:py-24 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="mb-16 grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-end">
            <h2 className="font-display text-4xl md:text-5xl leading-[1.0] tracking-tight">{title}</h2>
            <p className="max-w-sm text-ink-dim md:pl-2">{body}</p>
            <span
              aria-hidden
              className="self-start font-display text-sm tabular-nums text-accent md:self-end"
              style={{ fontVariationSettings: '"slnt" -8' }}
            >
              2026 / 2027
            </span>
          </div>
        </Reveal>

        {now !== null && upcoming.length === 0 ? (
          <Reveal direction="up">
            <p className="text-ink-dim">{noUpcoming}</p>
          </Reveal>
        ) : (
          <Reveal direction="up" stagger={0.15} className="grid gap-6 md:grid-cols-2">
            {upcoming.map((ev) => {
              const when = new Date(ev.startsAt);
              const day = when.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { day: "2-digit" });
              const month = when.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: "short" }).toUpperCase();
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

        <div className="mt-12 flex justify-end">
          <Link
            href={`/${locale}/events`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-bright transition"
          >
            {viewAllLabel}
            <span aria-hidden className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
