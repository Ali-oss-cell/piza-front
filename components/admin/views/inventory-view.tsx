"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  History,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStockItem,
  createStockMovement,
  deactivateStockItem,
  fetchInventorySummary,
  fetchStockItems,
  fetchStockMovements,
  updateStockItem,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  CreateStockItemPayload,
  CreateStockMovementPayload,
  InventorySummary,
  StockItem,
  StockMovement,
  StockMovementType,
  StockUnit,
  UpdateStockItemPayload,
} from "@/types/inventory";
import {
  STOCK_MOVEMENT_LABELS,
  STOCK_UNIT_LABELS,
} from "@/types/inventory";

interface InventoryViewProps {
  token: string;
  brandSlug: string;
}

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

interface MovementFormState {
  type: StockMovementType;
  qty: string;
  countedQty: string;
  reason: string;
}

const UNITS = Object.keys(STOCK_UNIT_LABELS) as StockUnit[];

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

function emptyMovementForm(type: StockMovementType = "RECEIVE"): MovementFormState {
  return {
    type,
    qty: "",
    countedQty: "",
    reason: "",
  };
}

function formatQty(value: string, unit: StockUnit): string {
  const num = Number(value);
  const display = Number.isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : value;
  return `${display} ${STOCK_UNIT_LABELS[unit]}`;
}

export function InventoryView({
  token,
  brandSlug,
}: InventoryViewProps): React.ReactElement {
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);
  const [isSavingItem, setIsSavingItem] = useState(false);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);
  const [movementForm, setMovementForm] = useState<MovementFormState>(emptyMovementForm);
  const [isSavingMovement, setIsSavingMovement] = useState(false);

  const [historyItem, setHistoryItem] = useState<StockItem | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextItems, nextSummary] = await Promise.all([
        fetchStockItems(token, brandSlug, { includeInactive: true }),
        fetchInventorySummary(token, brandSlug),
      ]);
      setItems(nextItems);
      setSummary(nextSummary);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

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
  }, [items, search, lowStockOnly, showInactive]);

  const openCreateItem = (): void => {
    setItemModalMode("create");
    setEditingItem(null);
    setItemForm(emptyItemForm());
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

  const openMovement = (item: StockItem, type: StockMovementType = "RECEIVE"): void => {
    setMovementItem(item);
    setMovementForm(emptyMovementForm(type));
    setError(null);
    setMovementModalOpen(true);
  };

  const openHistory = async (item: StockItem): Promise<void> => {
    setHistoryItem(item);
    setIsLoadingHistory(true);
    setError(null);
    try {
      const next = await fetchStockMovements(token, item.id, brandSlug);
      setMovements(next);
    } catch (historyError) {
      setError(
        historyError instanceof Error
          ? historyError.message
          : "Unable to load history.",
      );
      setMovements([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSaveItem = async (): Promise<void> => {
    setIsSavingItem(true);
    setError(null);

    const lowStockRaw = itemForm.lowStockAt.trim();
    const costRaw = itemForm.costPerUnit.trim();

    try {
      if (itemModalMode === "create") {
        const payload: CreateStockItemPayload = {
          name: itemForm.name.trim(),
          sku: itemForm.sku.trim() || null,
          category: itemForm.category.trim() || null,
          unit: itemForm.unit,
          qtyOnHand: Number(itemForm.qtyOnHand) || 0,
          lowStockAt: lowStockRaw === "" ? null : Number(lowStockRaw),
          costPerUnit: costRaw === "" ? null : Number(costRaw),
          notes: itemForm.notes.trim() || null,
          isActive: itemForm.isActive,
        };
        const created = await createStockItem(token, payload, brandSlug);
        setItems((current) => [...current, created]);
        setSummary((current) =>
          current
            ? {
                ...current,
                totalItems: current.totalItems + 1,
                activeItems: created.isActive
                  ? current.activeItems + 1
                  : current.activeItems,
                lowStockCount: created.isLowStock
                  ? current.lowStockCount + 1
                  : current.lowStockCount,
              }
            : current,
        );
      } else if (editingItem) {
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
        setItems((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
        const nextSummary = await fetchInventorySummary(token, brandSlug);
        setSummary(nextSummary);
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

  const handleSaveMovement = async (): Promise<void> => {
    if (!movementItem) {
      return;
    }

    setIsSavingMovement(true);
    setError(null);

    const payload: CreateStockMovementPayload = {
      type: movementForm.type,
      reason: movementForm.reason.trim() || null,
    };

    if (movementForm.type === "COUNT") {
      payload.countedQty = Number(movementForm.countedQty);
    } else {
      payload.qty = Number(movementForm.qty);
    }

    try {
      const result = await createStockMovement(
        token,
        movementItem.id,
        payload,
        brandSlug,
      );
      setItems((current) =>
        current.map((entry) =>
          entry.id === result.item.id ? result.item : entry,
        ),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      setSummary(nextSummary);
      setMovementModalOpen(false);
      if (historyItem?.id === movementItem.id) {
        setMovements((current) => [result.movement, ...current]);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to record movement.",
      );
    } finally {
      setIsSavingMovement(false);
    }
  };

  const handleDeactivate = async (item: StockItem): Promise<void> => {
    if (!window.confirm(`Deactivate "${item.name}"? It will stay in history.`)) {
      return;
    }
    setBusyId(item.id);
    try {
      const updated = await deactivateStockItem(token, item.id, brandSlug);
      setItems((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      setSummary(nextSummary);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Inventory
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Stock for this store — receive, adjust, waste, and count.
          </p>
        </div>
        <Button onClick={openCreateItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
      </div>

      {summary ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-xl border border-zinc-200/60 px-4 py-3 dark:border-white/10", dashboardGlass)}>
            <p className={cn("text-xs font-medium uppercase tracking-wide", secondaryText)}>
              Active SKUs
            </p>
            <p className={cn("mt-1 text-2xl font-semibold", primaryText)}>
              {summary.activeItems}
            </p>
          </div>
          <div className={cn("rounded-xl border border-zinc-200/60 px-4 py-3 dark:border-white/10", dashboardGlass)}>
            <p className={cn("text-xs font-medium uppercase tracking-wide", secondaryText)}>
              Total items
            </p>
            <p className={cn("mt-1 text-2xl font-semibold", primaryText)}>
              {summary.totalItems}
            </p>
          </div>
          <button
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition",
              lowStockOnly
                ? "border-amber-400/60 bg-amber-500/10"
                : "border-zinc-200/60 dark:border-white/10",
              dashboardGlass,
            )}
            onClick={() => setLowStockOnly((current) => !current)}
            type="button"
          >
            <p className={cn("flex items-center gap-1 text-xs font-medium uppercase tracking-wide", secondaryText)}>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Low stock
            </p>
            <p className={cn("mt-1 text-2xl font-semibold", primaryText)}>
              {summary.lowStockCount}
            </p>
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, SKU, category…"
          value={search}
        />
        <label className={cn("flex items-center gap-2 text-sm", secondaryText)}>
          <input
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            type="checkbox"
          />
          Show inactive
        </label>
      </div>

      {error ? (
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
              No stock items yet. Add cheese, flour, toppings, packaging…
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
                  {formatQty(item.qtyOnHand, item.unit)}
                  {item.category ? ` · ${item.category}` : ""}
                  {item.sku ? ` · SKU ${item.sku}` : ""}
                  {item.lowStockAt
                    ? ` · alert ≤ ${formatQty(item.lowStockAt, item.unit)}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  className="h-8 px-3 text-xs"
                  onClick={() => openMovement(item, "RECEIVE")}
                  variant="outline"
                >
                  Receive
                </Button>
                <Button
                  className="h-8 px-3 text-xs"
                  onClick={() => openMovement(item, "WASTE")}
                  variant="outline"
                >
                  Waste
                </Button>
                <Button
                  className="h-8 px-3 text-xs"
                  onClick={() => openMovement(item, "COUNT")}
                  variant="outline"
                >
                  Count
                </Button>
                <Button
                  onClick={() => void openHistory(item)}
                  size="icon"
                  variant="ghost"
                >
                  <History className="h-4 w-4" />
                </Button>
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
            </div>
          ))
        )}
      </div>

      {/* Create / edit item */}
      <Dialog.Root onOpenChange={setItemModalOpen} open={itemModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {itemModalMode === "create" ? "Add stock item" : "Edit stock item"}
            </Dialog.Title>
            <div className="mt-5 space-y-3">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Unit
                  </label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
              {itemModalMode === "create" ? (
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Opening qty
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        qtyOnHand: event.target.value,
                      }))
                    }
                    value={itemForm.qtyOnHand}
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
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
              <label className={cn("flex items-center gap-2 text-sm", primaryText)}>
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
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setItemModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={isSavingItem || !itemForm.name.trim()}
                onClick={() => void handleSaveItem()}
              >
                {isSavingItem ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Movement */}
      <Dialog.Root onOpenChange={setMovementModalOpen} open={movementModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(96vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {movementItem
                ? `${STOCK_MOVEMENT_LABELS[movementForm.type]} — ${movementItem.name}`
                : "Stock movement"}
            </Dialog.Title>
            {movementItem ? (
              <p className={cn("mt-1 text-sm", secondaryText)}>
                On hand: {formatQty(movementItem.qtyOnHand, movementItem.unit)}
              </p>
            ) : null}
            <div className="mt-5 space-y-3">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Type
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      type: event.target.value as StockMovementType,
                    }))
                  }
                  value={movementForm.type}
                >
                  {(Object.keys(STOCK_MOVEMENT_LABELS) as StockMovementType[]).map(
                    (type) => (
                      <option key={type} value={type}>
                        {STOCK_MOVEMENT_LABELS[type]}
                      </option>
                    ),
                  )}
                </select>
              </div>
              {movementForm.type === "COUNT" ? (
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Counted qty
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      setMovementForm((current) => ({
                        ...current,
                        countedQty: event.target.value,
                      }))
                    }
                    value={movementForm.countedQty}
                  />
                </div>
              ) : (
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    {movementForm.type === "ADJUST"
                      ? "Delta (+/−)"
                      : "Quantity"}
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      setMovementForm((current) => ({
                        ...current,
                        qty: event.target.value,
                      }))
                    }
                    placeholder={
                      movementForm.type === "ADJUST" ? "e.g. -2 or 1.5" : ""
                    }
                    value={movementForm.qty}
                  />
                </div>
              )}
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Reason
                </label>
                <Input
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  value={movementForm.reason}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setMovementModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={isSavingMovement}
                onClick={() => void handleSaveMovement()}
              >
                {isSavingMovement ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Record
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* History */}
      <Dialog.Root
        onOpenChange={(open) => {
          if (!open) {
            setHistoryItem(null);
            setMovements([]);
          }
        }}
        open={Boolean(historyItem)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {historyItem ? `History — ${historyItem.name}` : "History"}
            </Dialog.Title>
            <div className="mt-4 space-y-2">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className={cn("h-6 w-6 animate-spin", secondaryText)} />
                </div>
              ) : movements.length === 0 ? (
                <p className={cn("text-sm", secondaryText)}>No movements yet.</p>
              ) : (
                movements.map((movement) => {
                  const delta = Number(movement.deltaQty);
                  const signed =
                    delta > 0
                      ? `+${movement.deltaQty}`
                      : movement.deltaQty;
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
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setHistoryItem(null)} variant="outline">
                Close
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
