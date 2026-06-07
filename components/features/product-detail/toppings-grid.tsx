"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/pricing";
import type { ToppingCategory } from "@/types/product-detail";

interface ToppingsGridProps {
  categories: ToppingCategory[];
  selectedToppingIds: string[];
  onToggle: (toppingId: string) => void;
}

export function ToppingsGrid({
  categories,
  selectedToppingIds,
  onToggle,
}: ToppingsGridProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
            {category.label}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {category.toppings.map((topping) => {
              const isActive = selectedToppingIds.includes(topping.id);

              return (
                <button
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                    isActive
                      ? "border-[#d81b60] bg-[#d81b60]/15 text-zinc-950 dark:text-white"
                      : "border-zinc-200/60 bg-zinc-100 text-zinc-950 hover:border-zinc-300/80 hover:bg-zinc-200 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:hover:border-white/20 dark:hover:bg-zinc-700"
                  )}
                  key={topping.id}
                  onClick={() => onToggle(topping.id)}
                  type="button"
                >
                  <div>
                    <span className="block text-sm font-medium">{topping.label}</span>
                    <span className="mt-1 block text-xs text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
                      +{formatCurrency(topping.priceDelta)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md border",
                      isActive
                        ? "border-[#d81b60] bg-[#d81b60] text-white"
                        : "border-zinc-300/60 bg-transparent text-transparent dark:border-white/20"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
