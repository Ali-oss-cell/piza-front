"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pizzaImages } from "@/data/images";
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
  return (
    <section className="relative min-h-[72vh] overflow-hidden">
      <Image
        alt="Catering pizza boxes and party spread"
        className="object-cover object-center saturate-[1.05]"
        fill
        priority
        sizes="100vw"
        src={pizzaImages[0].imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      <div className="relative mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Users className="h-4 w-4 text-[color:var(--brand-accent,#d81b60)]" />
            Feeds 10–500 people
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            Catering for Every Occasion
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-200 md:text-xl">
            Corporate lunches, private parties, and large events — bold flavours, generous portions,
            and per-person pricing that makes budgeting easy.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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
          </div>

          <p className="mt-4 text-sm text-zinc-400">
            Packages under $500 checkout instantly · Larger events get a custom quote within 24 hours
          </p>
        </div>
      </div>
    </section>
  );
}
