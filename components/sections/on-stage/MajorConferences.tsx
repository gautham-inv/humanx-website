import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import type { ConferenceItem } from "@/lib/sanity/loaders";

type MajorConferencesProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  items: readonly ConferenceItem[];
};

/**
 * "Major conferences" wall on /on-stage — a logo-first grid of the marquee
 * summits and congresses Ramon has spoken at, shown above the speaking-region
 * list. Each card surfaces the conference mark (logo with dark/light theme
 * variants, name as text fallback), the organising body, and the region.
 * Cards with a website become external links. Renders nothing when empty.
 */
export function MajorConferences({
  eyebrow,
  title,
  body,
  items,
}: MajorConferencesProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      id="conferences"
      aria-label={title || "Major conferences"}
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

        <div className="mt-12 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => {
            const hasLogo = Boolean(c.logoUrl || c.logoLightUrl);
            const lightUrl = c.logoLightUrl || c.logoUrl;
            const meta = [c.organization, c.region].filter(Boolean).join(" · ");

            const card: ReactNode = (
              <div className="flex h-full flex-col items-start gap-5 rounded-2xl border border-line bg-bg-elev/30 p-6 backdrop-blur-sm transition group-hover:border-cta/50 hover:border-cta/50">
                <div className="flex min-h-12 items-center">
                  {hasLogo ? (
                    <>
                      <img
                        src={c.logoUrl}
                        alt={c.name}
                        width={c.logoWidth || undefined}
                        height={c.logoHeight || undefined}
                        loading="lazy"
                        decoding="async"
                        className="partner-logo-dark h-10 w-auto md:h-12"
                      />
                      <img
                        src={lightUrl}
                        alt={c.name}
                        width={c.logoLightWidth || c.logoWidth || undefined}
                        height={c.logoLightHeight || c.logoHeight || undefined}
                        loading="lazy"
                        decoding="async"
                        className="partner-logo-light h-10 w-auto md:h-12"
                      />
                    </>
                  ) : (
                    <span className="font-display text-xl leading-tight tracking-tight text-ink md:text-2xl">
                      {c.name}
                    </span>
                  )}
                </div>
                <div className="mt-auto">
                  {hasLogo ? (
                    <p className="font-display text-base leading-snug text-ink">
                      {c.name}
                    </p>
                  ) : null}
                  {meta ? (
                    <p className="mt-1 text-sm text-ink-dim">{meta}</p>
                  ) : null}
                </div>
              </div>
            );

            return (
              <Reveal
                key={c.id}
                direction="up"
                delay={Math.min(i * 0.05, 0.25)}
                className="h-full"
              >
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={c.name}
                    className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
