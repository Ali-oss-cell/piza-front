"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/pricing";
import type { CrustOption } from "@/types/product-detail";

interface CrustSelectorProps {
  options: CrustOption[];
  selectedCrustId: string;
  onSelect: (crustId: string) => void;
}

export function CrustSelector({
  options,
  selectedCrustId,
  onSelect,
}: CrustSelectorProps): React.ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isActive = selectedCrustId === option.id;

        return (
          <button
            className={cn(
              "rounded-xl border px-4 py-4 text-left transition-all",
              isActive
                ? "border-[#d81b60] bg-[#d81b60] text-white"
                : "border-zinc-200/60 bg-zinc-100 text-zinc-950 hover:border-zinc-300/80 hover:bg-zinc-200 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:hover:border-white/20 dark:hover:bg-zinc-700"
            )}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span
              className={cn(
                "mt-2 block text-xs",
                isActive ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              {option.priceDelta > 0
                ? `+${formatCurrency(option.priceDelta)}`
                : "Included"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
