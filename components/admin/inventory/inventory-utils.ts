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

/** Units staff can switch between when editing recipe amounts. */
export function compatibleDisplayUnits(stockUnit: StockUnit): StockUnit[] {
  if (stockUnit === "KG" || stockUnit === "G") {
    return stockUnit === "KG" ? ["KG", "G"] : ["G", "KG"];
  }
  if (stockUnit === "L" || stockUnit === "ML") {
    return stockUnit === "L" ? ["L", "ML"] : ["ML", "L"];
  }
  return [stockUnit];
}

/**
 * Convert a quantity between compatible stock units.
 * Returns null when units are incompatible or the value is not finite.
 */
export function convertStockQty(
  value: number,
  fromUnit: StockUnit,
  toUnit: StockUnit,
): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }
  if (fromUnit === toUnit) {
    return value;
  }

  const mass =
    (fromUnit === "KG" || fromUnit === "G") &&
    (toUnit === "KG" || toUnit === "G");
  const volume =
    (fromUnit === "L" || fromUnit === "ML") &&
    (toUnit === "L" || toUnit === "ML");

  if (!mass && !volume) {
    return null;
  }

  // Normalize to the smaller unit (g / mL), then to target.
  const toSmall =
    fromUnit === "KG" || fromUnit === "L" ? value * 1000 : value;
  if (toUnit === "G" || toUnit === "ML") {
    return toSmall;
  }
  return toSmall / 1000;
}

/** Format a converted qty for inputs (trim trailing zeros, max 3 dp). */
export function formatQtyInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}

/** Convert a typed display-unit string into the stock item’s canonical unit. */
export function toStockUnitQty(
  input: string,
  displayUnit: StockUnit,
  stockUnit: StockUnit,
): number | null {
  const raw = Number(input);
  if (!Number.isFinite(raw) || raw <= 0) {
    return null;
  }
  const converted = convertStockQty(raw, displayUnit, stockUnit);
  if (converted === null) {
    return null;
  }
  return Math.round(converted * 1000) / 1000;
}

/** Convert a stored stock-unit qty into a display-unit string for editors. */
export function fromStockUnitQty(
  stored: string,
  stockUnit: StockUnit,
  displayUnit: StockUnit,
): string {
  const raw = Number(stored);
  if (!Number.isFinite(raw) || raw <= 0) {
    return "";
  }
  const converted = convertStockQty(raw, stockUnit, displayUnit);
  if (converted === null) {
    return formatQtyInput(raw);
  }
  return formatQtyInput(converted);
}

/**
 * Soft scale check: mass/volume amounts that look like a whole pack
 * rather than a per-pizza portion (e.g. ≥ 1 kg of cheese).
 */
export function isLikelyOversizedRecipeQty(
  input: string,
  displayUnit: StockUnit,
  stockUnit: StockUnit,
): boolean {
  const inStock = toStockUnitQty(input, displayUnit, stockUnit);
  if (inStock === null) {
    return false;
  }
  if (stockUnit === "KG" || stockUnit === "L") {
    return inStock >= 1;
  }
  if (stockUnit === "G" || stockUnit === "ML") {
    return inStock >= 1000;
  }
  return false;
}

/** Light, readable select — avoid bg-background (often black in this theme). */
export const inventorySelectClassName = cn(
  "flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors",
  "focus:border-[#d81b60] focus:ring-2 focus:ring-[#d81b60]/20",
  "dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50",
);
