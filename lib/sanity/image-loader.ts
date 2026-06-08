/**
 * Sanity CDN image transform — shared by the `next/image` custom loader
 * (configured in next.config.ts) and the handful of raw <img> tags that render
 * Sanity assets directly.
 *
 * Sanity's image CDN does on-the-fly delivery transforms via URL query params
 * (https://www.sanity.io/docs/image-urls), so we get modern formats and right-
 * sized images for free, no build step or extra infra:
 *   - auto=format  → serves AVIF/WebP when the browser's Accept header allows
 *   - fit=max      → resize down to `w`, but never upscale past the original
 *   - w=<width>    → target render width (next/image calls this per srcset entry)
 *   - q=<quality>  → compression quality (defaults to 75, Next's default)
 *
 * Non-Sanity URLs (YouTube thumbnails on i.ytimg.com, local/static assets) and
 * SVGs (vector, nothing to rasterize) pass through unchanged.
 */

const SANITY_HOST = "cdn.sanity.io";

export function sanityImageUrl(
  src: string,
  width: number,
  quality?: number,
): string {
  if (!src) return src;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    // Relative/local path (e.g. a /public asset) — leave for the browser.
    return src;
  }

  if (url.hostname !== SANITY_HOST) return src;
  if (url.pathname.toLowerCase().endsWith(".svg")) return src;

  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(Math.round(width)));
  url.searchParams.set("q", String(quality ?? 75));
  return url.href;
}

/**
 * Default export consumed by `images.loaderFile` in next.config.ts. Runs at
 * build time (static export) and in the browser for srcset generation, so it
 * must stay isomorphic — no Node-only APIs.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return sanityImageUrl(src, width, quality);
}
