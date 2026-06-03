import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

type FeaturedRecommendationProps = {
  /** Section eyebrow ("In their words"). */
  eyebrow?: string;
  /** Section heading shown above the featured card. */
  title?: string;
  /** Recommender name, e.g. "Alejandra H.". */
  name: string;
  /** Role / LinkedIn headline — rendered as the small-caps line above the name. */
  headline?: string;
  /** Working-relationship label, e.g. "Worked on the same team". */
  relationship?: string;
  /** Month + year the recommendation was given. */
  date?: string;
  /** The recommendation text. Paragraph breaks (blank lines) are preserved. */
  body: string;
  /** Portrait URL (Sanity CDN or local). Falls back to a monogram when empty. */
  imageUrl?: string;
  imageAlt?: string;
  /** When set, renders a "View on LinkedIn" link beneath the quote. */
  linkedinUrl?: string;
  /** LinkedIn link label, localized at the call site. */
  linkedinLabel?: string;
};

function initials(name: string): string {
  const words = name
    .replace(/["'.,]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + second).toUpperCase();
}

/**
 * A single featured endorsement, in the editorial two-column spread peer
 * speaker sites use to give one recommender real estate: a framed portrait on
 * one side, the role + name + quote on the other. Replaces the masonry wall on
 * /about when only one voice is being highlighted. The name renders given-name
 * roman + remainder italic (Literata) for the magazine-byline feel.
 */
export function FeaturedRecommendation({
  eyebrow,
  title,
  name,
  headline,
  relationship,
  date,
  body,
  imageUrl,
  imageAlt,
  linkedinUrl,
  linkedinLabel = "View on LinkedIn",
}: FeaturedRecommendationProps) {
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? name;
  const rest = nameParts.slice(1).join(" ");
  const meta = [relationship, date].filter(Boolean).join(" · ");

  return (
    <section
      id="recommendations"
      aria-label={title || `Recommendation from ${name}`}
      className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-12 max-w-2xl">
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
          </div>
        )}

        <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Portrait */}
          <Reveal direction="up" delay={0.05} className="order-1">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[var(--radius-card)] border border-line shadow-2xl lg:max-w-none">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt || name}
                  fill
                  sizes="(min-width: 1024px) 40rem, (min-width: 768px) 28rem, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/10 font-highlight text-7xl italic text-accent/70">
                  {initials(name)}
                </div>
              )}
            </div>
          </Reveal>

          {/* Attribution + quote */}
          <figure className="order-2">
            {headline ? (
              <Reveal direction="up">
                <p className="mb-5 text-xs font-medium uppercase leading-relaxed tracking-[0.18em] text-ink-dim">
                  {headline}
                </p>
              </Reveal>
            ) : null}
            <Reveal direction="up" delay={0.05}>
              <p className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05] tracking-tight">
                {firstName}
                {rest ? <span className="font-highlight italic"> {rest}</span> : null}
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.1}>
              <blockquote className="mt-7 max-w-xl whitespace-pre-line font-highlight text-lg italic leading-relaxed text-ink-dim md:text-xl">
                {body}
              </blockquote>
            </Reveal>
            {(meta || linkedinUrl) && (
              <Reveal direction="up" delay={0.15}>
                <figcaption className="mt-7 flex flex-col gap-2">
                  {meta ? (
                    <span className="text-xs uppercase tracking-[0.2em] text-ink-dim/80">
                      {meta}
                    </span>
                  ) : null}
                  {linkedinUrl ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-sm font-medium text-accent underline underline-offset-4 transition hover:text-accent-bright"
                    >
                      {linkedinLabel}
                    </a>
                  ) : null}
                </figcaption>
              </Reveal>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
