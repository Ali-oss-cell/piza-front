import type { StockUnit } from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";
import { cn } from "@/lib/utils";

export function formatStockQty(value: string, unit: StockUnit): string {
  const num = Number(value);
  const display = Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : value;
  return `${display} ${STOCK_UNIT_LABELS[unit]}`;
}

/** Light, readable select — avoid bg-background (often black in this theme). */
export const inventorySelectClassName = cn(
  "flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors",
  "focus:border-[#d81b60] focus:ring-2 focus:ring-[#d81b60]/20",
  "dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50",
);
