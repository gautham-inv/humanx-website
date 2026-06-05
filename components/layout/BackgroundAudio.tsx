"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

const COPY: Record<
  Locale,
  {
    on: string;
    off: string;
    unavailable: string;
  }
> = {
  en: {
    on: "Turn background audio on",
    off: "Mute background audio",
    unavailable: "Background audio is unavailable",
  },
  es: {
    on: "Activar audio de fondo",
    off: "Silenciar audio de fondo",
    unavailable: "El audio de fondo no está disponible",
  },
};

export function BackgroundAudio({ locale }: { locale: Locale }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const labels = COPY[locale] ?? COPY.en;

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.muted = true;
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      audio.muted = false;
      audio.volume = 0.28;
      await audio.play();
      setBlocked(false);
      setPlaying(true);
    } catch {
      audio.muted = true;
      setBlocked(true);
      setPlaying(false);
    }
  }

  const label = blocked ? labels.unavailable : playing ? labels.off : labels.on;

  return (
    <>
      <audio ref={audioRef} src="/audio.mp3" loop preload="metadata" muted />
      <button
        type="button"
        onClick={toggleAudio}
        aria-pressed={playing}
        aria-label={label}
        title={label}
        className="fixed bottom-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg-elev/95 text-ink-dim shadow-lg shadow-bg/25 backdrop-blur-md transition-colors hover:border-cta hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:bottom-6 md:right-6"
      >
        {playing ? (
          <Volume2 aria-hidden size={18} strokeWidth={1.8} />
        ) : (
          <VolumeX aria-hidden size={18} strokeWidth={1.8} />
        )}
      </button>
    </>
  );
}
