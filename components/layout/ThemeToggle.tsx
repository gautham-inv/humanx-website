"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "humanx-theme";

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  // The pre-hydration script in layout.tsx has already set data-theme.
  // Trust that as the source of truth so SSR / first paint don't fight us.
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

export function ThemeToggle({
  labelLight = "Switch to light mode",
  labelDark = "Switch to dark mode",
}: {
  labelLight?: string;
  labelDark?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  // Hydrate from the attribute the inline script set. Rendering a static
  // icon on the server avoids the React hydration mismatch we'd get if we
  // tried to render the "correct" icon based on localStorage.
  useEffect(() => {
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* localStorage may be unavailable (private mode, etc.) — fail silent. */
    }
  }

  const isLight = theme === "light";
  const label = isLight ? labelDark : labelLight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      // suppressHydrationWarning avoids React complaining when the inline
      // script flips the theme before React hydrates this button.
      suppressHydrationWarning
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-cta hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* Render a neutral icon until mounted so SSR markup matches client.
          After hydration, swap to the correct sun/moon. */}
      {!mounted ? (
        <SunIcon />
      ) : isLight ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m4.93 19.07 1.41-1.41" />
      <path d="m17.66 6.34 1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
