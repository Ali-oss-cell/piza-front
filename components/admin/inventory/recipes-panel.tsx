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
  fetchInventoryRecipes,
  replaceInventoryRecipe,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { MenuItemRecipe, StockItem, StockUnit } from "@/types/inventory";
import { STOCK_UNIT_LABELS } from "@/types/inventory";

interface RecipesPanelProps {
  token: string;
  brandSlug: string;
  stockItems: StockItem[];
}

interface DraftLine {
  key: string;
  stockItemId: string;
  qtyPerUnit: string;
}

export function RecipesPanel({
  token,
  brandSlug,
  stockItems,
}: RecipesPanelProps): React.ReactElement {
  const [recipes, setRecipes] = useState<MenuItemRecipe[]>([]);
  const [menuItemId, setMenuItemId] = useState("");
  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
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
      const next = await fetchInventoryRecipes(token, brandSlug);
      setRecipes(next);
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

  const selected = recipes.find((entry) => entry.menuItemId === menuItemId);

  useEffect(() => {
    if (!selected) {
      setDraftLines([]);
      return;
    }
    setDraftLines(
      selected.lines.map((line) => ({
        key: line.id,
        stockItemId: line.stockItemId,
        qtyPerUnit: line.qtyPerUnit,
      })),
    );
    setSuccess(null);
  }, [selected]);

  const handleSave = async (): Promise<void> => {
    if (!menuItemId) {
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const lines = draftLines
        .filter((line) => line.stockItemId && Number(line.qtyPerUnit) > 0)
        .map((line) => ({
          stockItemId: line.stockItemId,
          qtyPerUnit: Number(line.qtyPerUnit),
        }));
      const updated = await replaceInventoryRecipe(
        token,
        menuItemId,
        { lines },
        brandSlug,
      );
      setRecipes((current) =>
        current.map((entry) =>
          entry.menuItemId === updated.menuItemId ? updated : entry,
        ),
      );
      setSuccess("Recipe saved. Sales will deduct these amounts when paid.");
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

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          Recipes
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Link each menu item to stock used per 1 sold. When an order is paid,
          stock is deducted automatically.
        </p>
      </div>

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
          {recipes.map((recipe) => (
            <option key={recipe.menuItemId} value={recipe.menuItemId}>
              #{recipe.menuItemNumber} {recipe.menuItemName}
              {recipe.lines.length > 0 ? ` · ${recipe.lines.length} lines` : ""}
            </option>
          ))}
        </select>
      </div>

      {selected ? (
        <div className="space-y-4 rounded-2xl border border-zinc-200/60 bg-white/50 p-5 dark:border-white/10 dark:bg-zinc-900/30">
          <p className={cn("text-sm font-medium", primaryText)}>
            Stock used per 1 × {selected.menuItemName}
          </p>

          {draftLines.length === 0 ? (
            <p className={cn("text-sm", secondaryText)}>
              No recipe lines yet. Add flour, cheese, oil, etc.
            </p>
          ) : null}

          {draftLines.map((line, index) => {
            const stock = activeStock.find(
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
                      setDraftLines((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, stockItemId: event.target.value }
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
                <div className="w-28">
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    Qty / unit
                    {stock ? ` (${STOCK_UNIT_LABELS[stock.unit]})` : ""}
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      setDraftLines((current) =>
                        current.map((entry, i) =>
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
                    setDraftLines((current) =>
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
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                setDraftLines((current) => [
                  ...current,
                  {
                    key: `new-${Date.now()}`,
                    stockItemId: "",
                    qtyPerUnit: "",
                  },
                ])
              }
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add stock line
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => void handleSave()}
              type="button"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save recipe
            </Button>
          </div>

          {selected.lines.length > 0 ? (
            <div className={cn("border-t border-zinc-200/60 pt-3 text-xs dark:border-white/10", secondaryText)}>
              Current saved:{" "}
              {selected.lines
                .map(
                  (line) =>
                    `${line.stockItemName} ${formatStockQty(line.qtyPerUnit, line.stockItemUnit as StockUnit)}`,
                )
                .join(" · ")}
            </div>
          ) : null}
        </div>
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
