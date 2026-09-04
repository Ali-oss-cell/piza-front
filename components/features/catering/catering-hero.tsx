"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pizzaImages } from "@/data/images";
import {
  defaultTransition,
  fadeUp,
  fadeUpReduced,
  pageHeroBg,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
} from "@/lib/motion-presets";
import type { CateringFlow } from "@/types/catering";
import { cn } from "@/lib/utils";

interface CateringHeroProps {
  flow: CateringFlow;
  onFlowChange: (flow: CateringFlow) => void;
  onInstantClick: () => void;
  onQuoteClick: () => void;
}

export function CateringHero({
  flow,
  onFlowChange,
  onInstantClick,
  onQuoteClick,
}: CateringHeroProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const itemVariants = reduceMotion ? staggerItemReduced : staggerItem;

  return (
    <section className="relative min-h-[72vh] overflow-hidden">
      <motion.div
        animate="visible"
        className="absolute inset-0"
        initial="hidden"
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        variants={reduceMotion ? undefined : pageHeroBg}
      >
        <Image
          alt="Catering pizza boxes and party spread"
          className="object-cover object-center saturate-[1.05]"
          fill
          priority
          sizes="100vw"
          src={pizzaImages[3].imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </motion.div>

      <motion.div
        animate="visible"
        className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 md:px-8 lg:px-12"
        initial="hidden"
        variants={staggerContainer}
      >
        <div className="max-w-3xl">
          <motion.span
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
            transition={defaultTransition}
            variants={itemVariants}
          >
            <Users className="h-4 w-4 text-[color:var(--brand-accent,#d81b60)]" />
            Feeds 10–500 people
          </motion.span>
          <motion.h1
            className="font-display text-4xl font-bold leading-tight text-white md:text-6xl"
            transition={defaultTransition}
            variants={itemVariants}
          >
            Catering for Every Occasion
          </motion.h1>
          <motion.p
            className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-200 md:text-xl"
            transition={defaultTransition}
            variants={itemVariants}
          >
            Corporate lunches, private parties, and large events — bold flavours, generous portions,
            and per-person pricing that makes budgeting easy.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            transition={defaultTransition}
            variants={itemVariants}
          >
            <Button
              className={cn(
                "h-12 rounded-xl px-6 uppercase tracking-[0.12em]",
                flow === "instant"
                  ? "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
                  : "border-white/30 bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => {
                onFlowChange("instant");
                onInstantClick();
              }}
              variant={flow === "instant" ? "default" : "outline"}
            >
              Order Catering
            </Button>
            <Button
              className={cn(
                "h-12 rounded-xl px-6 uppercase tracking-[0.12em]",
                flow === "quote"
                  ? "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
                  : "border-white/30 bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => {
                onFlowChange("quote");
                onQuoteClick();
              }}
              variant={flow === "quote" ? "default" : "outline"}
            >
              Request Quote
            </Button>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-zinc-400"
            transition={defaultTransition}
            variants={reduceMotion ? fadeUpReduced : fadeUp}
          >
            Packages under $500 checkout instantly · Larger events get a custom quote within 24 hours
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
