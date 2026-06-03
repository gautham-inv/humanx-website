import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

type PullQuoteProps = {
  quote: string;
  author: string;
  role: string;
  /** Portrait image URL — a Sanity CDN url or a local /public path. */
  imageSrc: string;
  imageAlt: string;
};

/**
 * Full-viewport speaker pull-quote — a brand "moment" between content blocks,
 * in the spirit of the editorial quote spread peer speaker sites use to drop
 * the principal's own words. The quote sits left in the display-serif
 * highlight face; a framed portrait sits right. The background is the same
 * orange → violet → magenta diagonal gradient as the homepage contact CTA,
 * faded into the page background, so it reads consistently in either theme.
 *
 * Presentational: content is passed in by the host page (homepage uses the
 * dict's `pullQuote`; /services pulls from the servicesPage Sanity singleton),
 * so the same design renders on multiple pages with different copy.
 */
export function PullQuote({ quote, author, role, imageSrc, imageAlt }: PullQuoteProps) {
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

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Quote — kept to a compact column so the words read as a tight
            editorial block rather than sprawling across the half. */}
        <figure className="relative order-2 max-w-md lg:order-1 lg:self-start lg:pt-6">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-10 select-none font-serif text-[6rem] leading-none text-accent/25 md:-top-14 md:text-[9rem]"
          >
            &ldquo;
          </span>
          <Reveal direction="up">
            <blockquote className="relative font-highlight text-[clamp(1.5rem,2.6vw,2.4rem)] italic leading-[1.2] tracking-tight">
              {quote}
            </blockquote>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <figcaption className="mt-8 flex flex-col gap-3">
              <span className="h-px w-12 bg-accent" />
              <span className="font-display text-sm uppercase tracking-[0.25em]">
                {author}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] opacity-60">
                {role}
              </span>
            </figcaption>
          </Reveal>
        </figure>

        {/* Portrait */}
        <Reveal direction="up" delay={0.05} className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-line shadow-2xl lg:aspect-[5/6] lg:max-w-2xl">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 42rem, (min-width: 768px) 24rem, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
