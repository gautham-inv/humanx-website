import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { Reveal } from "@/components/motion/Reveal";

export function Assessment({ dict }: { dict: Dictionary }) {
  const t = dict.assessment;
  const f = t.featured;

  return (
    <section
      id="assessment"
      className="relative px-6 py-20 md:py-28 border-t border-line"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal direction="up">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <div className="flex items-start gap-5 md:gap-7">
                <span
                  aria-hidden
                  className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.85] text-accent/35 tabular-nums tracking-tight"
                  style={{ fontVariationSettings: '"SHRP" 80' }}
                >
                  01
                </span>
                <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
                  {t.title}
                </h2>
              </div>
              <p className="mt-6 max-w-xl text-ink-dim">{t.body}</p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-line bg-bg-elev/40 p-8 backdrop-blur-sm">
                <h3 className="font-display text-xl text-ink">{f.title}</h3>
                <p className="mt-3 text-sm text-ink-dim leading-relaxed">
                  {f.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-widest text-ink-dim">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 py-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {f.durationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/60 px-3 py-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M9 11l3 3 8-8" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {f.questionsLabel}
                  </span>
                </div>

                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
                >
                  {t.cta}
                  <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
