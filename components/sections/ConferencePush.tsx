"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { PublicationItem } from "@/lib/sanity/loaders";
import { isDownloadConfigured } from "@/lib/hubspot";
import { triggerDownload } from "@/lib/download";
import { matchPublicationByKey } from "@/lib/conference-push";
import { getLenis } from "@/lib/lenis";
import { PdfGateModal, type GatePublication } from "./PdfGateModal";

type ConferencePushProps = {
  dict: Dictionary;
  publications: readonly PublicationItem[];
};

/**
 * Conference paper push. When the homepage is opened via a tagged link
 * (?paper=<campaignKey>), auto-opens the email gate for that specific paper.
 * Soft + dismissible: closing the modal reveals a sticky "Get Ramon's paper"
 * button to re-open it. Renders nothing for organic visitors (no/unknown
 * param). Query params are read at runtime (client-only) so this works under
 * static export.
 */
export function ConferencePush({ dict, publications }: ConferencePushProps) {
  const [paper, setPaper] = useState<GatePublication | null>(null);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("paper");
    const match = matchPublicationByKey(publications, key);
    if (!match) return;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time client-only
       sync: the URL query string isn't available during static prerender, so we
       read ?paper= on mount and reflect the match into state. This runs once,
       not a render cascade. */
    setPaper({ id: match.id, title: match.title, file: match.file });
    // Mirror the publications gate fallback: if HubSpot isn't configured there's
    // no lead step, so just download immediately.
    if (!isDownloadConfigured()) {
      triggerDownload(match.file);
      setDone(true);
    } else {
      // Pin the page to the top so the hero sits behind the gate (not whatever
      // section a restored scroll position would land on). The modal's own
      // scroll-lock then freezes it there.
      window.scrollTo(0, 0);
      getLenis()?.scrollTo(0, { immediate: true });
      setOpen(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [publications]);

  if (!paper || done) return null;

  return open ? (
    <PdfGateModal
      dict={dict}
      publication={paper}
      onClose={() => setOpen(false)}
      onSubmitted={() => setDone(true)}
    />
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-on-accent shadow-glow transition hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
    >
      {dict.pdfGate.reopen}
    </button>
  );
}
