"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  defaultTransition,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
  viewportOnce,
} from "@/lib/motion-presets";

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

export function StaggerGrid({
  children,
  className = "",
  itemClassName = "",
}: StaggerGridProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      variants={staggerContainer}
      viewport={viewportOnce}
      whileInView="visible"
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              className={cn(itemClassName)}
              key={index}
              transition={defaultTransition}
              variants={reduceMotion ? staggerItemReduced : staggerItem}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
