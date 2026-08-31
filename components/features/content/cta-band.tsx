"use client";

import Link from "next/link";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { cn } from "@/lib/utils";

interface CtaBandProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export function CtaBand({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className = "",
}: CtaBandProps): React.ReactElement {
  return (
    <MotionReveal
      className={cn(
        "mx-4 mb-16 rounded-3xl bg-zinc-950 px-6 py-14 text-center text-white md:mx-8 lg:mx-auto lg:max-w-7xl lg:px-12",
        className
      )}
    >
      <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
        {title}
      </h2>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-zinc-300">{description}</p> : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--brand-accent,#d81b60)] px-6 text-sm font-bold uppercase tracking-wide hover:opacity-90"
          href={primaryHref}
        >
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 text-sm font-bold uppercase tracking-wide hover:bg-white/10"
            href={secondaryHref}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </MotionReveal>
  );
}
