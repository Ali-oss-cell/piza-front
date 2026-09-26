"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import {
  CATERING_MAX_GUESTS,
  CATERING_MIN_GUESTS,
  recommendForHeadcount,
} from "@/data/catering";
import { Slider } from "@/components/ui/slider";
import { StatCard } from "@/components/ui/stat-card";
import { cardShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export function CateringCalculator(): React.ReactElement {
  const [guests, setGuests] = useState(25);
  const recommendation = useMemo(() => recommendForHeadcount(guests), [guests]);

  return (
    <section className={cn(cardShell, "bg-zinc-50/80 p-6 dark:bg-zinc-900/40 md:p-8")}>
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-accent,#d81b60)]/10 text-[color:var(--brand-accent,#d81b60)]">
          <Calculator className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
            Event Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Slide to your guest count — we&apos;ll suggest quantities and an estimated budget.
          </p>
        </div>
      </div>

      <Slider
        label="Headcount"
        max={CATERING_MAX_GUESTS}
        min={CATERING_MIN_GUESTS}
        onChange={setGuests}
        value={guests}
        valueLabel={`${guests} guests`}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Large pizzas" value={String(recommendation.largePizzas)} />
        <StatCard label="Side trays" value={String(recommendation.sides)} />
        <StatCard label="Drink packs" value={String(recommendation.drinks)} />
        <StatCard
          highlight
          label="Est. per person"
          value={`$${recommendation.perPerson.toFixed(2)}`}
        />
      </div>

      <p className="mt-6 rounded-xl border border-zinc-200/60 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-white/[0.08] dark:bg-black/30 dark:text-zinc-400">
        Recommended spread:{" "}
        <strong className="text-zinc-900 dark:text-white">
          {recommendation.largePizzas} large pizzas, {recommendation.sides} side trays,{" "}
          {recommendation.drinks} drink packs
        </strong>{" "}
        — estimated total{" "}
        <strong className="text-zinc-900 dark:text-white">
          ${recommendation.estimatedTotal.toFixed(2)}
        </strong>{" "}
        (${recommendation.perPerson.toFixed(2)} / person)
      </p>
    </section>
  );
}
