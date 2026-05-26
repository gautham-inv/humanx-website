/**
 * Pre-hydration theme bootstrap.
 *
 * Loaded via <Script src="/theme-init.js" strategy="beforeInteractive"> in the
 * locale layout. Runs synchronously before React hydrates the page so the
 * data-theme attribute is set on <html> before first paint — preventing a
 * flash of dark UI for light-theme users.
 *
 * Source of truth (in order):
 *   1. localStorage['humanx-theme'] if it is "light" or "dark".
 *   2. window.matchMedia('(prefers-color-scheme: light)') OS preference.
 *   3. fallback "dark".
 *
 * Kept tiny, single-IIFE, no external dependencies, no async work.
 */
(function () {
  try {
    var stored = localStorage.getItem("humanx-theme");
    var systemPrefersLight =
      window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : systemPrefersLight
          ? "light"
          : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
