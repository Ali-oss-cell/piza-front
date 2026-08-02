"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStockItem,
  deactivateStockItem,
  fetchCrustRecipes,
  fetchInventoryRecipes,
  fetchInventorySummary,
  fetchToppingRecipes,
  updateStockItem,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
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
const DEFAULT_CREATE_ROWS = 10;

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

interface CreateRow {
  key: string;
  name: string;
  sku: string;
  category: string;
  unit: StockUnit;
  notes: string;
}

interface ImportCandidate {
  key: string;
  source: "Menu item" | "Topping" | "Crust";
  name: string;
  sku: string;
  category: string;
  unit: StockUnit;
  selected: boolean;
}

function emptyCreateRow(): CreateRow {
  return {
    key: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    sku: "",
    category: "",
    unit: "EACH",
    notes: "",
  };
}

function makeCreateRows(count: number): CreateRow[] {
  return Array.from({ length: count }, () => emptyCreateRow());
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

function createRowToPayload(row: CreateRow): CreateStockItemPayload | null {
  if (!row.name.trim()) {
    return null;
  }
  return {
    name: row.name.trim(),
    sku: row.sku.trim() || null,
    category: row.category.trim() || null,
    unit: row.unit,
    qtyOnHand: 0,
    costPerUnit: null,
    notes: row.notes.trim() || null,
    isActive: true,
  };
}

function skuFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function alreadyInStock(items: StockItem[], name: string, sku: string): boolean {
  const nameKey = name.trim().toLowerCase();
  const skuKey = sku.trim().toLowerCase();
  return items.some((item) => {
    if (item.name.trim().toLowerCase() === nameKey) {
      return true;
    }
    if (skuKey && item.sku?.trim().toLowerCase() === skuKey) {
      return true;
    }
    return false;
  });
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
  description = "Add catalog items with name and SKU only — qty and cost can wait until Receive.",
}: StockListPanelProps): React.ReactElement {
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [createRows, setCreateRows] = useState<CreateRow[]>(() =>
    makeCreateRows(DEFAULT_CREATE_ROWS),
  );
  const [importCandidates, setImportCandidates] = useState<ImportCandidate[]>(
    [],
  );
  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ItemFormState>(emptyItemForm);
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingImport, setIsSavingImport] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const existingNameKeys = useMemo(
    () => new Set(items.map((item) => item.name.trim().toLowerCase())),
    [items],
  );
  const existingSkuKeys = useMemo(
    () =>
      new Set(
        items
          .map((item) => item.sku?.trim().toLowerCase())
          .filter(Boolean) as string[],
      ),
    [items],
  );

  const loadImportCandidates = useCallback(async (): Promise<void> => {
    if (lowStockOnly) {
      return;
    }
    setIsLoadingImport(true);
    setImportError(null);
    try {
      // Use inventory recipe endpoints (same API path as stock create) so
      // menu/topping manage routes cannot blank the import table with a fetch error.
      const [menuResult, toppingResult, crustResult] = await Promise.allSettled([
        fetchInventoryRecipes(token, brandSlug),
        fetchToppingRecipes(token, brandSlug),
        fetchCrustRecipes(token, brandSlug),
      ]);

      const next: ImportCandidate[] = [];
      const seenNames = new Set<string>();
      const failures: string[] = [];

      const pushCandidate = (
        candidate: Omit<ImportCandidate, "selected">,
      ): void => {
        const nameKey = candidate.name.trim().toLowerCase();
        if (!nameKey || seenNames.has(nameKey)) {
          return;
        }
        if (existingNameKeys.has(nameKey)) {
          return;
        }
        const skuKey = candidate.sku.trim().toLowerCase();
        if (skuKey && existingSkuKeys.has(skuKey)) {
          return;
        }
        seenNames.add(nameKey);
        next.push({ ...candidate, selected: false });
      };

      if (menuResult.status === "fulfilled") {
        for (const item of menuResult.value) {
          pushCandidate({
            key: `menu-${item.menuItemId}`,
            source: "Menu item",
            name: item.menuItemName,
            sku: `M-${item.menuItemNumber}`,
            category: item.categorySlug,
            unit: "EACH",
          });
        }
      } else {
        failures.push("menu items");
      }

      if (toppingResult.status === "fulfilled") {
        for (const topping of toppingResult.value) {
          pushCandidate({
            key: `top-${topping.toppingId}`,
            source: "Topping",
            name: topping.toppingLabel,
            sku: skuFromLabel(topping.toppingLabel),
            category: topping.categorySlug || "Topping",
            unit: "EACH",
          });
        }
      } else {
        failures.push("toppings");
      }

      if (crustResult.status === "fulfilled") {
        for (const crust of crustResult.value) {
          pushCandidate({
            key: `crust-${crust.crustOptionId}`,
            source: "Crust",
            name: crust.crustLabel,
            sku: skuFromLabel(crust.crustLabel) || `crust-${crust.crustOptionId.slice(0, 6)}`,
            category: "Crust",
            unit: "EACH",
          });
        }
      } else {
        failures.push("crusts");
      }

      next.sort((a, b) => {
        const bySource = a.source.localeCompare(b.source);
        if (bySource !== 0) {
          return bySource;
        }
        return a.name.localeCompare(b.name);
      });
      setImportCandidates(next);

      if (failures.length > 0 && next.length === 0) {
        setImportError(
          `Could not load ${failures.join(", ")} for import. Try Refresh list.`,
        );
      } else if (failures.length > 0) {
        setImportError(
          `Loaded partial list — could not load ${failures.join(", ")}.`,
        );
      }
    } catch (loadError) {
      setImportError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load store items for import.",
      );
    } finally {
      setIsLoadingImport(false);
    }
  }, [token, brandSlug, lowStockOnly, existingNameKeys, existingSkuKeys]);

  useEffect(() => {
    void loadImportCandidates();
  }, [loadImportCandidates]);

  // Drop candidates that are already in stock after a successful import/create.
  useEffect(() => {
    setImportCandidates((current) =>
      current.filter((row) => {
        const nameKey = row.name.trim().toLowerCase();
        const skuKey = row.sku.trim().toLowerCase();
        if (existingNameKeys.has(nameKey)) {
          return false;
        }
        if (skuKey && existingSkuKeys.has(skuKey)) {
          return false;
        }
        return true;
      }),
    );
  }, [existingNameKeys, existingSkuKeys]);

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

  const selectedImportCount = useMemo(
    () => importCandidates.filter((row) => row.selected).length,
    [importCandidates],
  );

  const updateCreateRow = (
    key: string,
    patch: Partial<CreateRow>,
  ): void => {
    setCreateRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const updateImportRow = (
    key: string,
    patch: Partial<ImportCandidate>,
  ): void => {
    setImportCandidates((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const startEdit = (item: StockItem): void => {
    setEditingId(item.id);
    setEditForm(formFromItem(item));
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditForm(emptyItemForm());
  };

  const createMany = async (
    payloads: CreateStockItemPayload[],
  ): Promise<number> => {
    let nextItems = [...items];
    for (const payload of payloads) {
      if (alreadyInStock(nextItems, payload.name, payload.sku ?? "")) {
        continue;
      }
      const created = await createStockItem(token, payload, brandSlug);
      nextItems = [...nextItems, created];
    }
    onItemsChange(nextItems);
    const nextSummary = await fetchInventorySummary(token, brandSlug);
    onSummaryChange(nextSummary);
    return nextItems.length - items.length;
  };

  const handleSaveCreate = async (): Promise<void> => {
    const payloads = createRows
      .map((row) => createRowToPayload(row))
      .filter(Boolean) as CreateStockItemPayload[];

    if (payloads.length === 0) {
      setError("Enter a name on at least one row.");
      return;
    }

    setIsSavingCreate(true);
    setError(null);
    setSuccess(null);

    try {
      const added = await createMany(payloads);
      setCreateRows(makeCreateRows(DEFAULT_CREATE_ROWS));
      setSuccess(
        `Added ${added} item${added === 1 ? "" : "s"} (qty 0 — receive later).`,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save items.",
      );
    } finally {
      setIsSavingCreate(false);
    }
  };

  const handleImportSelected = async (): Promise<void> => {
    const selected = importCandidates.filter((row) => row.selected);
    if (selected.length === 0) {
      setError("Select at least one store item to import.");
      return;
    }

    const payloads: CreateStockItemPayload[] = selected.map((row) => ({
      name: row.name.trim(),
      sku: row.sku.trim() || null,
      category: row.category.trim() || null,
      unit: row.unit,
      qtyOnHand: 0,
      costPerUnit: null,
      notes: `Imported from ${row.source.toLowerCase()}`,
      isActive: true,
    }));

    setIsSavingImport(true);
    setError(null);
    setSuccess(null);

    try {
      const added = await createMany(payloads);
      setSuccess(
        `Imported ${added} item${added === 1 ? "" : "s"} from the store menu (qty 0, no cost).`,
      );
      // Remaining rows update via the existingNameKeys effect — no fragile reload.
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to import items.",
      );
    } finally {
      setIsSavingImport(false);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingId) {
      return;
    }
    if (!editForm.name.trim()) {
      setError("Name is required.");
      return;
    }

    const lowStockRaw = editForm.lowStockAt.trim();
    const costRaw = editForm.costPerUnit.trim();
    const payload: UpdateStockItemPayload = {
      name: editForm.name.trim(),
      sku: editForm.sku.trim() || null,
      category: editForm.category.trim() || null,
      unit: editForm.unit,
      lowStockAt: lowStockRaw === "" ? null : Number(lowStockRaw),
      costPerUnit: costRaw === "" ? null : Number(costRaw),
      notes: editForm.notes.trim() || null,
      isActive: editForm.isActive,
    };

    setIsSavingEdit(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateStockItem(
        token,
        editingId,
        payload,
        brandSlug,
      );
      onItemsChange(
        items.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
      cancelEdit();
      setSuccess(`Updated "${updated.name}".`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update item.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeactivate = async (item: StockItem): Promise<void> => {
    if (!window.confirm(`Deactivate "${item.name}"? It will stay in history.`)) {
      return;
    }
    setBusyId(item.id);
    setError(null);
    try {
      const updated = await deactivateStockItem(token, item.id, brandSlug);
      onItemsChange(
        items.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      const nextSummary = await fetchInventorySummary(token, brandSlug);
      onSummaryChange(nextSummary);
      if (editingId === item.id) {
        cancelEdit();
      }
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            {title}
          </h2>
          <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
            {description}
          </p>
          {summary ? (
            <p className={cn("mt-2 text-xs", secondaryText)}>
              {summary.activeItems} active · {summary.lowStockCount} low stock
            </p>
          ) : null}
        </div>
      </div>

      {!lowStockOnly ? (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className={cn("text-sm font-semibold", primaryText)}>
                  Import from store menu
                </h3>
                <p className={cn("text-xs", secondaryText)}>
                  Tick as many rows as you need (menu items, toppings, crusts),
                  edit SKU if you want, then import. Scroll the table — all
                  unmatched store items are listed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isLoadingImport || isSavingImport}
                  onClick={() => void loadImportCandidates()}
                  type="button"
                  variant="outline"
                >
                  {isLoadingImport ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Refresh list
                </Button>
                <Button
                  disabled={importCandidates.length === 0}
                  onClick={() =>
                    setImportCandidates((current) =>
                      current.map((row) => ({ ...row, selected: true })),
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  Select all
                </Button>
                <Button
                  disabled={
                    isSavingImport ||
                    isLoadingImport ||
                    selectedImportCount === 0
                  }
                  onClick={() => void handleImportSelected()}
                  type="button"
                >
                  {isSavingImport ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Import selected
                  {selectedImportCount > 0 ? ` (${selectedImportCount})` : ""}
                </Button>
              </div>
            </div>

            {importError ? (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                {importError}
              </p>
            ) : null}

            <div className="max-h-[28rem] overflow-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
                  <tr
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      secondaryText,
                    )}
                  >
                    <th className="px-3 py-3 font-semibold">
                      <input
                        checked={
                          importCandidates.length > 0 &&
                          importCandidates.every((row) => row.selected)
                        }
                        disabled={importCandidates.length === 0}
                        onChange={(event) => {
                          const selected = event.target.checked;
                          setImportCandidates((current) =>
                            current.map((row) => ({ ...row, selected })),
                          );
                        }}
                        type="checkbox"
                      />
                    </th>
                    <th className="px-3 py-3 font-semibold">Source</th>
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">SKU</th>
                    <th className="px-3 py-3 font-semibold">Category</th>
                    <th className="px-3 py-3 font-semibold">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingImport ? (
                    <tr>
                      <td className="px-4 py-10 text-center" colSpan={6}>
                        <Loader2
                          className={cn(
                            "mx-auto h-6 w-6 animate-spin",
                            secondaryText,
                          )}
                        />
                      </td>
                    </tr>
                  ) : importCandidates.length === 0 ? (
                    <tr>
                      <td
                        className={cn("px-4 py-10 text-center", secondaryText)}
                        colSpan={6}
                      >
                        Nothing left to import — everything from the menu is
                        already in stock, or the menu is empty.
                      </td>
                    </tr>
                  ) : (
                    importCandidates.map((row) => (
                      <tr
                        className="border-b border-zinc-100 dark:border-white/5"
                        key={row.key}
                      >
                        <td className="px-3 py-2">
                          <input
                            checked={row.selected}
                            onChange={(event) =>
                              updateImportRow(row.key, {
                                selected: event.target.checked,
                              })
                            }
                            type="checkbox"
                          />
                        </td>
                        <td className={cn("px-3 py-2", secondaryText)}>
                          {row.source}
                        </td>
                        <td className={cn("px-3 py-2 font-medium", primaryText)}>
                          {row.name}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-10 w-36"
                            onChange={(event) =>
                              updateImportRow(row.key, {
                                sku: event.target.value,
                              })
                            }
                            value={row.sku}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            className="h-10 min-w-[8rem]"
                            onChange={(event) =>
                              updateImportRow(row.key, {
                                category: event.target.value,
                              })
                            }
                            value={row.category}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className={cn(
                              inventorySelectClassName,
                              "h-10 min-w-[6.5rem]",
                            )}
                            onChange={(event) =>
                              updateImportRow(row.key, {
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className={cn("text-sm font-semibold", primaryText)}>
                  Add items manually
                </h3>
                <p className={cn("text-xs", secondaryText)}>
                  Name + SKU (+ unit/category). Starts at qty 0 with no cost —
                  use Receive later for stock and price.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    setCreateRows((current) => [
                      ...current,
                      ...makeCreateRows(5),
                    ])
                  }
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add 5 rows
                </Button>
                <Button
                  disabled={isSavingCreate || pendingCreateCount === 0}
                  onClick={() => void handleSaveCreate()}
                  type="button"
                >
                  {isSavingCreate ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save items
                  {pendingCreateCount > 0 ? ` (${pendingCreateCount})` : ""}
                </Button>
              </div>
            </div>

            <div className="max-h-[22rem] overflow-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
                  <tr
                    className={cn(
                      "text-xs uppercase tracking-wide",
                      secondaryText,
                    )}
                  >
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">SKU</th>
                    <th className="px-3 py-3 font-semibold">Unit</th>
                    <th className="px-3 py-3 font-semibold">Category</th>
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
                        <Input
                          className="h-10 w-32"
                          onChange={(event) =>
                            updateCreateRow(row.key, {
                              sku: event.target.value,
                            })
                          }
                          placeholder="Optional"
                          value={row.sku}
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
          </section>
        </>
      ) : null}

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

      <section className="space-y-3">
        <h3 className={cn("text-sm font-semibold", primaryText)}>
          {lowStockOnly ? "Low stock items" : "Current stock"}
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
              <tr
                className={cn("text-xs uppercase tracking-wide", secondaryText)}
              >
                <th className="px-4 py-3 font-semibold">Stock item</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">On hand</th>
                <th className="px-4 py-3 font-semibold">Low at</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                {!lowStockOnly ? (
                  <th className="px-4 py-3 font-semibold">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    className={cn("px-4 py-10 text-center", secondaryText)}
                    colSpan={lowStockOnly ? 6 : 7}
                  >
                    {lowStockOnly
                      ? "No low-stock items right now."
                      : "No stock items yet — use the Add items table above."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      className="border-b border-zinc-100 dark:border-white/5"
                      key={item.id}
                    >
                      {isEditing ? (
                        <>
                          <td className="px-4 py-3" colSpan={6}>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Name
                                </label>
                                <Input
                                  value={editForm.name}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      name: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Unit
                                </label>
                                <select
                                  className={inventorySelectClassName}
                                  value={editForm.unit}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      unit: event.target.value as StockUnit,
                                    }))
                                  }
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
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Category
                                </label>
                                <Input
                                  value={editForm.category}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      category: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Low stock at
                                </label>
                                <Input
                                  inputMode="decimal"
                                  value={editForm.lowStockAt}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      lowStockAt: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Cost / unit
                                </label>
                                <Input
                                  inputMode="decimal"
                                  value={editForm.costPerUnit}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      costPerUnit: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  SKU
                                </label>
                                <Input
                                  value={editForm.sku}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      sku: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2 lg:col-span-3">
                                <label
                                  className={cn(
                                    "mb-1 block text-xs font-medium",
                                    secondaryText,
                                  )}
                                >
                                  Notes
                                </label>
                                <Input
                                  value={editForm.notes}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      notes: event.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <label
                                className={cn(
                                  "flex items-center gap-2 text-sm",
                                  primaryText,
                                )}
                              >
                                <input
                                  checked={editForm.isActive}
                                  type="checkbox"
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      isActive: event.target.checked,
                                    }))
                                  }
                                />
                                Active
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <Button
                                disabled={isSavingEdit}
                                onClick={() => void handleSaveEdit()}
                                type="button"
                              >
                                {isSavingEdit ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save
                              </Button>
                              <Button
                                onClick={cancelEdit}
                                type="button"
                                variant="outline"
                              >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className={cn("px-4 py-3 font-medium", primaryText)}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{item.name}</span>
                              {item.isLowStock ? (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                  Low
                                </span>
                              ) : null}
                              {!item.isActive ? (
                                <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                                  Inactive
                                </span>
                              ) : null}
                            </div>
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
                          <td
                            className={cn(
                              "px-4 py-3 tabular-nums",
                              primaryText,
                            )}
                          >
                            {formatStockQty(item.qtyOnHand, item.unit)}
                          </td>
                          <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                            {item.lowStockAt
                              ? formatStockQty(item.lowStockAt, item.unit)
                              : "—"}
                          </td>
                          <td className={cn("px-4 py-3 tabular-nums", secondaryText)}>
                            {item.costPerUnit != null
                              ? `$${Number(item.costPerUnit).toFixed(2)}`
                              : "—"}
                          </td>
                          <td className={cn("px-4 py-3", secondaryText)}>
                            {item.sku ?? "—"}
                          </td>
                          {!lowStockOnly ? (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  onClick={() => startEdit(item)}
                                  size="icon"
                                  type="button"
                                  variant="ghost"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                {item.isActive ? (
                                  <Button
                                    disabled={busyId === item.id}
                                    onClick={() => void handleDeactivate(item)}
                                    size="icon"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                ) : null}
                              </div>
                            </td>
                          ) : null}
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
