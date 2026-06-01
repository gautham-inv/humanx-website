import { Award } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type CredentialsProps = {
  dict: Dictionary;
};

/**
 * Recognition / credential strip — the "authority" beat peer speaker sites
 * lean on (e.g. a Thinkers50 badge). Shows a single highlighted recognition
 * as a seal-style badge alongside the eyebrow/title/body. Career stats live
 * on the About → Founder section, so this section stays purely about
 * recognition and doesn't echo the same numbers.
 *
 * Content is dict-driven (`dict.credentials`). The badge wording is
 * placeholder — see the note in en.ts.
 */
export function Credentials({ dict }: CredentialsProps) {
  const t = dict.credentials;

  return (
    <section
      aria-label={t.title}
      className="relative border-t border-line px-6 py-16 md:py-24 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
        {/* Seal-style badge. Concentric rings echo the Founder section's
            orbit motif so the recognition reads as a crafted mark, not a
            stock sticker. */}
        <Reveal direction="up" className="mx-auto lg:mx-0">
          <div className="relative flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <circle cx="100" cy="100" r="96" fill="none" stroke="var(--color-line)" strokeWidth="1" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-accent)" strokeWidth="1.25" strokeDasharray="3 7" />
            </svg>
            <div className="flex flex-col items-center gap-2 text-center">
              <Award className="h-8 w-8 text-accent" strokeWidth={1.5} aria-hidden />
              <span className="px-6 font-display text-lg leading-tight tracking-tight text-ink md:text-xl">
                {t.badge.name}
              </span>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal direction="up">
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {t.eyebrow}
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.05}>
            <h2 className="max-w-xl font-display text-3xl leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
              {t.title}
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <p className="mt-5 max-w-lg font-serif text-lg leading-relaxed text-ink-dim">
              {t.body}
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.15}>
            <p className="mt-3 max-w-lg text-sm text-ink-dim/80">{t.badge.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
