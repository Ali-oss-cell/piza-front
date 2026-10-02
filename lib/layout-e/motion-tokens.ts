import type { Transition } from "framer-motion";
import { MOTION_EASE, defaultTransition } from "@/lib/motion-presets";

/** Shared cinematic easing — reuse everywhere in Layout E. */
export const cinematicEase = MOTION_EASE;

export const cinematicTransition: Transition = {
  ...defaultTransition,
  duration: 0.6,
  ease: cinematicEase,
};

export const cinematicStagger = 0.08;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
