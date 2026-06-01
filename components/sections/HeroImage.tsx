"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

// Single portrait shown in both light and dark themes.
const HERO_SRC = "/person.webp";

type HeroImageProps = {
  /** When true, fills the parent (parent must have a defined height). */
  fill?: boolean;
  alt?: string;
};

export function HeroImage({ fill = false, alt = "Ramon Portilla, founder of HumanX Insights." }: HeroImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !imageRef.current) return;

      gsap.fromTo(
        imageRef.current,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.35,
        }
      );
    },
    { scope: containerRef }
  );

  const imageClass =
    "object-contain object-center scale-200 transition-opacity duration-300 ease-out";
  const sizes = fill ? "(max-width: 1024px) 100vw, 52vw" : "(max-width: 1024px) 100vw, 40vw";

  return (
    <div
      ref={containerRef}
      className={
        fill
          ? "relative h-full w-full overflow-hidden"
          : "relative h-full w-full overflow-hidden rounded-2xl"
      }
    >
      <div
        ref={imageRef}
        role="img"
        aria-label={alt}
        className="absolute inset-0 h-full w-full"
      >
        <Image
          src={HERO_SRC}
          alt=""
          aria-hidden
          fill
          priority
          sizes={sizes}
          className={imageClass}
        />
      </div>
    </div>
  );
}
