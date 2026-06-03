import type { ComponentType } from "react";
import {
  Heart,
  Users,
  Compass,
  Store,
  ChartScatter,
  Award,
  Globe,
  Mic,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

type ExpertiseItem = { label: string; iconKey: string };

type AreasOfExpertiseProps = {
  eyebrow?: string;
  title?: string;
  items: readonly ExpertiseItem[];
};

/** Maps an authored `iconKey` to a lucide icon. Unknown keys fall back to a
 *  neutral mark so a typo never breaks the build. */
const ICONS: Record<string, ComponentType<LucideProps>> = {
  cx: Heart,
  ex: Users,
  "human-experience": Compass,
  retail: Store,
  data: ChartScatter,
  leadership: Award,
  global: Globe,
  speaking: Mic,
};

/**
 * "Areas of expertise" — a centered icon grid on /on-stage, echoing the
 * expertise band peer speaker sites lead with. Content (labels + icon keys)
 * is editable via the onStagePage Sanity singleton. Renders nothing when the
 * list is empty.
 */
export function AreasOfExpertise({ eyebrow, title, items }: AreasOfExpertiseProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      id="expertise"
      aria-label={title || "Areas of expertise"}
      className="relative border-t border-line px-6 py-14 md:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-5xl text-center">
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

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[item.iconKey] ?? Sparkles;
            return (
              <Reveal
                key={`${item.iconKey}-${i}`}
                direction="up"
                delay={Math.min(i * 0.05, 0.25)}
              >
                <div className="flex flex-col items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-bg-elev/40 text-accent">
                    <Icon className="h-7 w-7" strokeWidth={1.4} />
                  </span>
                  <span className="font-display text-sm leading-snug text-ink md:text-base">
                    {item.label}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
