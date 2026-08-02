import type { StockUnit } from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";

export function formatStockQty(value: string, unit: StockUnit): string {
  const num = Number(value);
  const display = Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : value;
  return `${display} ${STOCK_UNIT_LABELS[unit]}`;
}
