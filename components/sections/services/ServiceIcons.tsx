import type { ComponentType } from "react";
import {
  Target,
  Activity,
  Route,
  ChartScatter,
  Globe,
  Mic,
  type LucideProps,
} from "lucide-react";

/**
 * Service-row iconography uses lucide-react — recognised, restrained, 1.5px
 * stroke. Picked for semantic clarity:
 *
 *   purpose       → Target       (aiming for a corporate purpose)
 *   cx-assessment → Activity     (a heartbeat / live signal — diagnose state)
 *   journeys      → Route        (sequenced touchpoints along a path)
 *   analytics     → ChartScatter (data points → recommendations)
 *   hispanic      → Globe        (cross-region market)
 *   speaking      → Mic          (stage)
 *
 * Each row mounts the icon at 64px on desktop / 48px on mobile so it reads
 * as a section marker, not a UI affordance.
 */

export const SERVICE_ICONS: Record<string, ComponentType<LucideProps>> = {
  purpose: Target,
  "cx-assessment": Activity,
  journeys: Route,
  analytics: ChartScatter,
  hispanic: Globe,
  speaking: Mic,
};
