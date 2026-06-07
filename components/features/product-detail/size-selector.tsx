"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/pricing";
import type { ProductSizeOption } from "@/types/product-detail";
import type { PizzaSize } from "@/types/menu";

interface SizeSelectorProps {
  options: ProductSizeOption[];
  selectedSize: PizzaSize;
  onSelect: (size: PizzaSize) => void;
}

export function SizeSelector({
  options,
  selectedSize,
  onSelect,
}: SizeSelectorProps): React.ReactElement {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const isActive = selectedSize === option.id;

        return (
          <button
            className={cn(
              "rounded-xl border px-4 py-4 text-left transition-all",
              isActive
                ? "border-[#d81b60] bg-[#d81b60] text-white shadow-lg shadow-[#d81b60]/20"
                : "border-zinc-200/60 bg-zinc-100 text-zinc-950 hover:border-zinc-300/80 hover:bg-zinc-200 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:hover:border-white/20 dark:hover:bg-zinc-700"
            )}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <span className="block text-sm font-semibold uppercase tracking-widest">{option.label}</span>
            <span className="mt-2 block text-xl font-bold">{formatCurrency(option.price)}</span>
            {option.deltaFromSmall > 0 ? (
              <span
                className={cn(
                  "mt-1 block text-xs",
                  isActive ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                +{formatCurrency(option.deltaFromSmall)} from small
              </span>
            ) : (
              <span
                className={cn(
                  "mt-1 block text-xs",
                  isActive ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                Base price
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
