import type { Transition, Variants } from "framer-motion";

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const pageHeroBg: Variants = {
  hidden: { scale: 1.06, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

export const defaultTransition: Transition = {
  duration: 0.55,
  ease: MOTION_EASE,
};

export const viewportOnce = { once: true, amount: 0.15 as const, margin: "0px 0px -40px 0px" };
