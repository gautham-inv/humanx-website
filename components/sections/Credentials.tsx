import Image from "next/image";
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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center lg:flex-row lg:justify-center lg:gap-16 lg:text-left">
        {/* Recognition badge — the real award mark from /public. */}
        <Reveal direction="up" className="shrink-0">
          <div className="relative h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96">
            <Image
              src="/badge.webp"
              alt={t.badge.name}
              fill
              sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
              className="object-contain"
            />
          </div>
        </Reveal>

        <div className="max-w-xl">
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
