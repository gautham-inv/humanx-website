import { sanityImageUrl } from "@/lib/sanity/image-loader";

// Logos render in a 160px-wide tile at most; 2× covers retina. Sanity's
// fit=max won't upscale smaller marks past their native size.
const LOGO_W = 320;

type LogoMarkProps = {
  /** Brand/conference name — used as alt text. */
  name: string;
  /** Dark-theme logo URL. */
  logoUrl: string;
  /** Native px dimensions; 0 when unknown. Used as <img> width/height. */
  logoWidth: number;
  logoHeight: number;
  /** Light-theme logo URL. Falls back to the dark logo when empty. */
  logoLightUrl: string;
  logoLightWidth: number;
  logoLightHeight: number;
};

/**
 * One brand/conference logo rendered at the site's standard size — a fixed
 * tile (40×128 mobile, 48×160 desktop) with the logo contained inside, so
 * every logo occupies an identical box regardless of aspect ratio. Shared by
 * the homepage ticker and the on-stage conferences wall to keep both walls
 * visually consistent.
 *
 * Both theme variants are rendered; the `.partner-logo-dark` / `.partner-logo-light`
 * classes (see app/globals.css) show exactly one per theme. Callers decide
 * whether a logo exists and handle links / text fallback.
 */
export function LogoMark({
  name,
  logoUrl,
  logoWidth,
  logoHeight,
  logoLightUrl,
  logoLightWidth,
  logoLightHeight,
}: LogoMarkProps) {
  // Reuse the dark logo in the light theme when no light variant was uploaded.
  const lightUrl = logoLightUrl || logoUrl;
  const lightWidth = logoLightWidth || logoWidth;
  const lightHeight = logoLightHeight || logoHeight;

  return (
    <span className="inline-flex h-10 w-32 items-center justify-center md:h-12 md:w-40">
      <img
        src={sanityImageUrl(logoUrl, LOGO_W)}
        alt={name}
        width={logoWidth || undefined}
        height={logoHeight || undefined}
        loading="lazy"
        decoding="async"
        className="partner-logo-dark h-full w-full object-contain"
      />
      <img
        src={sanityImageUrl(lightUrl, LOGO_W)}
        alt={name}
        width={lightWidth || undefined}
        height={lightHeight || undefined}
        loading="lazy"
        decoding="async"
        className="partner-logo-light h-full w-full object-contain"
      />
    </span>
  );
}
