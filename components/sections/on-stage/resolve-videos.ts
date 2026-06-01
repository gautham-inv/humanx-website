import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { VideoItem } from "@/lib/sanity/loaders";

/**
 * Resolve the video list shown on the homepage teaser and the /on-stage page.
 * Prefers real Sanity `video` docs; when none exist (e.g. a fresh dataset)
 * it falls back to past events that carry a `youtubeId`, mapped into the same
 * VideoItem shape. Shared (non-"use client") so both server sections and the
 * client VideoGrid can import it without crossing the client boundary.
 */
export function resolveVideos(
  items: readonly VideoItem[] | undefined,
  dict: Dictionary
): readonly VideoItem[] {
  if (items && items.length > 0) return items;
  return dict.events.items
    .filter((ev) => Boolean(ev.youtubeId))
    .map((ev) => ({
      id: ev.id,
      title: ev.title,
      caption: `${ev.venue} · ${ev.date}`,
      youtubeId: ev.youtubeId,
    }));
}
