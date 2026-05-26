"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Direction = "up" | "down" | "left" | "right" | "none";

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  distance = 32,
  duration = 0.9,
  stagger = 0,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  distance?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const axis = direction === "left" || direction === "right" ? "x" : "y";
      const sign = direction === "down" || direction === "right" ? -1 : 1;

      const targets = stagger
        ? ref.current.querySelectorAll<HTMLElement>("[data-reveal-child]")
        : [ref.current];

      gsap.from(targets, {
        opacity: 0,
        [axis]: direction === "none" ? 0 : distance * sign,
        duration,
        delay,
        stagger: stagger || 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: ref }
  );

  return (
    // @ts-expect-error polymorphic ref
    <As ref={ref} className={className}>
      {children}
    </As>
  );
}
