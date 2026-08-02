"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatStockQty,
  inventorySelectClassName,
} from "@/components/admin/inventory/inventory-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchCrustRecipes,
  fetchInventoryRecipes,
  fetchToppingRecipes,
  replaceCrustRecipe,
  replaceInventoryRecipe,
  replaceToppingRecipe,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  CrustRecipe,
  MenuItemRecipe,
  RecipeLine,
  RecipeSizeKey,
  StockItem,
  StockUnit,
  ToppingRecipe,
} from "@/types/inventory";
import { RECIPE_SIZE_KEYS, STOCK_UNIT_LABELS } from "@/types/inventory";

interface RecipesPanelProps {
  token: string;
  brandSlug: string;
  stockItems: StockItem[];
}

type RecipeSubTab = "menu" | "toppings" | "crusts";

interface MenuDraftLine {
  key: string;
  stockItemId: string;
  qtyDefault: string;
  qtySmall: string;
  qtyLarge: string;
  qtyFamily: string;
}

interface SimpleDraftLine {
  key: string;
  stockItemId: string;
  qtyPerUnit: string;
}

const SUB_TABS: Array<{ id: RecipeSubTab; label: string }> = [
  { id: "menu", label: "Menu items" },
  { id: "toppings", label: "Toppings" },
  { id: "crusts", label: "Crusts" },
];

function emptyMenuDraft(): MenuDraftLine {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stockItemId: "",
    qtyDefault: "",
    qtySmall: "",
    qtyLarge: "",
    qtyFamily: "",
  };
}

function emptySimpleDraft(): SimpleDraftLine {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stockItemId: "",
    qtyPerUnit: "",
  };
}

function menuDraftsFromLines(lines: RecipeLine[]): MenuDraftLine[] {
  const byStock = new Map<string, MenuDraftLine>();
  for (const line of lines) {
    let draft = byStock.get(line.stockItemId);
    if (!draft) {
      draft = {
        key: line.id,
        stockItemId: line.stockItemId,
        qtyDefault: "",
        qtySmall: "",
        qtyLarge: "",
        qtyFamily: "",
      };
      byStock.set(line.stockItemId, draft);
    }
    const size = (line.sizeKey ?? "").toLowerCase() as RecipeSizeKey;
    if (size === "small") {
      draft.qtySmall = line.qtyPerUnit;
    } else if (size === "large") {
      draft.qtyLarge = line.qtyPerUnit;
    } else if (size === "family") {
      draft.qtyFamily = line.qtyPerUnit;
    } else {
      draft.qtyDefault = line.qtyPerUnit;
    }
  }
  return Array.from(byStock.values());
}

function expandMenuDrafts(
  drafts: MenuDraftLine[],
): Array<{ stockItemId: string; qtyPerUnit: number; sizeKey: string }> {
  const lines: Array<{
    stockItemId: string;
    qtyPerUnit: number;
    sizeKey: string;
  }> = [];
  for (const draft of drafts) {
    if (!draft.stockItemId) {
      continue;
    }
    const pairs: Array<[string, string]> = [
      ["", draft.qtyDefault],
      ["small", draft.qtySmall],
      ["large", draft.qtyLarge],
      ["family", draft.qtyFamily],
    ];
    for (const [sizeKey, raw] of pairs) {
      const qty = Number(raw);
      if (Number.isFinite(qty) && qty > 0) {
        lines.push({ stockItemId: draft.stockItemId, qtyPerUnit: qty, sizeKey });
      }
    }
  }
  return lines;
}

function formatSavedLines(lines: RecipeLine[]): string {
  if (lines.length === 0) {
    return "";
  }
  return lines
    .map((line) => {
      const sizeLabel =
        RECIPE_SIZE_KEYS.find((entry) => entry.key === line.sizeKey)?.label ??
        (line.sizeKey || "Default");
      const qty = formatStockQty(
        line.qtyPerUnit,
        line.stockItemUnit as StockUnit,
      );
      return line.sizeKey
        ? `${line.stockItemName} ${qty} (${sizeLabel})`
        : `${line.stockItemName} ${qty}`;
    })
    .join(" · ");
}

export function RecipesPanel({
  token,
  brandSlug,
  stockItems,
}: RecipesPanelProps): React.ReactElement {
  const [subTab, setSubTab] = useState<RecipeSubTab>("menu");
  const [menuRecipes, setMenuRecipes] = useState<MenuItemRecipe[]>([]);
  const [toppingRecipes, setToppingRecipes] = useState<ToppingRecipe[]>([]);
  const [crustRecipes, setCrustRecipes] = useState<CrustRecipe[]>([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [toppingId, setToppingId] = useState("");
  const [crustOptionId, setCrustOptionId] = useState("");
  const [menuDrafts, setMenuDrafts] = useState<MenuDraftLine[]>([]);
  const [toppingDrafts, setToppingDrafts] = useState<SimpleDraftLine[]>([]);
  const [crustDrafts, setCrustDrafts] = useState<SimpleDraftLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeStock = useMemo(
    () =>
      stockItems
        .filter((item) => item.isActive)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [stockItems],
  );

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [menus, toppings, crusts] = await Promise.all([
        fetchInventoryRecipes(token, brandSlug),
        fetchToppingRecipes(token, brandSlug),
        fetchCrustRecipes(token, brandSlug),
      ]);
      setMenuRecipes(menus);
      setToppingRecipes(toppings);
      setCrustRecipes(crusts);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load recipes.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedMenu = menuRecipes.find(
    (entry) => entry.menuItemId === menuItemId,
  );
  const selectedTopping = toppingRecipes.find(
    (entry) => entry.toppingId === toppingId,
  );
  const selectedCrust = crustRecipes.find(
    (entry) => entry.crustOptionId === crustOptionId,
  );

  useEffect(() => {
    if (!selectedMenu) {
      setMenuDrafts([]);
      return;
    }
    setMenuDrafts(menuDraftsFromLines(selectedMenu.lines));
    setSuccess(null);
  }, [selectedMenu]);

  useEffect(() => {
    if (!selectedTopping) {
      setToppingDrafts([]);
      return;
    }
    setToppingDrafts(
      selectedTopping.lines.map((line) => ({
        key: line.id,
        stockItemId: line.stockItemId,
        qtyPerUnit: line.qtyPerUnit,
      })),
    );
    setSuccess(null);
  }, [selectedTopping]);

  useEffect(() => {
    if (!selectedCrust) {
      setCrustDrafts([]);
      return;
    }
    setCrustDrafts(
      selectedCrust.lines.map((line) => ({
        key: line.id,
        stockItemId: line.stockItemId,
        qtyPerUnit: line.qtyPerUnit,
      })),
    );
    setSuccess(null);
  }, [selectedCrust]);

  const handleSaveMenu = async (): Promise<void> => {
    if (!menuItemId) {
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await replaceInventoryRecipe(
        token,
        menuItemId,
        { lines: expandMenuDrafts(menuDrafts) },
        brandSlug,
      );
      setMenuRecipes((current) =>
        current.map((entry) =>
          entry.menuItemId === updated.menuItemId ? updated : entry,
        ),
      );
      setSuccess("Menu recipe saved. Sales deduct by size when paid.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save recipe.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTopping = async (): Promise<void> => {
    if (!toppingId) {
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const lines = toppingDrafts
        .filter((line) => line.stockItemId && Number(line.qtyPerUnit) > 0)
        .map((line) => ({
          stockItemId: line.stockItemId,
          qtyPerUnit: Number(line.qtyPerUnit),
        }));
      const updated = await replaceToppingRecipe(
        token,
        toppingId,
        { lines },
        brandSlug,
      );
      setToppingRecipes((current) =>
        current.map((entry) =>
          entry.toppingId === updated.toppingId ? updated : entry,
        ),
      );
      setSuccess("Topping recipe saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save topping recipe.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCrust = async (): Promise<void> => {
    if (!crustOptionId) {
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const lines = crustDrafts
        .filter((line) => line.stockItemId && Number(line.qtyPerUnit) > 0)
        .map((line) => ({
          stockItemId: line.stockItemId,
          qtyPerUnit: Number(line.qtyPerUnit),
        }));
      const updated = await replaceCrustRecipe(
        token,
        crustOptionId,
        { lines },
        brandSlug,
      );
      setCrustRecipes((current) =>
        current.map((entry) =>
          entry.crustOptionId === updated.crustOptionId ? updated : entry,
        ),
      );
      setSuccess("Crust recipe saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save crust recipe.",
      );
    } finally {
      setIsSaving(false);
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          Recipes
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Link menu items, toppings, and crusts to stock used per sale. When an
          order is paid, stock is deducted automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => (
          <button
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              subTab === tab.id
                ? "bg-[#d81b60]/12 text-[#d81b60]"
                : cn("hover:bg-zinc-100 dark:hover:bg-white/5", secondaryText),
            )}
            key={tab.id}
            onClick={() => {
              setSubTab(tab.id);
              setError(null);
              setSuccess(null);
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "menu" ? (
        <div className="space-y-4">
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
              Menu item
            </label>
            <select
              className={inventorySelectClassName}
              onChange={(event) => setMenuItemId(event.target.value)}
              value={menuItemId}
            >
              <option value="">Select menu item…</option>
              {menuRecipes.map((recipe) => (
                <option key={recipe.menuItemId} value={recipe.menuItemId}>
                  #{recipe.menuItemNumber} {recipe.menuItemName}
                  {recipe.lines.length > 0
                    ? ` · ${recipe.lines.length} lines`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedMenu ? (
            <div className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 dark:border-white/10 dark:bg-zinc-900/30">
              <p className={cn("text-sm font-medium", primaryText)}>
                Stock used per 1 × {selectedMenu.menuItemName}
              </p>
              <p className={cn("text-xs", secondaryText)}>
                Leave size blank to skip. Default applies when no size-specific
                amount is set.
              </p>

              {menuDrafts.length === 0 ? (
                <p className={cn("text-sm", secondaryText)}>
                  No recipe lines yet. Add flour, cheese, oil, etc.
                </p>
              ) : null}

              {menuDrafts.map((line, index) => {
                const stock = activeStock.find(
                  (item) => item.id === line.stockItemId,
                );
                return (
                  <div
                    className="space-y-2 rounded-xl border border-zinc-200/50 p-3 dark:border-white/10"
                    key={line.key}
                  >
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="min-w-[12rem] flex-1">
                        <label
                          className={cn("mb-1 block text-xs", secondaryText)}
                        >
                          Stock item
                        </label>
                        <select
                          className={inventorySelectClassName}
                          onChange={(event) =>
                            setMenuDrafts((current) =>
                              current.map((entry, i) =>
                                i === index
                                  ? {
                                      ...entry,
                                      stockItemId: event.target.value,
                                    }
                                  : entry,
                              ),
                            )
                          }
                          value={line.stockItemId}
                        >
                          <option value="">Select…</option>
                          {activeStock.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({STOCK_UNIT_LABELS[item.unit]})
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        onClick={() =>
                          setMenuDrafts((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {(
                        [
                          ["qtyDefault", "Default"],
                          ["qtySmall", "Small"],
                          ["qtyLarge", "Large"],
                          ["qtyFamily", "Family"],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field}>
                          <label
                            className={cn("mb-1 block text-xs", secondaryText)}
                          >
                            {label}
                            {stock
                              ? ` (${STOCK_UNIT_LABELS[stock.unit]})`
                              : ""}
                          </label>
                          <Input
                            inputMode="decimal"
                            onChange={(event) =>
                              setMenuDrafts((current) =>
                                current.map((entry, i) =>
                                  i === index
                                    ? { ...entry, [field]: event.target.value }
                                    : entry,
                                ),
                              )
                            }
                            value={line[field]}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    setMenuDrafts((current) => [...current, emptyMenuDraft()])
                  }
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add stock line
                </Button>
                <Button
                  disabled={isSaving}
                  onClick={() => void handleSaveMenu()}
                  type="button"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save recipe
                </Button>
              </div>

              {selectedMenu.lines.length > 0 ? (
                <div
                  className={cn(
                    "border-t border-zinc-200/60 pt-3 text-xs dark:border-white/10",
                    secondaryText,
                  )}
                >
                  Current saved: {formatSavedLines(selectedMenu.lines)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {subTab === "toppings" ? (
        <SimpleRecipeEditor
          drafts={toppingDrafts}
          emptyMessage="No topping recipe lines yet."
          isSaving={isSaving}
          label="Topping"
          onAdd={() =>
            setToppingDrafts((current) => [...current, emptySimpleDraft()])
          }
          onChangeDrafts={setToppingDrafts}
          onSave={() => void handleSaveTopping()}
          onSelectId={setToppingId}
          options={toppingRecipes.map((recipe) => ({
            id: recipe.toppingId,
            label: `${recipe.toppingLabel}${
              recipe.lines.length > 0 ? ` · ${recipe.lines.length} lines` : ""
            }`,
          }))}
          savedLines={selectedTopping?.lines ?? []}
          selectedId={toppingId}
          selectedLabel={selectedTopping?.toppingLabel}
          stockItems={activeStock}
        />
      ) : null}

      {subTab === "crusts" ? (
        <SimpleRecipeEditor
          drafts={crustDrafts}
          emptyMessage="No crust recipe lines yet."
          isSaving={isSaving}
          label="Crust"
          onAdd={() =>
            setCrustDrafts((current) => [...current, emptySimpleDraft()])
          }
          onChangeDrafts={setCrustDrafts}
          onSave={() => void handleSaveCrust()}
          onSelectId={setCrustOptionId}
          options={crustRecipes.map((recipe) => ({
            id: recipe.crustOptionId,
            label: `${recipe.crustLabel}${
              recipe.lines.length > 0 ? ` · ${recipe.lines.length} lines` : ""
            }`,
          }))}
          savedLines={selectedCrust?.lines ?? []}
          selectedId={crustOptionId}
          selectedLabel={selectedCrust?.crustLabel}
          stockItems={activeStock}
        />
      ) : null}

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
    </div>
  );
}

interface SimpleRecipeEditorProps {
  label: string;
  options: Array<{ id: string; label: string }>;
  selectedId: string;
  selectedLabel?: string;
  onSelectId: (id: string) => void;
  drafts: SimpleDraftLine[];
  onChangeDrafts: (drafts: SimpleDraftLine[]) => void;
  stockItems: StockItem[];
  savedLines: RecipeLine[];
  emptyMessage: string;
  isSaving: boolean;
  onAdd: () => void;
  onSave: () => void;
}

function SimpleRecipeEditor({
  label,
  options,
  selectedId,
  selectedLabel,
  onSelectId,
  drafts,
  onChangeDrafts,
  stockItems,
  savedLines,
  emptyMessage,
  isSaving,
  onAdd,
  onSave,
}: SimpleRecipeEditorProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
          {label}
        </label>
        <select
          className={inventorySelectClassName}
          onChange={(event) => onSelectId(event.target.value)}
          value={selectedId}
        >
          <option value="">Select {label.toLowerCase()}…</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {selectedId && selectedLabel ? (
        <div className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 dark:border-white/10 dark:bg-zinc-900/30">
          <p className={cn("text-sm font-medium", primaryText)}>
            Stock used per 1 × {selectedLabel}
          </p>

          {drafts.length === 0 ? (
            <p className={cn("text-sm", secondaryText)}>{emptyMessage}</p>
          ) : null}

          {drafts.map((line, index) => {
            const stock = stockItems.find(
              (item) => item.id === line.stockItemId,
            );
            return (
              <div className="flex flex-wrap items-end gap-2" key={line.key}>
                <div className="min-w-[12rem] flex-1">
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    Stock item
                  </label>
                  <select
                    className={inventorySelectClassName}
                    onChange={(event) =>
                      onChangeDrafts(
                        drafts.map((entry, i) =>
                          i === index
                            ? { ...entry, stockItemId: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    value={line.stockItemId}
                  >
                    <option value="">Select…</option>
                    {stockItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({STOCK_UNIT_LABELS[item.unit]})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    Qty / unit
                    {stock ? ` (${STOCK_UNIT_LABELS[stock.unit]})` : ""}
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      onChangeDrafts(
                        drafts.map((entry, i) =>
                          i === index
                            ? { ...entry, qtyPerUnit: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    value={line.qtyPerUnit}
                  />
                </div>
                <Button
                  onClick={() =>
                    onChangeDrafts(drafts.filter((_, i) => i !== index))
                  }
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button onClick={onAdd} type="button" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add stock line
            </Button>
            <Button disabled={isSaving} onClick={onSave} type="button">
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save recipe
            </Button>
          </div>

          {savedLines.length > 0 ? (
            <div
              className={cn(
                "border-t border-zinc-200/60 pt-3 text-xs dark:border-white/10",
                secondaryText,
              )}
            >
              Current saved: {formatSavedLines(savedLines)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
