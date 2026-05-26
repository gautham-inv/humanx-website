"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Values({ dict }: { dict: Dictionary }) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const cards = ref.current.querySelectorAll<HTMLElement>("[data-value-card]");
      gsap.from(cards, {
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
      });

      const title = ref.current.querySelector<HTMLElement>("[data-values-title]");
      if (title) {
        gsap.from(title, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        });
      }
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden border-t border-line bg-bg-elev py-20 md:py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--color-accent)/8%,transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2
          data-values-title
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-tight"
        >
          {dict.values.title}
        </h2>
        {dict.values.body && (
          <p
            data-values-title
            className="mt-6 text-base leading-relaxed text-ink-dim md:text-lg"
          >
            {dict.values.body}
          </p>
        )}
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-line px-6 md:px-0">
        {dict.values.items.map((v, i) => (
          <div
            key={v.title}
            data-value-card
            className="group relative bg-bg-elev p-10 transition hover:bg-bg"
          >
            <div className="mb-8 font-display text-5xl text-accent/40 transition group-hover:text-accent">
              0{i + 1}
            </div>
            <h3 className="font-display text-2xl">{v.title}</h3>
            <p className="mt-3 text-sm text-ink-dim">{v.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
