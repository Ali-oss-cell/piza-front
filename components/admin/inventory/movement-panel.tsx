"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatStockQty } from "@/components/admin/inventory/inventory-utils";
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
import { STOCK_MOVEMENT_LABELS, STOCK_UNIT_LABELS } from "@/types/inventory";

type BulkMovementType = Exclude<StockMovementType, "SALE" | "RECEIVE" | "REFUND">;

interface MovementPanelProps {
  token: string;
  brandSlug: string;
  type: BulkMovementType;
  items: StockItem[];
  onItemsChange: (items: StockItem[]) => void;
  onSummaryChange: (summary: InventorySummary) => void;
}

type RowDraft = {
  qty: string;
};

function emptyDrafts(items: StockItem[]): Record<string, RowDraft> {
  const next: Record<string, RowDraft> = {};
  for (const item of items) {
    next[item.id] = { qty: "" };
  }
  return next;
}

const DESCRIPTIONS: Record<BulkMovementType, string> = {
  WASTE:
    "Enter how much you are discarding for each item. Leave blank to skip. Fractions like 0.5 are allowed.",
  ADJUST:
    "Enter a signed delta for each item you need to correct (+ add / − remove). Leave blank to skip.",
  COUNT:
    "Enter the counted on-hand for each item you counted. Leave blank to skip — only filled rows are saved.",
};

const QTY_HEADERS: Record<BulkMovementType, string> = {
  WASTE: "Waste qty",
  ADJUST: "Delta (+/−)",
  COUNT: "Counted qty",
};

const SAVE_LABELS: Record<BulkMovementType, string> = {
  WASTE: "Save waste",
  ADJUST: "Save adjust",
  COUNT: "Save count",
};

function previewAfter(
  type: BulkMovementType,
  onHand: number,
  value: number,
): number {
  if (type === "COUNT") {
    return value;
  }
  if (type === "WASTE") {
    return onHand - value;
  }
  return onHand + value;
}

function isPendingValue(type: BulkMovementType, raw: string): number | null {
  if (raw.trim() === "") {
    return null;
  }
  const qty = Number(raw);
  if (!Number.isFinite(qty)) {
    return null;
  }
  if (type === "WASTE" && qty <= 0) {
    return null;
  }
  if (type === "COUNT" && qty < 0) {
    return null;
  }
  if (type === "ADJUST" && qty === 0) {
    return null;
  }
  return qty;
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
      [...items]
        .filter((item) => item.isActive)
        .sort((a, b) => {
          const cat = (a.category ?? "").localeCompare(b.category ?? "");
          if (cat !== 0) {
            return cat;
          }
          return a.name.localeCompare(b.name);
        }),
    [items],
  );

  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>(() =>
    emptyDrafts(activeItems),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(emptyDrafts(activeItems));
    setSearch("");
    setNote("");
    setError(null);
    setSuccess(null);
  }, [type]);

  useEffect(() => {
    setDrafts((current) => {
      const next = { ...current };
      for (const item of activeItems) {
        if (!next[item.id]) {
          next[item.id] = { qty: "" };
        }
      }
      return next;
    });
  }, [activeItems]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return activeItems;
    }
    return activeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.category?.toLowerCase().includes(query) ?? false) ||
        (item.sku?.toLowerCase().includes(query) ?? false),
    );
  }, [activeItems, search]);

  const pendingRows = useMemo(() => {
    return activeItems
      .map((item) => {
        const draft = drafts[item.id];
        const qty = isPendingValue(type, draft?.qty ?? "");
        if (qty === null) {
          return null;
        }
        return { item, qty };
      })
      .filter(Boolean) as Array<{ item: StockItem; qty: number }>;
  }, [activeItems, drafts, type]);

  const updateDraft = (id: string, qty: string): void => {
    setDrafts((current) => ({
      ...current,
      [id]: { qty },
    }));
  };

  const handleSave = async (): Promise<void> => {
    if (pendingRows.length === 0) {
      setError(
        type === "COUNT"
          ? "Enter a counted quantity on at least one item."
          : type === "ADJUST"
            ? "Enter a non-zero delta on at least one item."
            : "Enter a waste quantity on at least one item.",
      );
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let nextItems = [...items];
      for (const row of pendingRows) {
        const payload: CreateStockMovementPayload = {
          type,
          reason: note.trim() || null,
        };
        if (type === "COUNT") {
          payload.countedQty = row.qty;
        } else {
          payload.qty = row.qty;
        }

        const result = await createStockMovement(
          token,
          row.item.id,
          payload,
          brandSlug,
        );
        nextItems = nextItems.map((entry) =>
          entry.id === result.item.id ? result.item : entry,
        );
      }
      onItemsChange(nextItems);
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
      setDrafts(emptyDrafts(nextItems.filter((item) => item.isActive)));
      setSuccess(
        `${STOCK_MOVEMENT_LABELS[type]} saved for ${pendingRows.length} line${pendingRows.length === 1 ? "" : "s"}. On-hand updated.`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Unable to save ${STOCK_MOVEMENT_LABELS[type].toLowerCase()}.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          {STOCK_MOVEMENT_LABELS[type]}
        </h2>
        <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
          {DESCRIPTIONS[type]}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
        <div className="min-w-[14rem] flex-1">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Reason (all lines)
          </label>
          <Input
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
            value={note}
          />
        </div>
        <div className="min-w-[12rem] flex-1">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Search
          </label>
          <Input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, category, SKU…"
            value={search}
          />
        </div>
        <Button
          disabled={isSaving || pendingRows.length === 0}
          onClick={() => void handleSave()}
          type="button"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {SAVE_LABELS[type]}
          {pendingRows.length > 0 ? ` (${pendingRows.length})` : ""}
        </Button>
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

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
            <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
              <th className="px-4 py-3 font-semibold">Stock item</th>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">On hand</th>
              <th className="px-4 py-3 font-semibold">{QTY_HEADERS[type]}</th>
              <th className="px-4 py-3 font-semibold">After save</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  className={cn("px-4 py-10 text-center", secondaryText)}
                  colSpan={5}
                >
                  No stock items yet. Add items from Receive or Stock list.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const draft = drafts[item.id] ?? { qty: "" };
                const pendingQty = isPendingValue(type, draft.qty);
                const onHand = Number(item.qtyOnHand);
                const after =
                  pendingQty === null
                    ? null
                    : previewAfter(type, onHand, pendingQty);

                return (
                  <tr
                    className="border-b border-zinc-100 dark:border-white/5"
                    key={item.id}
                  >
                    <td className={cn("px-4 py-3 font-medium", primaryText)}>
                      {item.name}
                      {item.category ? (
                        <span
                          className={cn(
                            "mt-0.5 block text-xs font-normal",
                            secondaryText,
                          )}
                        >
                          {item.category}
                        </span>
                      ) : null}
                    </td>
                    <td className={cn("px-4 py-3", secondaryText)}>
                      {STOCK_UNIT_LABELS[item.unit]}
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", primaryText)}>
                      {formatStockQty(item.qtyOnHand, item.unit)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-10 w-28"
                        inputMode="decimal"
                        onChange={(event) =>
                          updateDraft(item.id, event.target.value)
                        }
                        placeholder={
                          type === "ADJUST"
                            ? "e.g. -2"
                            : type === "COUNT"
                              ? "Count"
                              : "0"
                        }
                        value={draft.qty}
                      />
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                      {after === null
                        ? "—"
                        : formatStockQty(String(after), item.unit)}
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
