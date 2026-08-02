"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStockMovement,
  fetchInventorySummary,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  CreateStockMovementPayload,
  InventorySummary,
  StockItem,
  StockMovementType,
} from "@/types/inventory";
import { STOCK_MOVEMENT_LABELS } from "@/types/inventory";

interface MovementPanelProps {
  token: string;
  brandSlug: string;
  type: Exclude<StockMovementType, "SALE">;
  items: StockItem[];
  onItemsChange: (items: StockItem[]) => void;
  onSummaryChange: (summary: InventorySummary) => void;
}

function todayInputValue(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function MovementPanel({
  token,
  brandSlug,
  type,
  items,
  onItemsChange,
  onSummaryChange,
}: MovementPanelProps): React.ReactElement {
  const activeItems = useMemo(
    () =>
      items
        .filter((item) => item.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("");
  const [countedQty, setCountedQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [receivedAt, setReceivedAt] = useState(todayInputValue);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selected = activeItems.find((item) => item.id === itemId) ?? null;

  const descriptions: Record<Exclude<StockMovementType, "SALE">, string> = {
    RECEIVE:
      "Record a purchase delivery — quantity, what you paid per unit this time, and the receive date.",
    WASTE: "Remove stock for spoilage or discard.",
    ADJUST: "Correct on-hand with a signed delta (+/−).",
    COUNT: "Set absolute quantity after a physical count.",
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selected) {
      setError("Select a stock item.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const payload: CreateStockMovementPayload = {
      type,
      reason: reason.trim() || null,
    };

    if (type === "COUNT") {
      payload.countedQty = Number(countedQty);
    } else {
      payload.qty = Number(qty);
    }

    if (type === "RECEIVE") {
      payload.unitCost = Number(unitCost);
      payload.receivedAt = receivedAt
        ? new Date(`${receivedAt}T12:00:00`).toISOString()
        : undefined;
    }

    try {
      const result = await createStockMovement(
        token,
        selected.id,
        payload,
        brandSlug,
      );
      onItemsChange(
        items.map((entry) =>
          entry.id === result.item.id ? result.item : entry,
        ),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
      setQty("");
      setCountedQty("");
      setUnitCost("");
      setReason("");
      setReceivedAt(todayInputValue());

      const avg =
        result.item.costPerUnit != null
          ? ` Avg cost now $${Number(result.item.costPerUnit).toFixed(2)}.`
          : "";
      setSuccess(
        `${STOCK_MOVEMENT_LABELS[type]} recorded. On hand: ${formatStockQty(result.item.qtyOnHand, result.item.unit)}.${avg}`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to record movement.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          {STOCK_MOVEMENT_LABELS[type]}
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          {descriptions[type]}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 dark:border-white/10 dark:bg-zinc-900/30">
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
            Stock item
          </label>
          <select
            className={inventorySelectClassName}
            onChange={(event) => {
              setItemId(event.target.value);
              setSuccess(null);
              setError(null);
            }}
            value={itemId}
          >
            <option value="">Select item…</option>
            {activeItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({formatStockQty(item.qtyOnHand, item.unit)})
              </option>
            ))}
          </select>
        </div>

        {selected ? (
          <p className={cn("text-xs", secondaryText)}>
            On hand: {formatStockQty(selected.qtyOnHand, selected.unit)}
            {selected.costPerUnit != null
              ? ` · avg cost $${Number(selected.costPerUnit).toFixed(2)}`
              : ""}
          </p>
        ) : null}

        {type === "COUNT" ? (
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
              Counted qty
            </label>
            <Input
              inputMode="decimal"
              onChange={(event) => setCountedQty(event.target.value)}
              value={countedQty}
            />
          </div>
        ) : (
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
              {type === "ADJUST" ? "Delta (+/−)" : "Quantity"}
            </label>
            <Input
              inputMode="decimal"
              onChange={(event) => setQty(event.target.value)}
              placeholder={type === "ADJUST" ? "e.g. -2 or 1.5" : ""}
              value={qty}
            />
          </div>
        )}

        {type === "RECEIVE" ? (
          <>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Unit cost this delivery (AUD)
              </label>
              <Input
                inputMode="decimal"
                onChange={(event) => setUnitCost(event.target.value)}
                placeholder="What you paid per unit this time"
                value={unitCost}
              />
              <p className={cn("mt-1 text-xs", secondaryText)}>
                Can be higher, lower, or the same as last time — we update the
                average cost.
              </p>
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Receive date
              </label>
              <Input
                onChange={(event) => setReceivedAt(event.target.value)}
                type="date"
                value={receivedAt}
              />
            </div>
          </>
        ) : null}

        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
            {type === "RECEIVE" ? "Note / supplier" : "Reason"}
          </label>
          <Input
            onChange={(event) => setReason(event.target.value)}
            placeholder="Optional"
            value={reason}
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </p>
        ) : null}

        <Button
          className="w-full"
          disabled={isSaving || !itemId}
          onClick={() => void handleSubmit()}
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Record {STOCK_MOVEMENT_LABELS[type].toLowerCase()}
        </Button>
      </div>
    </div>
  );
}
