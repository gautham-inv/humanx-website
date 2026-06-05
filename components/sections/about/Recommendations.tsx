"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import type { Recommendation } from "@/lib/data/recommendations";

type RecommendationsProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  items: readonly Recommendation[];
  /** Label for the "show all" button, with `{count}` replaced by the remainder. */
  showAllLabel?: string;
  showLessLabel?: string;
  readMoreLabel?: string;
  readLessLabel?: string;
};

const INITIAL_VISIBLE = 6;
// Body longer than this gets a read-more toggle.
const CLAMP_THRESHOLD = 320;

// Monogram tints rotate through the brand palette so the wall reads as
// composed, not uniform.
const AVATAR_TINTS = [
  "bg-accent/15 text-accent",
  "bg-violet/20 text-violet",
  "bg-magenta/15 text-magenta",
] as const;

function initials(name: string): string {
  const words = name
    .replace(/["'.,]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + second).toUpperCase();
}

function LinkedInGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="text-ink-dim transition group-hover/name:text-accent"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function RecCard({
  rec,
  index,
  readMore,
  readLess,
}: {
  rec: Recommendation;
  index: number;
  readMore: string;
  readLess: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = rec.body.length > CLAMP_THRESHOLD;
  const tint = AVATAR_TINTS[index % AVATAR_TINTS.length];

  const nameInner = (
    <span className="group/name inline-flex items-center gap-1.5">
      <span className="font-display text-base leading-tight text-ink">
        {rec.name}
      </span>
      {rec.linkedinUrl ? <LinkedInGlyph /> : null}
    </span>
  );

  return (
    <figure className="mb-6 break-inside-avoid rounded-2xl border border-line bg-bg-elev/30 p-6 backdrop-blur-sm transition hover:border-cta/40">
      <div className="flex items-start gap-4">
        {rec.imageUrl ? (
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-line">
            <Image
              src={rec.imageUrl}
              alt={rec.imageAlt || rec.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-display text-sm ${tint}`}
          >
            {initials(rec.name)}
          </div>
        )}
        <figcaption className="min-w-0">
          {rec.linkedinUrl ? (
            <a
              href={rec.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
            >
              {nameInner}
            </a>
          ) : (
            nameInner
          )}
          {rec.headline ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-dim">
              {rec.headline}
            </p>
          ) : null}
        </figcaption>
      </div>

      {(rec.date || rec.relationship) && (
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink-dim">
          {[rec.date, rec.relationship].filter(Boolean).join(" · ")}
        </p>
      )}

      <blockquote
        className={`mt-3 whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink-dim ${
          isLong && !expanded ? "line-clamp-[8]" : ""
        }`}
      >
        {rec.body}
      </blockquote>

      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-medium text-accent transition hover:text-accent-bright"
        >
          {expanded ? readLess : readMore}
        </button>
      ) : null}
    </figure>
  );
}

/**
 * "Recommendations" wall for the About page — longer, colleague-written
 * LinkedIn endorsements, distinct from the short homepage testimonials
 * carousel. Cards flow in a masonry of columns; long ones clamp with a
 * read-more toggle, and only the first batch shows until the visitor expands.
 */
export function Recommendations({
  eyebrow,
  title,
  body,
  items,
  showAllLabel = "Show all {count} recommendations",
  showLessLabel = "Show fewer",
  readMoreLabel = "Read more",
  readLessLabel = "Read less",
}: RecommendationsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE);
  const remaining = items.length - INITIAL_VISIBLE;

  return (
    <section
      id="recommendations"
      aria-label={title}
      className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          {eyebrow ? (
            <Reveal direction="up">
              <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
                <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
                {eyebrow}
              </div>
            </Reveal>
          ) : null}
          {title ? (
            <Reveal direction="up" delay={0.05}>
              <h2 className="font-display text-3xl leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
                {title}
              </h2>
            </Reveal>
          ) : null}
          {body ? (
            <Reveal direction="up" delay={0.1}>
              <p className="mt-5 font-serif text-lg leading-relaxed text-ink-dim">
                {body}
              </p>
            </Reveal>
          ) : null}
        </div>

        <div className="mt-12 gap-6 sm:columns-2 lg:columns-3">
          {visible.map((rec, i) => (
            <RecCard
              key={rec.id}
              rec={rec}
              index={i}
              readMore={readMoreLabel}
              readLess={readLessLabel}
            />
          ))}
        </div>

        {remaining > 0 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-cta/60 hover:text-cta"
            >
              {showAll
                ? showLessLabel
                : showAllLabel.replace("{count}", String(items.length))}
              <span
                aria-hidden
                className={`transition group-hover:translate-y-0.5 ${
                  showAll ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
