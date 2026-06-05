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

      // Parallax stays within the image's overscale headroom so its edges
      // never slide into the frame. With object-cover the safe travel is
      // |yPercent| ≤ 50·(scale − 1); at scale-110 that's 5%, so ±4% keeps a
      // margin at every breakpoint and the portrait is never cut off on scroll.
      gsap.fromTo(
        imageRef.current,
        { yPercent: -4 },
        {
          yPercent: 4,
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

  // person.webp is a landscape (1086×724) source. object-cover fills the
  // portrait frame and crops the sides (where there's no subject) rather than
  // letterboxing or relying on a heavy zoom; scale-110 adds just enough
  // overscale to give the parallax room without throwing away much of the
  // image. Previously object-contain + scale-200 cropped ~50% and, paired with
  // the larger parallax, let the frame clip the portrait as it scrolled.
  const imageClass =
    "object-cover object-center scale-105 transition-opacity duration-300 ease-out";
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
