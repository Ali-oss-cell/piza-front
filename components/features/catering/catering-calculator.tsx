"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import {
  CATERING_MAX_GUESTS,
  CATERING_MIN_GUESTS,
  recommendForHeadcount,
} from "@/data/catering";
import { cn } from "@/lib/utils";

export function CateringCalculator(): React.ReactElement {
  const [guests, setGuests] = useState(25);
  const recommendation = useMemo(() => recommendForHeadcount(guests), [guests]);

  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-6 dark:border-white/10 dark:bg-zinc-900/40 md:p-8">
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

      <label className="block">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Headcount</span>
          <span className="text-lg font-bold text-zinc-950 dark:text-white">{guests} guests</span>
        </div>
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-[color:var(--brand-accent,#d81b60)] dark:bg-zinc-700"
          max={CATERING_MAX_GUESTS}
          min={CATERING_MIN_GUESTS}
          onChange={(event) => setGuests(Number(event.target.value))}
          type="range"
          value={guests}
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>{CATERING_MIN_GUESTS}</span>
          <span>{CATERING_MAX_GUESTS}</span>
        </div>
      </label>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RecommendationCard label="Large pizzas" value={String(recommendation.largePizzas)} />
        <RecommendationCard label="Side trays" value={String(recommendation.sides)} />
        <RecommendationCard label="Drink packs" value={String(recommendation.drinks)} />
        <RecommendationCard
          highlight
          label="Est. per person"
          value={`$${recommendation.perPerson.toFixed(2)}`}
        />
      </div>

      <p className="mt-6 rounded-xl border border-zinc-200/60 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/30 dark:text-zinc-400">
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

function RecommendationCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4 text-center",
        highlight
          ? "border-[color:var(--brand-accent,#d81b60)]/30 bg-[color:var(--brand-accent,#d81b60)]/5"
          : "border-zinc-200/60 bg-white dark:border-white/10 dark:bg-zinc-950/50"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold",
          highlight ? "text-[color:var(--brand-accent,#d81b60)]" : "text-zinc-950 dark:text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}
