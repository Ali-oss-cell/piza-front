"use client";

import Image from "next/image";
import { useState } from "react";
import { processSteps } from "@/data/about";
import { RevealSection } from "@/components/features/about/reveal-section";
import { cn } from "@/lib/utils";

export function AboutProcess(): React.ReactElement {
  const [activeStepId, setActiveStepId] = useState(processSteps[0].id);
  const activeStep = processSteps.find((step) => step.id === activeStepId) ?? processSteps[0];

  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
            From Dough to Flame
          </p>
          <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-4xl">
            The Leovorno Process
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-wrap gap-3">
            {processSteps.map((step) => (
              <button
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition-all duration-300",
                  activeStepId === step.id
                    ? "border-[#d81b60] bg-[#d81b60] text-white"
                    : "border-zinc-200/60 bg-white/70 text-zinc-600 hover:border-zinc-300/80 hover:text-zinc-950 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-white"
                )}
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                type="button"
              >
                {step.step}. {step.title}
              </button>
            ))}
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40 lg:min-h-[420px]">
            <Image
              alt={activeStep.imageAlt}
              className="object-cover transition-opacity duration-150"
              fill
              key={activeStep.id}
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={activeStep.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent transition-colors duration-150 ease-out dark:from-black dark:via-black/20 dark:to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d81b60]">
                Step {activeStep.step}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
                {activeStep.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-300 md:text-base">
                {activeStep.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
