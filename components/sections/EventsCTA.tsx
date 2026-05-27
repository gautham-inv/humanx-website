"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { EventsPageContent } from "@/lib/sanity/loaders";
import { ContactCTAButton } from "@/components/layout/ContactCTAButton";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Events-specific CTA. Same modal as the global one (one form, one inbox),
 * but framed for the page's intent: booking Ramon for a stage. Visually
 * differentiated from the generic GlobalCTA via:
 *   - a left-aligned, two-column layout (not centered)
 *   - calendar-grid background texture (echoes /events page motif)
 *   - eyebrow "On stage" instead of "Let's talk"
 */
type EventsCTAProps = {
  dict: Dictionary;
  /** Sanity-resolved `eventsPage.book` slice. Per-field dict fallback. */
  content?: EventsPageContent["book"];
};

export function EventsCTA({ dict, content }: EventsCTAProps) {
  const t = dict.events;
  const bookEyebrow = content?.eyebrow ?? t.bookEyebrow;
  const bookTitle = content?.title ?? t.bookTitle;
  const bookBody = content?.body ?? t.bookBody;
  const bookCta = content?.cta ?? t.bookCta;

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line bg-bg-elev/30 px-6 py-14 md:py-20 lg:py-28"
    >
      {/* Subtle grid texture as a stage motif. Same dot-pattern technique
          used on /insights so the visual language stays consistent. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
        <div>
          <Reveal direction="up">
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {bookEyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-tight">
              {bookTitle}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-ink-dim">{bookBody}</p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.15}>
          <div className="flex flex-col gap-4 md:items-end">
            <ContactCTAButton label={bookCta} />
            <p className="text-xs uppercase tracking-[0.2em] text-ink-dim">
              {/* Reuse the global 'one inbox' messaging from cta.body */}
              {dict.cta.body.split(".")[0]}.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
