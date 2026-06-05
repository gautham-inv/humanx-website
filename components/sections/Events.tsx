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
          <div className="mb-16">
            <h2 className="font-display text-4xl md:text-5xl leading-[1.0] tracking-tight">{title}</h2>
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
                  {/* Image-led header: the event image (or a branded
                      placeholder) fills the top of the card on every
                      breakpoint, with the date badge overlaid. */}
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-bg-elev">
                    {ev.imageUrl ? (
                      <Image
                        src={ev.imageUrl}
                        alt={ev.imageAlt || ev.title}
                        fill
                        sizes="(min-width: 768px) 32rem, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-violet/30 via-bg-elev to-magenta/20" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-col items-center justify-center rounded-xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-sm">
                      <span className="font-display text-2xl leading-none text-white">{day}</span>
                      <span className="mt-1 text-[10px] tracking-[0.2em] text-white/70">{month}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl">{ev.title}</h3>
                    <p className="mt-1 text-sm text-ink-dim">
                      {ev.venue} · {ev.date}
                    </p>
                  </div>
                </>
              );
              const cardClass =
                "group flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-elev/30 backdrop-blur-sm transition hover:border-cta/60";
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
