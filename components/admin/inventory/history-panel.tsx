"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { fetchStockMovements } from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { StockItem, StockMovement } from "@/types/inventory";
import { STOCK_MOVEMENT_LABELS } from "@/types/inventory";

interface HistoryPanelProps {
  token: string;
  brandSlug: string;
  items: StockItem[];
}

export function HistoryPanel({
  token,
  brandSlug,
  items,
}: HistoryPanelProps): React.ReactElement {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  const [itemId, setItemId] = useState("");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = sortedItems.find((item) => item.id === itemId) ?? null;

  useEffect(() => {
    if (!itemId) {
      setMovements([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetchStockMovements(token, itemId, brandSlug)
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
  }, [token, brandSlug, itemId]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          History
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Movement ledger for a stock item — who, when, delta, and resulting qty.
        </p>
      </div>

      <div>
        <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
          Stock item
        </label>
        <select
          className={cn(inventorySelectClassName, "max-w-md")}
          onChange={(event) => setItemId(event.target.value)}
          value={itemId}
        >
          <option value="">Select item…</option>
          {sortedItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {!item.isActive ? " (inactive)" : ""}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <p className={cn("text-xs", secondaryText)}>
          On hand: {formatStockQty(selected.qtyOnHand, selected.unit)}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        {!itemId ? (
          <p className={cn("text-sm", secondaryText)}>
            Choose an item to see its movement history.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className={cn("h-6 w-6 animate-spin", secondaryText)} />
          </div>
        ) : movements.length === 0 ? (
          <p className={cn("text-sm", secondaryText)}>No movements yet.</p>
        ) : (
          movements.map((movement) => {
            const delta = Number(movement.deltaQty);
            const signed =
              delta > 0 ? `+${movement.deltaQty}` : movement.deltaQty;
            return (
              <div
                className="rounded-lg border border-zinc-200/50 px-3 py-2 dark:border-white/10"
                key={movement.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-sm font-medium", primaryText)}>
                    {STOCK_MOVEMENT_LABELS[movement.type]}{" "}
                    <span
                      className={
                        delta < 0 ? "text-red-500" : "text-emerald-600"
                      }
                    >
                      {signed}
                    </span>
                  </p>
                  <p className={cn("text-xs", secondaryText)}>
                    → {movement.qtyAfter}
                  </p>
                </div>
                <p className={cn("mt-0.5 text-xs", secondaryText)}>
                  {new Date(movement.createdAt).toLocaleString()}
                  {movement.createdByName
                    ? ` · ${movement.createdByName}`
                    : ""}
                  {movement.reason ? ` · ${movement.reason}` : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
