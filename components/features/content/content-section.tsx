"use client";

import { MotionReveal } from "@/components/motion/motion-reveal";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function ContentSection({
  eyebrow,
  title,
  description,
  children,
  className = "",
  id,
}: ContentSectionProps): React.ReactElement {
  return (
    <MotionReveal
      as="section"
      className={cn("mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12 lg:py-20", className)}
      id={id}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-4 max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">{description}</p>
      ) : null}
      <div className={cn(title || description ? "mt-10" : "")}>{children}</div>
    </MotionReveal>
  );
}
