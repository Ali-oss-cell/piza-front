"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStockItem,
  createStockMovement,
  fetchInventorySummary,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  InventorySummary,
  StockItem,
  StockUnit,
} from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";

const UNITS = Object.keys(STOCK_UNIT_LABELS) as StockUnit[];

interface ReceivePanelProps {
  token: string;
  brandSlug: string;
  items: StockItem[];
  onItemsChange: (items: StockItem[]) => void;
  onSummaryChange: (summary: InventorySummary) => void;
}

type RowDraft = {
  qty: string;
  unitCost: string;
};

function todayInputValue(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyDrafts(items: StockItem[]): Record<string, RowDraft> {
  const next: Record<string, RowDraft> = {};
  for (const item of items) {
    next[item.id] = {
      qty: "",
      unitCost: item.costPerUnit ?? "",
    };
  }
  return next;
}

export function ReceivePanel({
  token,
  brandSlug,
  items,
  onItemsChange,
  onSummaryChange,
}: ReceivePanelProps): React.ReactElement {
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
  const [receivedAt, setReceivedAt] = useState(todayInputValue);
  const [note, setNote] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>(() =>
    emptyDrafts(activeItems),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState<StockUnit>("EACH");
  const [newCategory, setNewCategory] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCost, setNewCost] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setDrafts((current) => {
      const next = { ...current };
      for (const item of activeItems) {
        if (!next[item.id]) {
          next[item.id] = {
            qty: "",
            unitCost: item.costPerUnit ?? "",
          };
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
        const qty = Number(draft?.qty ?? "");
        if (!draft || !Number.isFinite(qty) || qty <= 0) {
          return null;
        }
        return { item, qty, unitCost: draft.unitCost };
      })
      .filter(Boolean) as Array<{
      item: StockItem;
      qty: number;
      unitCost: string;
    }>;
  }, [activeItems, drafts]);

  const updateDraft = (
    id: string,
    patch: Partial<RowDraft>,
  ): void => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        qty: current[id]?.qty ?? "",
        unitCost: current[id]?.unitCost ?? "",
        ...patch,
      },
    }));
  };

  const handleSave = async (): Promise<void> => {
    if (pendingRows.length === 0) {
      setError("Enter a quantity to add on at least one item.");
      return;
    }

    for (const row of pendingRows) {
      if (
        row.unitCost.trim() === "" ||
        Number.isNaN(Number(row.unitCost)) ||
        Number(row.unitCost) < 0
      ) {
        setError(
          `Enter unit cost (AUD) for "${row.item.name}" — what you paid this delivery.`,
        );
        return;
      }
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const receivedAtIso = receivedAt
      ? new Date(`${receivedAt}T12:00:00`).toISOString()
      : undefined;

    try {
      let nextItems = [...items];
      for (const row of pendingRows) {
        const result = await createStockMovement(
          token,
          row.item.id,
          {
            type: "RECEIVE",
            qty: row.qty,
            unitCost: Number(row.unitCost),
            receivedAt: receivedAtIso,
            reason: note.trim() || null,
          },
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
        `Received ${pendingRows.length} line${pendingRows.length === 1 ? "" : "s"}. On-hand updated (e.g. 2 + 1 = 3).`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save receive.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateItem = async (): Promise<void> => {
    if (!newName.trim()) {
      setError("New item needs a name.");
      return;
    }
    const qty = Number(newQty) || 0;
    const costRaw = newCost.trim();
    if (qty > 0 && (costRaw === "" || Number.isNaN(Number(costRaw)))) {
      setError("Unit cost is required when receiving opening qty.");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const created = await createStockItem(
        token,
        {
          name: newName.trim(),
          unit: newUnit,
          category: newCategory.trim() || null,
          qtyOnHand: qty,
          costPerUnit: costRaw === "" ? null : Number(costRaw),
        },
        brandSlug,
      );
      onItemsChange([...items, created]);
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
      setDrafts((current) => ({
        ...current,
        [created.id]: { qty: "", unitCost: created.costPerUnit ?? "" },
      }));
      setNewItemOpen(false);
      setNewName("");
      setNewUnit("EACH");
      setNewCategory("");
      setNewQty("");
      setNewCost("");
      setSuccess(`Added "${created.name}" to stock list.`);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to add item.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Receive
          </h2>
          <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
            Enter how much you are adding for each item. If you have 2 and add
            1, after save you will have 3. Fractions like 0.5 are allowed (half
            bottle, etc.).
          </p>
        </div>
        <Button onClick={() => setNewItemOpen(true)} type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New stock item
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
        <div>
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Receive date
          </label>
          <Input
            className="w-44"
            onChange={(event) => setReceivedAt(event.target.value)}
            type="date"
            value={receivedAt}
          />
        </div>
        <div className="min-w-[14rem] flex-1">
          <label className={cn("mb-1 block text-xs font-medium", secondaryText)}>
            Note / supplier (all lines)
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
          Save receive
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
              <th className="px-4 py-3 font-semibold">Add qty</th>
              <th className="px-4 py-3 font-semibold">Unit cost (AUD)</th>
              <th className="px-4 py-3 font-semibold">After save</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  className={cn("px-4 py-10 text-center", secondaryText)}
                  colSpan={6}
                >
                  No stock items yet. Add one with “New stock item”.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const draft = drafts[item.id] ?? { qty: "", unitCost: "" };
                const addQty = Number(draft.qty);
                const hasAdd = Number.isFinite(addQty) && addQty > 0;
                const after = hasAdd
                  ? Number(item.qtyOnHand) + addQty
                  : Number(item.qtyOnHand);

                return (
                  <tr
                    className="border-b border-zinc-100 dark:border-white/5"
                    key={item.id}
                  >
                    <td className={cn("px-4 py-3 font-medium", primaryText)}>
                      {item.name}
                      {item.category ? (
                        <span className={cn("mt-0.5 block text-xs font-normal", secondaryText)}>
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
                          updateDraft(item.id, { qty: event.target.value })
                        }
                        placeholder="0"
                        value={draft.qty}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-10 w-28"
                        inputMode="decimal"
                        onChange={(event) =>
                          updateDraft(item.id, {
                            unitCost: event.target.value,
                          })
                        }
                        placeholder="0.00"
                        value={draft.unitCost}
                      />
                    </td>
                    <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                      {hasAdd
                        ? formatStockQty(String(after), item.unit)
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog.Root onOpenChange={setNewItemOpen} open={newItemOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(96vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              New stock item
            </Dialog.Title>
            <p className={cn("mt-1 text-sm", secondaryText)}>
              Add something you are receiving for the first time.
            </p>
            <div className="mt-5 space-y-3">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Name
                </label>
                <Input
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. Flour bag, Green peppers"
                  value={newName}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Unit
                  </label>
                  <select
                    className={inventorySelectClassName}
                    onChange={(event) =>
                      setNewUnit(event.target.value as StockUnit)
                    }
                    value={newUnit}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {STOCK_UNIT_LABELS[unit]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Category
                  </label>
                  <Input
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder="Optional"
                    value={newCategory}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Opening qty
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) => setNewQty(event.target.value)}
                    placeholder="0 or 0.5"
                    value={newQty}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Unit cost (AUD)
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) => setNewCost(event.target.value)}
                    placeholder="If receiving now"
                    value={newCost}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setNewItemOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={isCreating || !newName.trim()}
                onClick={() => void handleCreateItem()}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add item
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
