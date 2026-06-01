import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type PullQuoteProps = {
  dict: Dictionary;
};

/**
 * Full-viewport speaker pull-quote — a brand "moment" between content blocks,
 * in the spirit of the editorial quote spread peer speaker sites use to drop
 * the principal's own words. The quote sits left in the display-serif
 * highlight face; a framed portrait sits right. The background is the same
 * orange → violet → magenta diagonal gradient as the homepage contact CTA,
 * faded into the page background, so it reads consistently in either theme.
 *
 * Content is dict-driven (`dict.pullQuote`). The quote is placeholder copy
 * synthesized from Ramon's stated values — see the note in en.ts — and
 * should be swapped for his own words.
 */
export function PullQuote({ dict }: PullQuoteProps) {
  const t = dict.pullQuote;

  return (
    <section
      aria-label="Quote"
      className="relative isolate flex min-h-screen items-center overflow-hidden border-y border-line px-6 py-20 md:py-28"
    >
      {/* Same drenched brand gradient as the homepage contact CTA: an
          orange → violet → magenta diagonal that mirrors the brand-x wordmark,
          faded into the page background so it reads as a brand "moment" in
          either theme. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, var(--color-violet) 55%, var(--color-magenta) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, transparent 30%, var(--color-bg) 75%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Quote */}
        <figure className="relative order-2 lg:order-1">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-14 select-none font-serif text-[9rem] leading-none text-accent/25 md:-top-20 md:text-[15rem]"
          >
            &ldquo;
          </span>
          <Reveal direction="up">
            <blockquote className="relative font-highlight text-[clamp(1.9rem,4.2vw,3.6rem)] italic leading-[1.15] tracking-tight">
              {t.quote}
            </blockquote>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <figcaption className="mt-10 flex flex-col gap-3">
              <span className="h-px w-12 bg-accent" />
              <span className="font-display text-sm uppercase tracking-[0.25em]">
                {t.author}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] opacity-60">
                {t.role}
              </span>
            </figcaption>
          </Reveal>
        </figure>

        {/* Portrait */}
        <Reveal direction="up" delay={0.05} className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-line shadow-2xl lg:max-w-xl">
            <Image
              src="/quote-image.jpg"
              alt={t.imageAlt}
              fill
              sizes="(min-width: 1024px) 28rem, (min-width: 768px) 24rem, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
