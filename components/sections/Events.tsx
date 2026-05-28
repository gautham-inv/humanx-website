"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  /**
   * Slug for the dedicated event page at /events/[slug]. When present, the
   * card links internally (preferred). Empty / undefined falls back to
   * `registrationUrl`, and then to a plain non-interactive article.
   */
  slug?: string;
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
  /**
   * External URL — used as the link target when no internal slug exists.
   * Also surfaced as a "Register" CTA on the detail page when both are set.
   */
  registrationUrl?: string;
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
              // Same visual card whether the event is clickable or not — we
              // just swap the outer element. Linking precedence:
              //   1. internal /events/[slug] (preferred — keeps users on-site)
              //   2. external registrationUrl
              //   3. plain non-interactive article
              const internalHref = ev.slug ? `/${locale}/events/${ev.slug}` : "";
              const inner = (
                <>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-line bg-bg">
                    <span className="font-display text-2xl leading-none text-accent">{day}</span>
                    <span className="mt-1 text-[10px] tracking-[0.2em] text-ink-dim">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl">{ev.title}</h3>
                    <p className="mt-1 text-sm text-ink-dim">
                      {ev.venue} · {ev.date}
                    </p>
                  </div>
                  {ev.imageUrl ? (
                    <div className="relative hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                      <Image
                        src={ev.imageUrl}
                        alt={ev.imageAlt || ev.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </>
              );
              const cardClass =
                "flex items-start gap-6 p-6 rounded-2xl border border-line bg-bg-elev/30 backdrop-blur-sm transition hover:border-accent/60";
              if (internalHref) {
                return (
                  <Link
                    key={ev.id}
                    data-reveal-child
                    href={internalHref}
                    className={`${cardClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright`}
                  >
                    {inner}
                  </Link>
                );
              }
              if (ev.registrationUrl) {
                return (
                  <a
                    key={ev.id}
                    data-reveal-child
                    href={ev.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${cardClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright`}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <article key={ev.id} data-reveal-child className={cardClass}>
                  {inner}
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
