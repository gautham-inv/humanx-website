"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { sanityImageUrl } from "@/lib/sanity/image-loader";
import type { TestimonialItem } from "@/components/sections/Testimonials";

/**
 * Derive a clean collapsed excerpt from the full quote. Prefers a sentence
 * boundary within the first ~200 chars (no ellipsis when it's a whole
 * sentence); otherwise cuts at a word boundary and appends an ellipsis.
 * Returns null when the quote is short enough to show in full — no toggle.
 */
function makeExcerpt(text: string): string | null {
  const FULL_MAX = 220;
  if (text.length <= FULL_MAX) return null;
  const window = text.slice(0, 200);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! ")
  );
  if (sentenceEnd >= 90) return text.slice(0, sentenceEnd + 1);
  const space = window.lastIndexOf(" ");
  return `${text.slice(0, space > 90 ? space : 180).trimEnd()}…`;
}

const QUOTE_CLASS =
  "font-serif text-base italic leading-relaxed text-ink md:text-lg";

// A read-full "pane" is a CSS grid whose single row animates between 0fr and
// 1fr — interpolating grid-template-rows collapses/expands the row smoothly,
// and the inner wrapper's overflow-hidden clips it during the transition. The
// excerpt and full panes crossfade in opposition so the card swaps text in
// place. (Authored as arbitrary utilities rather than global CSS so the
// transition lives with the component.)
const PANE =
  "grid transition-all duration-[450ms] ease-[cubic-bezier(0.2,0.65,0.2,1)]";

/**
 * One testimonial. Borderless card (an amber left rule, not a boxed tile) in a
 * staggered two-column wall — so each card sizes to its own content and only
 * the toggled card grows. Long quotes collapse to an excerpt and "swipe in"
 * the full text via a grid-rows crossfade (.tquote-* in globals.css) when
 * "Read full" is pressed. Client component for the stateful expand.
 */
export function TestimonialCard({
  item,
  index,
}: {
  item: TestimonialItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const excerpt = makeExcerpt(item.quote);

  // Odd cards drop down to stagger the two columns; collapses below `sm`.
  const offset = index % 2 === 1 ? "sm:mt-14" : "";

  const attribution = (
    <>
      {item.imageUrl ? (
        <img
          src={sanityImageUrl(item.imageUrl, 112)}
          alt={item.imageAlt || item.author}
          width={56}
          height={56}
          loading="lazy"
          decoding="async"
          className="h-12 w-12 flex-shrink-0 rounded-lg border border-line object-cover"
        />
      ) : null}
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink transition-colors group-hover:text-accent md:text-base">
          {item.author}
        </div>
        {item.org ? (
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-dim/80">
            {item.org}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <figure className={`flex max-w-xl flex-col ${offset}`}>
      <Reveal direction="up" delay={Math.min(index * 0.04, 0.2)}>
        {excerpt ? (
          <blockquote className="border-l-2 border-accent pl-5 md:pl-6">
            <div
              className={`${PANE} ${open ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
              aria-hidden={open}
            >
              <div className="overflow-hidden">
                <p className={QUOTE_CLASS}>{excerpt}</p>
              </div>
            </div>
            <div
              className={`${PANE} ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              aria-hidden={!open}
            >
              <div className="overflow-hidden">
                <p className={QUOTE_CLASS}>{item.quote}</p>
              </div>
            </div>
          </blockquote>
        ) : (
          <blockquote className="border-l-2 border-accent pl-5 md:pl-6">
            <p className={QUOTE_CLASS}>{item.quote}</p>
          </blockquote>
        )}

        {excerpt ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-4 self-start pl-5 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:pl-6"
          >
            {open ? "Show less ←" : "Read full →"}
          </button>
        ) : null}

        <figcaption className="mt-6 pl-5 text-sm text-ink-dim md:pl-6">
          {item.linkedinUrl ? (
            <a
              href={item.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.author} on LinkedIn`}
              className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {attribution}
            </a>
          ) : (
            <div className="flex items-center gap-3">{attribution}</div>
          )}
        </figcaption>
      </Reveal>
    </figure>
  );
}
