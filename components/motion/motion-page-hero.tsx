"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  defaultTransition,
  fadeUp,
  fadeUpReduced,
  pageHeroBg,
} from "@/lib/motion-presets";

interface HeroCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface MotionPageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  ctas?: HeroCta[];
  children?: ReactNode;
  className?: string;
}

export function MotionPageHero({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  imageAlt = "",
  ctas = [],
  children,
  className = "",
}: MotionPageHeroProps): React.ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className={cn(
        "relative flex min-h-[42vh] items-end overflow-hidden md:min-h-[52vh]",
        className
      )}
    >
      {imageUrl ? (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-zinc-900"
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          variants={reduceMotion ? undefined : pageHeroBg}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={imageAlt} className="h-full w-full object-cover" src={imageUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
        </motion.div>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950"
        />
      )}

      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 md:px-8 md:pb-20 lg:px-12"
        initial="hidden"
        animate="visible"
        transition={{ ...defaultTransition, delay: 0.1 }}
        variants={reduceMotion ? fadeUpReduced : fadeUp}
      >
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-display text-4xl font-bold uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-lg text-zinc-200 md:text-xl">{subtitle}</p>
        ) : null}
        {ctas.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {ctas.map((cta) => (
              <Link
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full px-6 text-sm font-bold uppercase tracking-wide transition-colors",
                  cta.variant === "secondary"
                    ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
                    : "bg-[color:var(--brand-accent,#d81b60)] text-white hover:opacity-90"
                )}
                href={cta.href}
                key={`${cta.label}-${cta.href}`}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
        {children}
      </motion.div>
    </section>
  );
}
