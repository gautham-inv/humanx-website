"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { EventRow } from "@/components/sections/Events";
import type { EventsPageContent } from "@/lib/sanity/loaders";

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
                      {ev.summary ? (
                        <p className="mt-2 text-sm text-ink-dim/80 line-clamp-2">
                          {ev.summary}
                        </p>
                      ) : null}
                    </div>
                    {ev.imageUrl ? (
                      <div className="relative hidden h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg sm:block">
                        <Image
                          src={ev.imageUrl}
                          alt={ev.imageAlt || ev.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </>
                );
                const cardClass =
                  "flex items-start gap-6 p-6 rounded-2xl border border-line bg-bg-elev/30 backdrop-blur-sm transition hover:border-cta/60";
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
              {past.map((ev) => {
                const internalHref = ev.slug ? `/${locale}/events/${ev.slug}` : "";
                // Card visual is the uploaded image (or a neutral placeholder
                // when none exists yet). Past-event recordings live in the
                // homepage On Stage grid now — they're separate Video docs.
                const media = ev.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-line">
                    <Image
                      src={ev.imageUrl}
                      alt={ev.imageAlt || ev.title}
                      fill
                      sizes="(min-width: 768px) 45vw, 95vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-[var(--radius-card)] border border-line bg-bg-elev/40" />
                );
                const meta = (
                  <div>
                    <h3 className="font-display text-xl transition group-hover:text-accent">{ev.title}</h3>
                    <p className="mt-1 text-sm text-ink-dim">
                      {ev.venue} · {ev.date}
                    </p>
                    {ev.summary ? (
                      <p className="mt-2 text-sm text-ink-dim/80 line-clamp-2">
                        {ev.summary}
                      </p>
                    ) : null}
                  </div>
                );
                if (internalHref) {
                  return (
                    <Link
                      key={ev.id}
                      data-reveal-child
                      href={internalHref}
                      className="group block space-y-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright rounded-sm"
                    >
                      {media}
                      {meta}
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
                      className="group block space-y-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright rounded-sm"
                    >
                      {media}
                      {meta}
                    </a>
                  );
                }
                return (
                  <article key={ev.id} data-reveal-child className="space-y-4 group">
                    {media}
                    {meta}
                  </article>
                );
              })}
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
