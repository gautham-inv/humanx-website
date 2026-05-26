"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { HumanForm } from "@/components/forms/HumanForm";
import { buildContactFields } from "@/lib/contactFields";
import { ContactCTAButton } from "@/components/layout/ContactCTAButton";
import { Reveal } from "@/components/motion/Reveal";

type Variant = "home" | "centered";

/**
 * Site-wide contact CTA. Two shapes, chosen explicitly by the host page:
 *
 *  - "home"     → two-column layout with the inline <HumanForm>. Use on the
 *                 homepage where conversion is the dominant goal of the page.
 *  - "centered" → centered hero-style block with a single button that opens
 *                 the global contact modal. Use on /about and /services.
 *
 * Pages that don't want any CTA above the footer (publications, insights)
 * simply don't mount this component. Pages with a domain-specific CTA
 * (events) mount their own variant instead.
 */
export function GlobalCTA({
  dict,
  variant,
}: {
  dict: Dictionary;
  variant: Variant;
}) {
  const t = dict.cta;

  if (variant === "home") {
    const fields = buildContactFields(dict);
    return (
      <section
        id="contact"
        className="relative overflow-hidden border-t border-line px-6 py-20 md:py-28"
      >
        {/* Drenched brand moment: orange -> magenta diagonal that mirrors the
            brand-x wordmark gradient. Sits behind the form to make the
            conversion section the energetic peak of the page. */}
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
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.3em] text-ink-dim">
              <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
              {t.eyebrow}
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
              {t.title}
            </h2>
            <p className="mt-6 max-w-md text-ink-dim">{t.body}</p>
          </div>

          <div className="lg:pl-8">
            <HumanForm dict={dict} title="" fields={fields} submitLabel={t.submit} />
          </div>
        </div>
      </section>
    );
  }

  // variant === "centered"
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line px-6 py-24 md:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent)/8%,transparent_60%)]" />
      <div className="mx-auto max-w-4xl text-center">
        <Reveal direction="up">
          <div className="mb-6 text-xs uppercase tracking-[0.3em] text-ink-dim">
            <span className="mr-3 inline-block h-px w-8 bg-accent align-middle" />
            {t.eyebrow}
          </div>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight">
            {t.title}
          </h2>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-dim">{t.body}</p>
        </Reveal>
        <Reveal direction="up" delay={0.15}>
          <div className="mt-10 flex justify-center">
            <ContactCTAButton label={t.openModalLabel} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
