import { createClient } from "@sanity/client";

/**
 * Sanity client for build-time fetches.
 *
 * The site is exported statically (`output: "export"` in next.config.ts), so
 * every page is rendered during `next build`. This client runs there — never
 * in the browser, never per-request. End users get pure static HTML; latency
 * is identical to a fully dict-driven site.
 *
 * `useCdn: true`         — fetches hit Sanity's CDN, fast and free.
 * `perspective: 'published'` — drafts stay invisible to production builds.
 *
 * Defaults fall back to the humanx-studio project id so a missing env var
 * doesn't fail the build; override via .env if you ever target a non-prod
 * dataset.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r3bmhb31";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
