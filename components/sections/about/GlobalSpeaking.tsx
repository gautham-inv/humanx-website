import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type Entry = {
  readonly name: string;
  readonly location: string;
  /** Optional month/year the talk took place, shown beneath the location. */
  readonly date?: string;
};
type Region = { readonly region: string; readonly entries: readonly Entry[] };

type GlobalSpeakingProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  regions: readonly Region[];
  /** Optional visual (e.g. the world map) shown between the header and the
   *  region list. */
  map?: ReactNode;
};

/**
 * "Where Ramon takes the stage" — speaking engagements grouped by region.
 * Editorial three-column layout: each region is a header + a hairline-ruled
 * list of venues. Mirrors the speaking-portfolio beat on peer speaker sites.
 * Now lives on the /on-stage page (with the world map passed via `map`).
 */
export function GlobalSpeaking({ eyebrow, title, body, regions, map }: GlobalSpeakingProps) {
  if (!regions || regions.length === 0) return null;

  return (
    <section
      id="speaking"
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

        {map ? <div className="mt-12 lg:mt-16">{map}</div> : null}

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {regions.map((r, ri) => (
            <Reveal key={r.region} direction="up" delay={Math.min(ri * 0.06, 0.2)}>
              <div>
                <h3 className="font-display text-sm uppercase tracking-[0.2em] text-accent">
                  {r.region}
                </h3>
                <ul className="mt-4 divide-y divide-line/70">
                  {r.entries.map((e) => (
                    <li key={`${r.region}-${e.name}`} className="py-3">
                      <p className="font-display text-base leading-snug text-ink">
                        {e.name}
                      </p>
                      {e.location ? (
                        <p className="mt-0.5 text-sm text-ink-dim">{e.location}</p>
                      ) : null}
                      {e.date ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-accent/80">
                          {e.date}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
