import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { loadEvents, loadEventsPage } from "@/lib/sanity/loaders";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { eventSchema } from "@/lib/seo/schema";

/**
 * Dedicated event page at /[locale]/events/[slug].
 *
 * `output: "export"` means every (locale, slug) pair has to be enumerated
 * by `generateStaticParams` at build time. We fetch each locale's event
 * list once during params resolution; the page render then re-fetches and
 * filters by slug — Sanity dedupes via its CDN so the cost is minimal.
 *
 * Layout: full-width hero image on top, then a two-column body — main
 * content on the left, a "Recent events" sidebar on the right. The
 * sidebar collapses below the body on mobile.
 */

type Params = { locale: string; slug: string };

export async function generateStaticParams() {
  // Use English as the source of truth for slug enumeration — slugs aren't
  // localized (they're the same URL segment in every locale).
  const events = await loadEvents("en");
  const params: Params[] = [];
  for (const locale of locales) {
    for (const ev of events) {
      if (ev.slug) params.push({ locale, slug: ev.slug });
    }
  }
  // Next.js with `output: "export"` requires at least one param to
  // pre-render the route. When the dataset has no events with slugs yet
  // (fresh seed) we still need to register a placeholder so the build
  // can resolve the route — pick a clearly throwaway slug and let the
  // page itself call `notFound()` so the route returns a 404 page.
  if (params.length === 0) {
    for (const locale of locales) {
      params.push({ locale, slug: "_placeholder" });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) return {};
  const events = await loadEvents(locale as Locale);
  const event = events.find((e) => e.slug === slug);
  if (!event) return {};
  return {
    title: `${event.title} · HumanX`,
    description: event.summary || `${event.venue} · ${event.date}`,
    alternates: {
      canonical: `/${locale}/events/${slug}`,
      languages: {
        en: `/en/events/${slug}`,
        es: `/es/events/${slug}`,
        "x-default": `/en/events/${slug}`,
      },
    },
    openGraph: event.imageUrl
      ? { images: [{ url: event.imageUrl, alt: event.imageAlt || event.title }] }
      : undefined,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const [dict, events, eventsPage] = await Promise.all([
    getDictionary(locale as Locale),
    loadEvents(locale as Locale),
    loadEventsPage(locale as Locale),
  ]);

  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  // "Recent events" sidebar: every event except the one being viewed,
  // sorted most-recent-first by startsAt. Cap at 5 so the sidebar stays
  // readable. Upcoming entries appear first (positive time delta), then
  // past sorted newest-to-oldest.
  const now = Date.now();
  const sidebarEvents = events
    .filter((e) => e.slug !== slug)
    .sort((a, b) => {
      const aUp = new Date(a.startsAt).getTime() >= now;
      const bUp = new Date(b.startsAt).getTime() >= now;
      if (aUp !== bUp) return aUp ? -1 : 1;
      // Within same bucket: upcoming = soonest first, past = newest first.
      return aUp
        ? new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        : new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
    })
    .slice(0, 5);

  const isPast = new Date(event.startsAt).getTime() < now;
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const when = new Date(event.startsAt);
  const dayLabel = when.toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const backLabel = locale === "es" ? "← Volver a eventos" : "← Back to events";
  const recentLabel = locale === "es" ? "Eventos recientes" : "Recent events";
  const registerLabel =
    eventsPage?.book?.cta ??
    (locale === "es" ? "Reservar / Detalles" : "Register / Details");

  // Plain text body — newlines preserved via `whitespace-pre-line`. The
  // schema stores localizedText, so authors can write multi-paragraph
  // descriptions with blank lines between paragraphs.
  const bodyParagraphs = event.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main id="main" className="relative">
      <JsonLd data={eventSchema(event, locale as Locale)} />
      {/* HERO IMAGE — centered, contained "poster" presentation. Event
          posters often carry QR codes, dates, venue text — anything we'd
          crop with `object-cover` is information the visitor came for. So
          we use `object-contain` inside a max-width / max-height frame: the
          image always shows in full, the container letterboxes top/bottom
          (or left/right) as needed. Skipped entirely when no image has been
          uploaded yet. */}
      {event.imageUrl ? (
        <section className="px-6 pt-10 pb-2 md:pt-14">
          <div className="mx-auto flex max-w-3xl justify-center">
            {/* Native <img> rather than `next/image` — we have
                `images.unoptimized: true` (static export), so next/image is
                just a passthrough, and using <img> lets the rendered height
                track the natural aspect ratio of the uploaded asset instead
                of being locked to a fixed container ratio. `max-h-[70vh]`
                caps the height so portrait posters don't run the page off
                screen; `max-w-md` keeps landscape shots from going wider
                than ~28rem so QR codes / printed copy stay scan-sized
                rather than billboard-sized. */}
            <img
              src={event.imageUrl}
              alt={event.imageAlt || event.title}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-auto max-h-[70vh] max-w-md rounded-2xl border border-line bg-bg-elev/40 object-contain"
            />
          </div>
        </section>
      ) : null}

      <section className="relative px-6 pt-10 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-32">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center text-xs uppercase tracking-[0.3em] text-ink-dim hover:text-ink transition"
            >
              {backLabel}
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
            {/* ── Main content column ───────────────────────────────── */}
            <article>
              <Reveal direction="up" delay={0.05}>
                <div className="text-xs uppercase tracking-[0.3em] text-accent">
                  {isPast
                    ? locale === "es"
                      ? "Evento pasado"
                      : "Past event"
                    : locale === "es"
                      ? "Próximo evento"
                      : "Upcoming event"}
                  {event.date ? ` · ${event.date}` : null}
                </div>
              </Reveal>
              <Reveal direction="up" delay={0.1}>
                <h1 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-tight">
                  {event.title}
                </h1>
              </Reveal>
              <Reveal direction="up" delay={0.15}>
                <p className="mt-4 text-base text-ink-dim">
                  {event.venue ? `${event.venue} · ` : null}
                  <time dateTime={event.startsAt}>{dayLabel}</time>
                </p>
              </Reveal>

              {event.summary ? (
                <Reveal direction="up" delay={0.2}>
                  <p className="mt-8 max-w-2xl font-serif text-xl leading-snug text-ink">
                    {event.summary}
                  </p>
                </Reveal>
              ) : null}

              {bodyParagraphs.length > 0 ? (
                <Reveal direction="up" delay={0.25}>
                  <div className="mt-8 max-w-2xl space-y-5 font-serif text-base leading-relaxed text-ink-dim md:text-lg">
                    {bodyParagraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {/* Optional embedded recording — separate from the homepage
                  On Stage grid, which reads from `video` docs. */}
              {event.youtubeId ? (
                <Reveal direction="up" delay={0.3}>
                  <div className="mt-10 max-w-2xl">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${event.youtubeId}?rel=0`}
                      title={event.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full rounded-[var(--radius-card)] border border-line"
                    />
                  </div>
                </Reveal>
              ) : null}

              {event.registrationUrl ? (
                <Reveal direction="up" delay={0.35}>
                  <div className="mt-10">
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
                    >
                      {registerLabel}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </Reveal>
              ) : null}
            </article>

            {/* ── Sidebar: recent events ────────────────────────────── */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="up" delay={0.1}>
                <h2 className="text-xs uppercase tracking-[0.3em] text-ink-dim">
                  {recentLabel}
                </h2>
                {/* The accent rule + spacing here mirror the eyebrow style
                    used elsewhere so the sidebar reads like a related-content
                    block, not a navigation menu. */}
                <span aria-hidden className="mt-3 inline-block h-px w-8 bg-accent" />
              </Reveal>

              {sidebarEvents.length === 0 ? (
                <p className="mt-6 text-sm text-ink-dim">
                  {locale === "es"
                    ? "Sin otros eventos por ahora."
                    : "No other events listed yet."}
                </p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {sidebarEvents.map((rev) => (
                    <li key={rev.id}>
                      <Reveal direction="up" delay={0.05}>
                        <Link
                          href={
                            rev.slug
                              ? `/${locale}/events/${rev.slug}`
                              : `/${locale}/events`
                          }
                          className="group flex gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
                        >
                          {rev.imageUrl ? (
                            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={rev.imageUrl}
                                alt={rev.imageAlt || rev.title}
                                fill
                                sizes="80px"
                                className="object-cover transition duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-20 flex-shrink-0 rounded bg-bg-elev/40 border border-line" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.2em] text-accent line-clamp-1">
                              {rev.date}
                            </p>
                            <p className="mt-1 font-display text-sm leading-snug text-ink line-clamp-2 transition group-hover:text-accent">
                              {rev.title}
                            </p>
                          </div>
                        </Link>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              )}

              <Reveal direction="up" delay={0.2}>
                <Link
                  href={`/${locale}/events`}
                  className="mt-8 inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-accent hover:text-accent-bright"
                >
                  {locale === "es" ? "Ver todos" : "View all"} →
                </Link>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Re-use the homepage events block to nudge readers to other items.
          We pass the dict but no items: Events filters its own list by
          upcoming-only. Skip if the only upcoming event is the one we're
          already viewing. */}
      {/* (Intentionally omitted to keep the page focused — the sidebar
          and "back to events" link cover discovery without a second CTA.) */}
    </main>
  );
}
