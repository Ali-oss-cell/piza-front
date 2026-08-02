"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStockItem,
  deactivateStockItem,
  fetchInventorySummary,
  updateStockItem,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import type {
  CreateStockItemPayload,
  InventorySummary,
  StockItem,
  StockUnit,
  UpdateStockItemPayload,
} from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";

const UNITS = Object.keys(STOCK_UNIT_LABELS) as StockUnit[];

interface ItemFormState {
  name: string;
  sku: string;
  category: string;
  unit: StockUnit;
  qtyOnHand: string;
  lowStockAt: string;
  costPerUnit: string;
  notes: string;
  isActive: boolean;
}

interface CreateRow extends ItemFormState {
  key: string;
}

function emptyItemForm(): ItemFormState {
  return {
    name: "",
    sku: "",
    category: "",
    unit: "EACH",
    qtyOnHand: "0",
    lowStockAt: "",
    costPerUnit: "",
    notes: "",
    isActive: true,
  };
}

function emptyCreateRow(): CreateRow {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...emptyItemForm(),
  };
}

function formFromItem(item: StockItem): ItemFormState {
  return {
    name: item.name,
    sku: item.sku ?? "",
    category: item.category ?? "",
    unit: item.unit,
    qtyOnHand: item.qtyOnHand,
    lowStockAt: item.lowStockAt ?? "",
    costPerUnit: item.costPerUnit ?? "",
    notes: item.notes ?? "",
    isActive: item.isActive,
  };
}

function rowToPayload(row: ItemFormState): CreateStockItemPayload | null {
  if (!row.name.trim()) {
    return null;
  }
  const lowStockRaw = row.lowStockAt.trim();
  const costRaw = row.costPerUnit.trim();
  return {
    name: row.name.trim(),
    sku: row.sku.trim() || null,
    category: row.category.trim() || null,
    unit: row.unit,
    qtyOnHand: Number(row.qtyOnHand) || 0,
    lowStockAt: lowStockRaw === "" ? null : Number(lowStockRaw),
    costPerUnit: costRaw === "" ? null : Number(costRaw),
    notes: row.notes.trim() || null,
    isActive: row.isActive,
  };
}

interface StockListPanelProps {
  token: string;
  brandSlug: string;
  items: StockItem[];
  summary: InventorySummary | null;
  onItemsChange: (items: StockItem[]) => void;
  onSummaryChange: (summary: InventorySummary) => void;
  lowStockOnly?: boolean;
  title?: string;
  description?: string;
}

export function StockListPanel({
  token,
  brandSlug,
  items,
  summary,
  onItemsChange,
  onSummaryChange,
  lowStockOnly = false,
  title = "Stock list",
  description = "Catalog items for this store — add, edit, or deactivate.",
}: StockListPanelProps): React.ReactElement {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);
  const [createRows, setCreateRows] = useState<CreateRow[]>([
    emptyCreateRow(),
    emptyCreateRow(),
    emptyCreateRow(),
  ]);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => (showInactive ? true : item.isActive))
      .filter((item) => (lowStockOnly ? item.isLowStock : true))
      .filter((item) => {
        if (!query) {
          return true;
        }
        return (
          item.name.toLowerCase().includes(query) ||
          (item.sku?.toLowerCase().includes(query) ?? false) ||
          (item.category?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => {
        const cat = (a.category ?? "").localeCompare(b.category ?? "");
        if (cat !== 0) {
          return cat;
        }
        return a.name.localeCompare(b.name);
      });
  }, [items, search, showInactive, lowStockOnly]);

  const pendingCreateCount = useMemo(
    () => createRows.filter((row) => row.name.trim()).length,
    [createRows],
  );

  const openCreateItem = (): void => {
    setItemModalMode("create");
    setEditingItem(null);
    setCreateRows([emptyCreateRow(), emptyCreateRow(), emptyCreateRow()]);
    setError(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item: StockItem): void => {
    setItemModalMode("edit");
    setEditingItem(item);
    setItemForm(formFromItem(item));
    setError(null);
    setItemModalOpen(true);
  };

  const updateCreateRow = (
    key: string,
    patch: Partial<ItemFormState>,
  ): void => {
    setCreateRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleSaveItem = async (): Promise<void> => {
    setIsSavingItem(true);
    setError(null);

    try {
      if (itemModalMode === "create") {
        const payloads = createRows
          .map((row) => rowToPayload(row))
          .filter(Boolean) as CreateStockItemPayload[];

        if (payloads.length === 0) {
          setError("Enter a name on at least one row.");
          setIsSavingItem(false);
          return;
        }

        for (const payload of payloads) {
          if (
            payload.costPerUnit != null &&
            Number.isNaN(payload.costPerUnit)
          ) {
            setError(`Invalid cost for "${payload.name}".`);
            setIsSavingItem(false);
            return;
          }
          if (
            payload.lowStockAt != null &&
            Number.isNaN(payload.lowStockAt)
          ) {
            setError(`Invalid low-stock threshold for "${payload.name}".`);
            setIsSavingItem(false);
            return;
          }
        }

        let nextItems = [...items];
        for (const payload of payloads) {
          const created = await createStockItem(token, payload, brandSlug);
          nextItems = [...nextItems, created];
        }
        onItemsChange(nextItems);
        const nextSummary = await fetchInventorySummary(token, brandSlug);
        onSummaryChange(nextSummary);
      } else if (editingItem) {
        const lowStockRaw = itemForm.lowStockAt.trim();
        const costRaw = itemForm.costPerUnit.trim();
        const payload: UpdateStockItemPayload = {
          name: itemForm.name.trim(),
          sku: itemForm.sku.trim() || null,
          category: itemForm.category.trim() || null,
          unit: itemForm.unit,
          lowStockAt: lowStockRaw === "" ? null : Number(lowStockRaw),
          costPerUnit: costRaw === "" ? null : Number(costRaw),
          notes: itemForm.notes.trim() || null,
          isActive: itemForm.isActive,
        };
        const updated = await updateStockItem(
          token,
          editingItem.id,
          payload,
          brandSlug,
        );
        onItemsChange(
          items.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        const nextSummary = await fetchInventorySummary(token, brandSlug);
        onSummaryChange(nextSummary);
      }
      setItemModalOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save item.",
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeactivate = async (item: StockItem): Promise<void> => {
    if (!window.confirm(`Deactivate "${item.name}"? It will stay in history.`)) {
      return;
    }
    setBusyId(item.id);
    try {
      const updated = await deactivateStockItem(token, item.id, brandSlug);
      onItemsChange(
        items.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "Unable to deactivate item.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            {title}
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>{description}</p>
          {summary ? (
            <p className={cn("mt-2 text-xs", secondaryText)}>
              {summary.activeItems} active · {summary.lowStockCount} low stock
            </p>
          ) : null}
        </div>
        {!lowStockOnly ? (
          <Button onClick={openCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, SKU, category…"
          value={search}
        />
        {!lowStockOnly ? (
          <label className={cn("flex items-center gap-2 text-sm", secondaryText)}>
            <input
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
              type="checkbox"
            />
            Show inactive
          </label>
        ) : null}
      </div>

      {error && !itemModalOpen ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-white/15",
              dashboardGlass,
            )}
          >
            <Package className={cn("h-8 w-8", secondaryText)} />
            <p className={cn("text-sm", secondaryText)}>
              {lowStockOnly
                ? "No low-stock items right now."
                : "No stock items yet. Add cheese, flour, toppings, packaging…"}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={item.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", primaryText)}>{item.name}</p>
                  {item.isLowStock ? (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      Low stock
                    </span>
                  ) : null}
                  {!item.isActive ? (
                    <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-0.5 text-xs", secondaryText)}>
                  {formatStockQty(item.qtyOnHand, item.unit)}
                  {item.category ? ` · ${item.category}` : ""}
                  {item.sku ? ` · SKU ${item.sku}` : ""}
                  {item.lowStockAt
                    ? ` · alert ≤ ${formatStockQty(item.lowStockAt, item.unit)}`
                    : ""}
                </p>
              </div>
              {!lowStockOnly ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => openEditItem(item)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {item.isActive ? (
                    <Button
                      disabled={busyId === item.id}
                      onClick={() => void handleDeactivate(item)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <Dialog.Root onOpenChange={setItemModalOpen} open={itemModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              itemModalMode === "create"
                ? "fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[min(96vw,64rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl p-6 shadow-2xl"
                : "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title
              className={cn(
                "shrink-0 font-display text-xl font-bold",
                primaryText,
              )}
            >
              {itemModalMode === "create"
                ? "Add stock items"
                : "Edit stock item"}
            </Dialog.Title>
            {itemModalMode === "create" ? (
              <p className={cn("mt-1 shrink-0 text-sm", secondaryText)}>
                Fill one row per item. Leave empty rows blank — only named rows
                are saved.
              </p>
            ) : null}

            {itemModalMode === "create" ? (
              <>
                <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
                        <tr
                          className={cn(
                            "text-xs uppercase tracking-wide",
                            secondaryText,
                          )}
                        >
                          <th className="px-3 py-3 font-semibold">Name</th>
                          <th className="px-3 py-3 font-semibold">Unit</th>
                          <th className="px-3 py-3 font-semibold">Category</th>
                          <th className="px-3 py-3 font-semibold">Opening</th>
                          <th className="px-3 py-3 font-semibold">Low at</th>
                          <th className="px-3 py-3 font-semibold">Cost</th>
                          <th className="px-3 py-3 font-semibold">SKU</th>
                          <th className="px-3 py-3 font-semibold">Notes</th>
                          <th className="px-3 py-3 font-semibold" />
                        </tr>
                      </thead>
                      <tbody>
                        {createRows.map((row) => (
                          <tr
                            className="border-b border-zinc-100 dark:border-white/5"
                            key={row.key}
                          >
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 min-w-[9rem]"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    name: event.target.value,
                                  })
                                }
                                placeholder="e.g. Mozzarella"
                                value={row.name}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                className={cn(
                                  inventorySelectClassName,
                                  "h-10 min-w-[6.5rem]",
                                )}
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    unit: event.target.value as StockUnit,
                                  })
                                }
                                value={row.unit}
                              >
                                {UNITS.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {STOCK_UNIT_LABELS[unit]}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 min-w-[7rem]"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    category: event.target.value,
                                  })
                                }
                                placeholder="Dairy…"
                                value={row.category}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 w-24"
                                inputMode="decimal"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    qtyOnHand: event.target.value,
                                  })
                                }
                                value={row.qtyOnHand}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 w-24"
                                inputMode="decimal"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    lowStockAt: event.target.value,
                                  })
                                }
                                placeholder="—"
                                value={row.lowStockAt}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 w-24"
                                inputMode="decimal"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    costPerUnit: event.target.value,
                                  })
                                }
                                placeholder="—"
                                value={row.costPerUnit}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 w-28"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    sku: event.target.value,
                                  })
                                }
                                placeholder="—"
                                value={row.sku}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                className="h-10 min-w-[8rem]"
                                onChange={(event) =>
                                  updateCreateRow(row.key, {
                                    notes: event.target.value,
                                  })
                                }
                                placeholder="—"
                                value={row.notes}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <Button
                                onClick={() =>
                                  setCreateRows((current) =>
                                    current.length <= 1
                                      ? [emptyCreateRow()]
                                      : current.filter(
                                          (entry) => entry.key !== row.key,
                                        ),
                                  )
                                }
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    onClick={() =>
                      setCreateRows((current) => [
                        ...current,
                        emptyCreateRow(),
                      ])
                    }
                    type="button"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add row
                  </Button>

                  {error ? (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
                  <p className={cn("text-sm", secondaryText)}>
                    {pendingCreateCount > 0
                      ? `${pendingCreateCount} item${pendingCreateCount === 1 ? "" : "s"} ready to save`
                      : "No named rows yet"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setItemModalOpen(false)}
                      type="button"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={isSavingItem || pendingCreateCount === 0}
                      onClick={() => void handleSaveItem()}
                      type="button"
                    >
                      {isSavingItem ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save
                      {pendingCreateCount > 0
                        ? ` (${pendingCreateCount})`
                        : ""}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 space-y-3">
                  <div>
                    <label
                      className={cn("mb-1 block text-sm font-medium", primaryText)}
                    >
                      Name
                    </label>
                    <Input
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      value={itemForm.name}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className={cn(
                          "mb-1 block text-sm font-medium",
                          primaryText,
                        )}
                      >
                        Unit
                      </label>
                      <select
                        className={inventorySelectClassName}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            unit: event.target.value as StockUnit,
                          }))
                        }
                        value={itemForm.unit}
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {STOCK_UNIT_LABELS[unit]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className={cn(
                          "mb-1 block text-sm font-medium",
                          primaryText,
                        )}
                      >
                        Category
                      </label>
                      <Input
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            category: event.target.value,
                          }))
                        }
                        placeholder="Dairy, Packaging…"
                        value={itemForm.category}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className={cn(
                          "mb-1 block text-sm font-medium",
                          primaryText,
                        )}
                      >
                        Low stock at
                      </label>
                      <Input
                        inputMode="decimal"
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            lowStockAt: event.target.value,
                          }))
                        }
                        placeholder="Optional"
                        value={itemForm.lowStockAt}
                      />
                    </div>
                    <div>
                      <label
                        className={cn(
                          "mb-1 block text-sm font-medium",
                          primaryText,
                        )}
                      >
                        Cost / unit (AUD)
                      </label>
                      <Input
                        inputMode="decimal"
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            costPerUnit: event.target.value,
                          }))
                        }
                        placeholder="Optional"
                        value={itemForm.costPerUnit}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={cn("mb-1 block text-sm font-medium", primaryText)}
                    >
                      SKU
                    </label>
                    <Input
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          sku: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                      value={itemForm.sku}
                    />
                  </div>
                  <div>
                    <label
                      className={cn("mb-1 block text-sm font-medium", primaryText)}
                    >
                      Notes
                    </label>
                    <Input
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      value={itemForm.notes}
                    />
                  </div>
                  <label
                    className={cn("flex items-center gap-2 text-sm", primaryText)}
                  >
                    <input
                      checked={itemForm.isActive}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                    Active
                  </label>
                  {error ? (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                      {error}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    onClick={() => setItemModalOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isSavingItem || !itemForm.name.trim()}
                    onClick={() => void handleSaveItem()}
                    type="button"
                  >
                    {isSavingItem ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
