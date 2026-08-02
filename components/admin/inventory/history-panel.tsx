"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBrandStockMovements } from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  StockItem,
  StockMovement,
  StockMovementType,
  StockUnit,
} from "@/types/inventory";
import {
  STOCK_MOVEMENT_LABELS,
  STOCK_UNIT_LABELS,
} from "@/types/inventory";

interface HistoryPanelProps {
  token: string;
  brandSlug: string;
  items: StockItem[];
}

const TYPE_FILTERS: Array<StockMovementType | ""> = [
  "",
  "RECEIVE",
  "WASTE",
  "ADJUST",
  "COUNT",
  "SALE",
  "REFUND",
];

export function HistoryPanel({
  token,
  brandSlug,
  items,
}: HistoryPanelProps): React.ReactElement {
  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const cat = (a.category ?? "").localeCompare(b.category ?? "");
        if (cat !== 0) {
          return cat;
        }
        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StockMovementType | "">("");
  const [itemFilter, setItemFilter] = useState("");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetchBrandStockMovements(token, brandSlug, {
      take: 200,
      type: typeFilter || undefined,
      stockItemId: itemFilter || undefined,
    })
      .then((next) => {
        if (!cancelled) {
          setMovements(next);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load history.",
          );
          setMovements([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, brandSlug, typeFilter, itemFilter]);

  const filteredMovements = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return movements;
    }
    return movements.filter((movement) => {
      const name = (
        movement.stockItemName ??
        sortedItems.find((item) => item.id === movement.stockItemId)?.name ??
        ""
      ).toLowerCase();
      const reason = (movement.reason ?? "").toLowerCase();
      const by = (movement.createdByName ?? "").toLowerCase();
      const typeLabel = (
        STOCK_MOVEMENT_LABELS[movement.type] ?? movement.type
      ).toLowerCase();
      return (
        name.includes(query) ||
        reason.includes(query) ||
        by.includes(query) ||
        typeLabel.includes(query)
      );
    });
  }, [movements, search, sortedItems]);

  const resolveUnit = (movement: StockMovement): StockUnit | undefined => {
    if (
      movement.stockItemUnit &&
      movement.stockItemUnit in STOCK_UNIT_LABELS
    ) {
      return movement.stockItemUnit as StockUnit;
    }
    return sortedItems.find((item) => item.id === movement.stockItemId)?.unit;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          History
        </h2>
        <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
          Full movement ledger for this store — item, type, delta, resulting
          qty, cost, and who recorded it.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
        <div className="min-w-[12rem] flex-1">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Search
          </label>
          <Input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Item, reason, person, type…"
            value={search}
          />
        </div>
        <div className="min-w-[10rem]">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Type
          </label>
          <select
            className={inventorySelectClassName}
            onChange={(event) =>
              setTypeFilter(event.target.value as StockMovementType | "")
            }
            value={typeFilter}
          >
            {TYPE_FILTERS.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? STOCK_MOVEMENT_LABELS[value] ?? value : "All types"}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Stock item
          </label>
          <select
            className={inventorySelectClassName}
            onChange={(event) => setItemFilter(event.target.value)}
            value={itemFilter}
          >
            <option value="">All items</option>
            {sortedItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {!item.isActive ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={isLoading}
          onClick={() => {
            setSearch("");
            setTypeFilter("");
            setItemFilter("");
          }}
          type="button"
          variant="outline"
        >
          Clear filters
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
            <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Stock item</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Delta</th>
              <th className="px-4 py-3 font-semibold">Qty after</th>
              <th className="px-4 py-3 font-semibold">Unit cost</th>
              <th className="px-4 py-3 font-semibold">By</th>
              <th className="px-4 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-10 text-center" colSpan={8}>
                  <Loader2
                    className={cn(
                      "mx-auto h-6 w-6 animate-spin",
                      secondaryText,
                    )}
                  />
                </td>
              </tr>
            ) : filteredMovements.length === 0 ? (
              <tr>
                <td
                  className={cn("px-4 py-10 text-center", secondaryText)}
                  colSpan={8}
                >
                  No movements yet
                  {search || typeFilter || itemFilter
                    ? " for these filters"
                    : ""}
                  .
                </td>
              </tr>
            ) : (
              filteredMovements.map((movement) => {
                const delta = Number(movement.deltaQty);
                const signed =
                  delta > 0 ? `+${movement.deltaQty}` : movement.deltaQty;
                const unit = resolveUnit(movement);
                const itemName =
                  movement.stockItemName ??
                  sortedItems.find((item) => item.id === movement.stockItemId)
                    ?.name ??
                  "Unknown item";

                return (
                  <tr
                    className="border-b border-zinc-100 dark:border-white/5"
                    key={movement.id}
                  >
                    <td className={cn("px-4 py-3 whitespace-nowrap", secondaryText)}>
                      <span className="block">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </span>
                      <span className="block text-xs">
                        {new Date(movement.createdAt).toLocaleTimeString()}
                      </span>
                      {movement.type === "RECEIVE" && movement.receivedAt ? (
                        <span className="mt-0.5 block text-xs">
                          recv{" "}
                          {new Date(movement.receivedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </td>
                    <td className={cn("px-4 py-3 font-medium", primaryText)}>
                      {itemName}
                      {unit ? (
                        <span
                          className={cn(
                            "mt-0.5 block text-xs font-normal",
                            secondaryText,
                          )}
                        >
                          {STOCK_UNIT_LABELS[unit]}
                        </span>
                      ) : null}
                    </td>
                    <td className={cn("px-4 py-3", primaryText)}>
                      {STOCK_MOVEMENT_LABELS[movement.type] ?? movement.type}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 tabular-nums font-medium",
                        delta < 0 ? "text-red-500" : "text-emerald-600",
                      )}
                    >
                      {signed}
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", primaryText)}>
                      {unit
                        ? formatStockQty(movement.qtyAfter, unit)
                        : movement.qtyAfter}
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                      {movement.unitCost != null
                        ? `$${Number(movement.unitCost).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className={cn("px-4 py-3", secondaryText)}>
                      {movement.createdByName ?? "—"}
                    </td>
                    <td className={cn("max-w-[14rem] truncate px-4 py-3", secondaryText)}>
                      {movement.reason ?? "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
