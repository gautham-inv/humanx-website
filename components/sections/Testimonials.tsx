"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { HomepageContent } from "@/lib/sanity/loaders";
import { prefersReducedMotion } from "@/lib/motion";
import { BackdropMesh } from "@/components/motion/Backdrops";

const AUTO_MS = 6500;

/**
 * Carousel item shape after the page component has picked a locale from the
 * Sanity-localized fields. Matches the legacy `dict.testimonials.items` rows
 * exactly so the markup below doesn't care where the data came from.
 */
export type TestimonialItem = {
  id: string;
  quote: string;
  author: string;
  org?: string;
  /** Sanity CDN URL of the author headshot. Empty / undefined → no avatar. */
  imageUrl?: string;
  imageAlt?: string;
  /**
   * LinkedIn profile URL. When set, the avatar + author block becomes a
   * link that opens LinkedIn in a new tab.
   */
  linkedinUrl?: string;
};

type TestimonialsProps = {
  dict: Dictionary;
  /**
   * Sanity-sourced items (already localized for the current page locale).
   * When the array is empty (Sanity returned nothing, or the env was
   * misconfigured during build) we fall back to the dict items so the
   * section never renders blank.
   */
  items?: TestimonialItem[];
  /**
   * Section header copy from the homepage singleton — eyebrow/heading/etc.
   * Falls back to dict on each field independently.
   */
  content?: HomepageContent["testimonials"];
};

export function Testimonials({
  dict,
  items: itemsProp,
  content,
}: TestimonialsProps) {
  const items: readonly TestimonialItem[] =
    itemsProp && itemsProp.length > 0 ? itemsProp : dict.testimonials.items;
  const heading = content?.heading ?? dict.testimonials.heading;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);

  const go = useCallback(
    (next: number) => {
      const n = ((next % items.length) + items.length) % items.length;
      setIndex(n);
    },
    [items.length]
  );

  // Auto-advance (paused on hover/focus + reduced-motion).
  useEffect(() => {
    if (paused) return;
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  // Cross-fade when index changes.
  useGSAP(
    () => {
      if (!quoteRef.current) return;
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        quoteRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    },
    { scope: ref, dependencies: [index] }
  );

  const current = items[index];

  return (
    <section
      ref={ref}
      aria-label={heading}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      className="relative overflow-hidden border-t border-line px-6 py-12 md:py-20 lg:py-24"
    >
      <BackdropMesh
        cell={30}
        opacity={0.1}
        strokeWidth={0.55}
        fade="radial"
        feather="center"
      />
      <div className="relative mx-auto max-w-4xl">
        <span
          aria-hidden
          className="block font-serif text-[clamp(5rem,12vw,9rem)] leading-[0.7] text-accent/40 select-none"
        >
          &ldquo;
        </span>

        <div
          ref={quoteRef}
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 min-h-[14rem] md:min-h-[12rem]"
        >
          <blockquote className="font-serif text-2xl md:text-4xl leading-[1.25] text-ink italic">
            {current.quote}
          </blockquote>
          <figcaption className="mt-6 text-sm text-ink-dim">
            {/* The avatar + author block is one clickable unit when the
                author has a LinkedIn URL set in Sanity — opens the profile
                in a new tab. Without a URL the same content renders as a
                non-interactive block (no anchor wrapper) so the carousel
                still reads correctly. */}
            {(() => {
              const inner = (
                <>
                  {current.imageUrl ? (
                    /* Native <img> rather than next/image — the URL is
                     * cross-origin (Sanity CDN) and we already have
                     * `images.unoptimized: true`, so next/image would
                     * just hand off without optimization. The avatar is
                     * tiny (48px) and lazy-loaded; no LCP concern. */
                    <img
                      src={current.imageUrl}
                      alt={current.imageAlt || current.author}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 flex-shrink-0 rounded-full object-cover border border-line"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="text-ink group-hover:text-accent transition-colors">
                      {current.author}
                    </div>
                    {current.org ? (
                      <div className="text-ink-dim/80">{current.org}</div>
                    ) : null}
                  </div>
                </>
              );
              return current.linkedinUrl ? (
                <a
                  href={current.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${current.author} on LinkedIn`}
                  className="group inline-flex items-center gap-4 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {inner}
                </a>
              ) : (
                <div className="flex items-center gap-4">{inner}</div>
              );
            })()}
          </figcaption>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show testimonial ${i + 1} of ${items.length}`}
                aria-current={i === index ? "true" : undefined}
                className="inline-flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === index ? "w-8 bg-accent" : "w-1.5 bg-line"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={dict.testimonials.prev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={dict.testimonials.next}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
