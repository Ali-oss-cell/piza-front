"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cinematicTransition } from "@/lib/layout-e/motion-tokens";

function parseStat(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { target: 0, suffix: value };
  return { target: Number(match[1]), suffix: match[2] ?? "" };
}

function AnimatedStat({
  value,
  label,
}: {
  value: string;
  label: string;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { target, suffix } = parseStat(value);
  const [display, setDisplay] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(target);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, target]);

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      transition={cinematicTransition}
      viewport={{ once: true, amount: 0.4 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <p className="font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-[88px]">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
    </motion.div>
  );
}

export function NumbersStrip({
  stats,
}: {
  stats: Array<{ value: string; label: string }>;
}): React.ReactElement {
  return (
    <section className="border-y border-white/10 px-margin-mobile py-16 md:px-margin-desktop md:py-28">
      <div className="mx-auto grid max-w-container-max gap-10 sm:grid-cols-3">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
