import type Lenis from "lenis";

// Module-level singleton ref so any component can pause/resume the
// global smooth-scroll instance (e.g. when a modal opens).
let current: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  current = instance;
}

export function getLenis(): Lenis | null {
  return current;
}
