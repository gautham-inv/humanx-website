"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "humanx-theme";

/**
 * Defensive re-sync of the data-theme attribute on every route/locale change.
 *
 * The inline pre-paint script in <head> reads localStorage once at first
 * load. Cross-locale Link navigation in Next.js can re-render the layout and
 * leave the script in the same DOM node — meaning the script does NOT
 * re-execute. If the user toggled to light, then switched language, the
 * theme would silently drop back to whatever OS preference says.
 *
 * Mounting this client component once means every pathname change triggers
 * an effect that re-applies the stored theme from localStorage. Cheap, no
 * DOM in the output (returns null), no visible flash because the attribute
 * was already correct in the common case.
 */
export function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        if (document.documentElement.getAttribute("data-theme") !== stored) {
          document.documentElement.setAttribute("data-theme", stored);
        }
      }
    } catch {
      /* localStorage unavailable — leave whatever's there. */
    }
  }, [pathname]);

  return null;
}
