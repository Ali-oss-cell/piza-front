"use client";

import Image from "next/image";
import { processSection, processSteps } from "@/data/about";
import { RevealSection } from "@/components/features/about/reveal-section";
import { cn } from "@/lib/utils";

export function AboutProcess(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-12">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--brand-accent,#d81b60)]">
            {processSection.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-4xl">
            {processSection.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-lg">
            {processSection.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                className={cn(
                  "flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-white p-6 text-center shadow-sm transition-colors duration-150 ease-out",
                  "dark:border-white/10 dark:bg-zinc-900/50"
                )}
                key={step.id}
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--brand-accent,#d81b60)]/20 bg-[color:var(--brand-accent,#d81b60)]/10 text-[color:var(--brand-accent,#d81b60)]">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Step {step.step}
                </p>
                <h3 className="mt-2 text-xl font-bold text-zinc-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="relative mt-10 aspect-[21/9] min-h-[220px] overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-white/10 md:mt-12">
          <Image
            alt={processSection.imageAlt}
            className="object-cover"
            fill
            sizes="100vw"
            src={processSection.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>
    </RevealSection>
  );
}
