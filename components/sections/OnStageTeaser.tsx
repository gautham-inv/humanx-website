import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { HighlightedTitle } from "@/components/motion/HighlightedTitle";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Locale } from "@/lib/i18n/config";

type OnStageTeaserProps = {
  dict: Dictionary;
  locale: Locale;
};

/**
 * Homepage "on stage" teaser ("Keynotes that move the room"): a centered
 * credentials line, headline, and CTA to /on-stage, above a single large
 * inline keynote reel.
 *
 * The reel is a native HTML5 <video> served from /public/videos/keynote.webm.
 * To change the clip, just replace that file — no code change needed. Playback
 * happens inline with the browser's native controls; clicking the video plays
 * it in place, never opening a modal, popup, lightbox, or new window.
 */
export function OnStageTeaser({ dict, locale }: OnStageTeaserProps) {
  const t = dict.onStage;
  const href = `/${locale}/on-stage`;

  return (
    <section
      id="on-stage"
      className="relative border-t border-line px-6 py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal direction="up">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-dim">
            {t.credentials}
          </p>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <HighlightedTitle
            as="h2"
            className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight"
          >
            {t.teaserTitle}
          </HighlightedTitle>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-dim">
            {t.teaserBody}
          </p>
        </Reveal>
        <Reveal direction="up" delay={0.15}>
          <div className="mt-8 flex justify-center">
            <Link
              href={href}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright"
            >
              {t.cta}
              <span aria-hidden className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Large inline keynote reel. Native <video controls> means clicking
          plays it in place — no modal, lightbox, popup, or navigation. Swap
          /public/videos/keynote.webm to change the clip; no code change. */}
      <Reveal
        direction="up"
        delay={0.1}
        className="mx-auto mt-14 block w-full max-w-7xl"
      >
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line shadow-2xl">
          <video
            controls
            playsInline
            preload="metadata"
            className="block aspect-video w-full bg-black"
          >
            <source src="/videos/keynote.webm" type="video/webm" />
          </video>
        </div>
      </Reveal>
    </section>
  );
}
