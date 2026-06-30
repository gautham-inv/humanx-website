"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";
import type { SummitBarContent, EventItem } from "@/lib/sanity/loaders";
import { prefersReducedMotion } from "@/lib/motion";

type SummitBarProps = {
  dict: Dictionary;
  locale: Locale;
  /**
   * Sanity-resolved summitBar singleton. Two control levers:
   *   `enabled: false`           → hide the bar entirely
   *   `text` (any non-empty)     → use this as the headline (manual override)
   * If `text` is empty AND the events list contains an upcoming entry, the
   * bar auto-promotes the soonest one with a link to its detail page.
   */
  content?: SummitBarContent | null;
  /**
   * Full events list from Sanity. The bar filters client-side for
   * `startsAt >= now()` so it doesn't promote yesterday's event after the
   * static build has gone stale.
   */
  events?: readonly EventItem[];
};

/**
 * Collapse an absolute URL that points at our own site — the staging
 * *.pages.dev preview build or the production host — down to a path. Content
 * authors paste full preview URLs into the summitBar `ctaUrl` field (e.g.
 * https://humanx-website.pages.dev/en/events/…), which would otherwise ship to
 * production as a hard link back to staging. Reducing it to a path makes the
 * link follow whatever host serves the page and lets it render as an internal
 * <Link>. Genuinely external URLs (Eventbrite, etc.) are left untouched.
 */
function normalizeOwnHostUrl(url: string): string {
  try {
    const { hostname, pathname, search, hash } = new URL(url);
    const ownHost =
      hostname.endsWith(".pages.dev") ||
      hostname === "humanxinsights.com" ||
      hostname.endsWith(".humanxinsights.com");
    if (ownHost) return `${pathname}${search}${hash}`;
  } catch {
    // Relative URL (no origin) — already host-agnostic, nothing to collapse.
  }
  return url;
}

export function SummitBar({ dict, locale, content, events }: SummitBarProps) {
  // Hide entirely if the author flipped the kill-switch.
  if (content && content.enabled === false) return null;

  const ref = useRef<HTMLDivElement | null>(null);

  // Filter for upcoming events client-side using `Date.now()` so the bar
  // doesn't keep promoting an event after it's already passed (the static
  // build won't re-run until a redeploy). During SSR / initial render
  // `now === null` and we treat the events list as empty — so the bar
  // hides until hydration, avoiding the flicker of "show a past event,
  // then re-filter and hide" the previous implementation produced.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Pick the soonest upcoming event when no manual text is set in the
  // summitBar singleton. Manual text always wins; this is the auto fallback.
  const manualText = content?.text;
  const upcoming =
    events && now !== null
      ? events
          .filter((e) => new Date(e.startsAt).getTime() >= now)
          .sort(
            (a, b) =>
              new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          )
      : [];
  const nextEvent =
    !manualText && upcoming.length > 0 ? upcoming[0] : undefined;

  // Resolve the headline text. Precedence:
  //   1. Manual text in the summitBar singleton
  //   2. Auto-promoted next upcoming event (from the events list)
  //   3. Nothing — in which case the bar hides entirely. NO dict fallback
  //      here: the dict default ("Ramon keynoting…") is just placeholder
  //      copy, and showing it after every event has passed makes the strip
  //      lie. Static export still keeps this dynamic: the events list is
  //      build-time, but the upcoming/past split runs client-side via
  //      `Date.now()` after hydration.
  const text = manualText
    ? manualText
    : nextEvent
      ? nextEvent.date
        ? `${nextEvent.title} · ${nextEvent.date}`
        : nextEvent.title
      : "";

  // Don't render anything when there's no content to show. Returning null
  // here also frees the vertical real estate so the nav slides up to the
  // top of the viewport — no empty strip artefact.
  if (!text) return null;

  const label = content?.label ?? dict.summit.label;
  const cta = content?.cta ?? dict.summit.cta;
  // Internal link to the event detail page when auto-picked; otherwise the
  // author-supplied URL or a sensible default to the events listing.
  const ctaUrl = normalizeOwnHostUrl(
    nextEvent?.slug
      ? `/${locale}/events/${nextEvent.slug}`
      : content?.ctaUrl ?? `/${locale}/events`
  );
  const isInternal = ctaUrl.startsWith("/");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const dot = ref.current?.querySelector("[data-live-dot]");
      if (dot) {
        gsap.to(dot, {
          opacity: 0.3,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      const sheen = ref.current?.querySelector("[data-sheen]");
      if (sheen) {
        gsap.fromTo(
          sheen,
          { xPercent: -120 },
          { xPercent: 220, duration: 4, repeat: -1, ease: "power2.inOut", repeatDelay: 2 }
        );
      }
    },
    { scope: ref }
  );

  return (
    <div
      ref={ref}
      className="relative z-50 overflow-hidden border-b border-line bg-gradient-to-r from-accent/8 via-violet/5 to-magenta/8"
    >
      <div
        data-sheen
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
      {/* `py-1.5` keeps this strip ~26px tall so the combined SummitBar +
          Nav heights stay close to the old standalone Nav height. */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-1 px-6 py-1.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-magenta/60 bg-magenta/15 px-2 py-0.5 text-magenta">
            <span data-live-dot className="block h-1.5 w-1.5 rounded-full bg-magenta" />
            {label}
          </span>
          <span className="truncate text-ink-dim">{text}</span>
        </div>
        {isInternal ? (
          <Link
            href={ctaUrl}
            className="shrink-0 text-ink-dim transition-colors hover:text-ink"
          >
            {cta} →
          </Link>
        ) : (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-ink-dim transition-colors hover:text-ink"
          >
            {cta} →
          </a>
        )}
      </div>
    </div>
  );
}
