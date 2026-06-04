import type { PublicationItem } from "@/lib/sanity/loaders";

/**
 * Find the publication whose `campaignKey` matches `key` (case-insensitive,
 * trimmed) and that has a downloadable file. Returns null when key is empty or
 * nothing matches — the caller then renders nothing (clean homepage).
 */
export function matchPublicationByKey(
  publications: readonly PublicationItem[],
  key: string | null | undefined
): PublicationItem | null {
  if (!key) return null;
  const norm = key.trim().toLowerCase();
  if (!norm) return null;
  return (
    publications.find(
      (p) => p.file && p.campaignKey && p.campaignKey.toLowerCase() === norm
    ) ?? null
  );
}
