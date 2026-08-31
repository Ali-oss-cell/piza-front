"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  defaultTransition,
  fadeUp,
  fadeUpReduced,
  viewportOnce,
} from "@/lib/motion-presets";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div" | "article";
  id?: string;
}

export function MotionReveal({
  children,
  className = "",
  delay = 0,
  as = "section",
  id,
}: MotionRevealProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      id={id}
      initial="hidden"
      transition={{ ...defaultTransition, delay }}
      variants={reduceMotion ? fadeUpReduced : fadeUp}
      viewport={viewportOnce}
      whileInView="visible"
    >
      {children}
    </Component>
  );
}
