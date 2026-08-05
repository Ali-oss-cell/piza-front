"use client";

import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  compatibleDisplayUnits,
  convertStockQty,
  formatQtyInput,
  formatStockQty,
  fromStockUnitQty,
  inventorySelectClassName,
  isLikelyOversizedRecipeQty,
  toStockUnitQty,
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
import { STOCK_UNIT_LABELS } from "@/types/inventory";

interface RecipesPanelProps {
  token: string;
  brandSlug: string;
  stockItems: StockItem[];
}

type RecipeSubTab = "menu" | "toppings" | "crusts";
type CoverageFilter = "all" | "has" | "missing";

interface MenuDraftLine {
  key: string;
  stockItemId: string;
  displayUnit: StockUnit;
  qtyDefault: string;
  qtySmall: string;
  qtyLarge: string;
  qtyFamily: string;
}

interface SimpleDraftLine {
  key: string;
  stockItemId: string;
  displayUnit: StockUnit;
  qtyPerUnit: string;
}

const SUB_TABS: Array<{ id: RecipeSubTab; label: string }> = [
  { id: "menu", label: "Menu items" },
  { id: "toppings", label: "Toppings" },
  { id: "crusts", label: "Crusts" },
];

const COVERAGE_FILTERS: Array<{ id: CoverageFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "has", label: "Has recipe" },
  { id: "missing", label: "Missing recipe" },
];

function emptyMenuDraft(unit: StockUnit = "EACH"): MenuDraftLine {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stockItemId: "",
    displayUnit: unit,
    qtyDefault: "",
    qtySmall: "",
    qtyLarge: "",
    qtyFamily: "",
  };
}

function emptySimpleDraft(unit: StockUnit = "EACH"): SimpleDraftLine {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stockItemId: "",
    displayUnit: unit,
    qtyPerUnit: "",
  };
}

function resolveStockUnit(
  stockItemId: string,
  stockItems: StockItem[],
  fallback: StockUnit = "EACH",
): StockUnit {
  return stockItems.find((item) => item.id === stockItemId)?.unit ?? fallback;
}

function menuDraftsFromLines(
  lines: RecipeLine[],
  stockItems: StockItem[],
): MenuDraftLine[] {
  const byStock = new Map<string, MenuDraftLine>();
  for (const line of lines) {
    const stockUnit = resolveStockUnit(
      line.stockItemId,
      stockItems,
      (line.stockItemUnit as StockUnit) || "EACH",
    );
    let draft = byStock.get(line.stockItemId);
    if (!draft) {
      draft = {
        key: line.id,
        stockItemId: line.stockItemId,
        displayUnit: stockUnit,
        qtyDefault: "",
        qtySmall: "",
        qtyLarge: "",
        qtyFamily: "",
      };
      byStock.set(line.stockItemId, draft);
    }
    const displayQty = fromStockUnitQty(
      line.qtyPerUnit,
      stockUnit,
      draft.displayUnit,
    );
    const size = (line.sizeKey ?? "").toLowerCase() as RecipeSizeKey;
    if (size === "small") {
      draft.qtySmall = displayQty;
    } else if (size === "large") {
      draft.qtyLarge = displayQty;
    } else if (size === "family") {
      draft.qtyFamily = displayQty;
    } else {
      draft.qtyDefault = displayQty;
    }
  }
  return Array.from(byStock.values());
}

function simpleDraftsFromLines(
  lines: RecipeLine[],
  stockItems: StockItem[],
): SimpleDraftLine[] {
  return lines.map((line) => {
    const stockUnit = resolveStockUnit(
      line.stockItemId,
      stockItems,
      (line.stockItemUnit as StockUnit) || "EACH",
    );
    return {
      key: line.id,
      stockItemId: line.stockItemId,
      displayUnit: stockUnit,
      qtyPerUnit: fromStockUnitQty(line.qtyPerUnit, stockUnit, stockUnit),
    };
  });
}

function expandMenuDrafts(
  drafts: MenuDraftLine[],
  stockItems: StockItem[],
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
    const stockUnit = resolveStockUnit(draft.stockItemId, stockItems);
    const pairs: Array<[string, string]> = [
      ["", draft.qtyDefault],
      ["small", draft.qtySmall],
      ["large", draft.qtyLarge],
      ["family", draft.qtyFamily],
    ];
    for (const [sizeKey, raw] of pairs) {
      const qty = toStockUnitQty(raw, draft.displayUnit, stockUnit);
      if (qty !== null && qty > 0) {
        lines.push({ stockItemId: draft.stockItemId, qtyPerUnit: qty, sizeKey });
      }
    }
  }
  return lines;
}

function expandSimpleDrafts(
  drafts: SimpleDraftLine[],
  stockItems: StockItem[],
): Array<{ stockItemId: string; qtyPerUnit: number }> {
  const lines: Array<{ stockItemId: string; qtyPerUnit: number }> = [];
  for (const draft of drafts) {
    if (!draft.stockItemId) {
      continue;
    }
    const stockUnit = resolveStockUnit(draft.stockItemId, stockItems);
    const qty = toStockUnitQty(draft.qtyPerUnit, draft.displayUnit, stockUnit);
    if (qty !== null && qty > 0) {
      lines.push({ stockItemId: draft.stockItemId, qtyPerUnit: qty });
    }
  }
  return lines;
}

function convertMenuDraftDisplayUnit(
  draft: MenuDraftLine,
  nextUnit: StockUnit,
): MenuDraftLine {
  if (draft.displayUnit === nextUnit) {
    return draft;
  }
  const convertField = (raw: string): string => {
    if (!raw.trim()) {
      return "";
    }
    const num = Number(raw);
    const converted = convertStockQty(num, draft.displayUnit, nextUnit);
    return converted === null ? raw : formatQtyInput(converted);
  };
  return {
    ...draft,
    displayUnit: nextUnit,
    qtyDefault: convertField(draft.qtyDefault),
    qtySmall: convertField(draft.qtySmall),
    qtyLarge: convertField(draft.qtyLarge),
    qtyFamily: convertField(draft.qtyFamily),
  };
}

function convertSimpleDraftDisplayUnit(
  draft: SimpleDraftLine,
  nextUnit: StockUnit,
): SimpleDraftLine {
  if (draft.displayUnit === nextUnit) {
    return draft;
  }
  if (!draft.qtyPerUnit.trim()) {
    return { ...draft, displayUnit: nextUnit };
  }
  const num = Number(draft.qtyPerUnit);
  const converted = convertStockQty(num, draft.displayUnit, nextUnit);
  return {
    ...draft,
    displayUnit: nextUnit,
    qtyPerUnit: converted === null ? draft.qtyPerUnit : formatQtyInput(converted),
  };
}

function formatPreview(lines: RecipeLine[]): string {
  if (lines.length === 0) {
    return "No recipe";
  }
  const byStock = new Map<string, RecipeLine>();
  for (const line of lines) {
    if (!byStock.has(line.stockItemId)) {
      byStock.set(line.stockItemId, line);
    }
  }
  return Array.from(byStock.values())
    .slice(0, 4)
    .map(
      (line) =>
        `${line.stockItemName} ${formatStockQty(
          line.qtyPerUnit,
          line.stockItemUnit as StockUnit,
        )}`,
    )
    .join(" · ");
}

function UnitToggle({
  stockUnit,
  displayUnit,
  onChange,
}: {
  stockUnit: StockUnit;
  displayUnit: StockUnit;
  onChange: (unit: StockUnit) => void;
}): React.ReactElement | null {
  const options = compatibleDisplayUnits(stockUnit);
  if (options.length < 2) {
    return (
      <span
        className={cn(
          "inline-flex h-8 items-center rounded-lg bg-zinc-100 px-2 text-xs font-medium dark:bg-white/10",
          secondaryText,
        )}
      >
        {STOCK_UNIT_LABELS[stockUnit]}
      </span>
    );
  }

  return (
    <div className="inline-flex rounded-lg border border-zinc-200/70 p-0.5 dark:border-white/15">
      {options.map((unit) => (
        <button
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition",
            displayUnit === unit
              ? "bg-[#d81b60]/12 text-[#d81b60]"
              : cn("hover:bg-zinc-100 dark:hover:bg-white/5", secondaryText),
          )}
          key={unit}
          onClick={() => onChange(unit)}
          type="button"
        >
          {STOCK_UNIT_LABELS[unit]}
        </button>
      ))}
    </div>
  );
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
  const [search, setSearch] = useState("");
  const [coverage, setCoverage] = useState<CoverageFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuDrafts, setMenuDrafts] = useState<MenuDraftLine[]>([]);
  const [simpleDrafts, setSimpleDrafts] = useState<SimpleDraftLine[]>([]);
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

  useEffect(() => {
    setExpandedId(null);
    setMenuDrafts([]);
    setSimpleDrafts([]);
    setSearch("");
    setCoverage("all");
    setError(null);
    setSuccess(null);
  }, [subTab]);

  const menuCoverage = useMemo(() => {
    const withRecipe = menuRecipes.filter((r) => r.lines.length > 0).length;
    return { withRecipe, total: menuRecipes.length };
  }, [menuRecipes]);

  const toppingCoverage = useMemo(() => {
    const withRecipe = toppingRecipes.filter((r) => r.lines.length > 0).length;
    return { withRecipe, total: toppingRecipes.length };
  }, [toppingRecipes]);

  const crustCoverage = useMemo(() => {
    const withRecipe = crustRecipes.filter((r) => r.lines.length > 0).length;
    return { withRecipe, total: crustRecipes.length };
  }, [crustRecipes]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuRecipes.filter((recipe) => {
      if (coverage === "has" && recipe.lines.length === 0) {
        return false;
      }
      if (coverage === "missing" && recipe.lines.length > 0) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        recipe.menuItemName.toLowerCase().includes(q) ||
        String(recipe.menuItemNumber).includes(q)
      );
    });
  }, [menuRecipes, search, coverage]);

  const filteredToppings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return toppingRecipes.filter((recipe) => {
      if (coverage === "has" && recipe.lines.length === 0) {
        return false;
      }
      if (coverage === "missing" && recipe.lines.length > 0) {
        return false;
      }
      if (!q) {
        return true;
      }
      return recipe.toppingLabel.toLowerCase().includes(q);
    });
  }, [toppingRecipes, search, coverage]);

  const filteredCrusts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return crustRecipes.filter((recipe) => {
      if (coverage === "has" && recipe.lines.length === 0) {
        return false;
      }
      if (coverage === "missing" && recipe.lines.length > 0) {
        return false;
      }
      if (!q) {
        return true;
      }
      return recipe.crustLabel.toLowerCase().includes(q);
    });
  }, [crustRecipes, search, coverage]);

  const openMenu = (recipe: MenuItemRecipe): void => {
    const id = recipe.menuItemId;
    if (expandedId === id) {
      setExpandedId(null);
      setMenuDrafts([]);
      return;
    }
    setExpandedId(id);
    setMenuDrafts(menuDraftsFromLines(recipe.lines, activeStock));
    setSuccess(null);
    setError(null);
  };

  const openTopping = (recipe: ToppingRecipe): void => {
    const id = recipe.toppingId;
    if (expandedId === id) {
      setExpandedId(null);
      setSimpleDrafts([]);
      return;
    }
    setExpandedId(id);
    setSimpleDrafts(simpleDraftsFromLines(recipe.lines, activeStock));
    setSuccess(null);
    setError(null);
  };

  const openCrust = (recipe: CrustRecipe): void => {
    const id = recipe.crustOptionId;
    if (expandedId === id) {
      setExpandedId(null);
      setSimpleDrafts([]);
      return;
    }
    setExpandedId(id);
    setSimpleDrafts(simpleDraftsFromLines(recipe.lines, activeStock));
    setSuccess(null);
    setError(null);
  };

  const handleSaveMenu = async (menuItemId: string): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await replaceInventoryRecipe(
        token,
        menuItemId,
        { lines: expandMenuDrafts(menuDrafts, activeStock) },
        brandSlug,
      );
      setMenuRecipes((current) =>
        current.map((entry) =>
          entry.menuItemId === updated.menuItemId ? updated : entry,
        ),
      );
      setMenuDrafts(menuDraftsFromLines(updated.lines, activeStock));
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

  const handleSaveTopping = async (toppingId: string): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await replaceToppingRecipe(
        token,
        toppingId,
        { lines: expandSimpleDrafts(simpleDrafts, activeStock) },
        brandSlug,
      );
      setToppingRecipes((current) =>
        current.map((entry) =>
          entry.toppingId === updated.toppingId ? updated : entry,
        ),
      );
      setSimpleDrafts(simpleDraftsFromLines(updated.lines, activeStock));
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

  const handleSaveCrust = async (crustOptionId: string): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await replaceCrustRecipe(
        token,
        crustOptionId,
        { lines: expandSimpleDrafts(simpleDrafts, activeStock) },
        brandSlug,
      );
      setCrustRecipes((current) =>
        current.map((entry) =>
          entry.crustOptionId === updated.crustOptionId ? updated : entry,
        ),
      );
      setSimpleDrafts(simpleDraftsFromLines(updated.lines, activeStock));
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

  const activeCoverage =
    subTab === "menu"
      ? menuCoverage
      : subTab === "toppings"
        ? toppingCoverage
        : crustCoverage;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          Recipes
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Link every menu item, topping, and crust to stock used per sale.
          Amounts are stored in each stock item’s unit — switch g/kg or mL/L
          when entering is easier.
        </p>
      </div>

      {activeStock.length === 0 ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          No active stock items yet. Add items in Stock list before building
          recipes.
        </p>
      ) : null}

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
            onClick={() => setSubTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          className="max-w-sm"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            subTab === "menu"
              ? "Search menu items…"
              : subTab === "toppings"
                ? "Search toppings…"
                : "Search crusts…"
          }
          value={search}
        />
        <div className="flex flex-wrap items-center gap-2">
          {COVERAGE_FILTERS.map((filter) => (
            <button
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                coverage === filter.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : cn(
                      "bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15",
                      secondaryText,
                    ),
              )}
              key={filter.id}
              onClick={() => setCoverage(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
          <span className={cn("text-xs", secondaryText)}>
            {activeCoverage.withRecipe} / {activeCoverage.total} with recipes
          </span>
        </div>
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

      {subTab === "menu" ? (
        <RecipeAccordionList
          emptyFilterMessage={
            coverage === "missing"
              ? "All menu items have recipes."
              : coverage === "has"
                ? "No menu items have recipes yet."
                : "No menu items match your search."
          }
          items={filteredMenu.map((recipe) => ({
            id: recipe.menuItemId,
            title: `#${recipe.menuItemNumber} ${recipe.menuItemName}`,
            lines: recipe.lines,
            expanded: expandedId === recipe.menuItemId,
            onToggle: () => openMenu(recipe),
            editor:
              expandedId === recipe.menuItemId ? (
                <MenuRecipeEditor
                  drafts={menuDrafts}
                  isSaving={isSaving}
                  onChangeDrafts={setMenuDrafts}
                  onSave={() => void handleSaveMenu(recipe.menuItemId)}
                  stockItems={activeStock}
                  title={recipe.menuItemName}
                />
              ) : null,
          }))}
        />
      ) : null}

      {subTab === "toppings" ? (
        <RecipeAccordionList
          emptyFilterMessage={
            coverage === "missing"
              ? "All toppings have recipes."
              : coverage === "has"
                ? "No toppings have recipes yet."
                : "No toppings match your search."
          }
          items={filteredToppings.map((recipe) => ({
            id: recipe.toppingId,
            title: recipe.toppingLabel,
            lines: recipe.lines,
            expanded: expandedId === recipe.toppingId,
            onToggle: () => openTopping(recipe),
            editor:
              expandedId === recipe.toppingId ? (
                <SimpleRecipeEditor
                  drafts={simpleDrafts}
                  emptyMessage="No topping recipe lines yet."
                  isSaving={isSaving}
                  onChangeDrafts={setSimpleDrafts}
                  onSave={() => void handleSaveTopping(recipe.toppingId)}
                  stockItems={activeStock}
                  title={recipe.toppingLabel}
                />
              ) : null,
          }))}
        />
      ) : null}

      {subTab === "crusts" ? (
        <RecipeAccordionList
          emptyFilterMessage={
            coverage === "missing"
              ? "All crusts have recipes."
              : coverage === "has"
                ? "No crusts have recipes yet."
                : "No crusts match your search."
          }
          items={filteredCrusts.map((recipe) => ({
            id: recipe.crustOptionId,
            title: recipe.crustLabel,
            lines: recipe.lines,
            expanded: expandedId === recipe.crustOptionId,
            onToggle: () => openCrust(recipe),
            editor:
              expandedId === recipe.crustOptionId ? (
                <SimpleRecipeEditor
                  drafts={simpleDrafts}
                  emptyMessage="No crust recipe lines yet."
                  isSaving={isSaving}
                  onChangeDrafts={setSimpleDrafts}
                  onSave={() => void handleSaveCrust(recipe.crustOptionId)}
                  stockItems={activeStock}
                  title={recipe.crustLabel}
                />
              ) : null,
          }))}
        />
      ) : null}
    </div>
  );
}

interface AccordionItem {
  id: string;
  title: string;
  lines: RecipeLine[];
  expanded: boolean;
  onToggle: () => void;
  editor: React.ReactNode;
}

function RecipeAccordionList({
  items,
  emptyFilterMessage,
}: {
  items: AccordionItem[];
  emptyFilterMessage: string;
}): React.ReactElement {
  if (items.length === 0) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-dashed border-zinc-200/70 px-4 py-10 text-center text-sm dark:border-white/15",
          secondaryText,
        )}
      >
        {emptyFilterMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-white/10">
      {items.map((item, index) => (
        <div
          className={cn(
            index > 0 && "border-t border-zinc-200/60 dark:border-white/10",
          )}
          key={item.id}
        >
          <button
            className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-white/5"
            onClick={item.onToggle}
            type="button"
          >
            <ChevronDown
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0 transition",
                secondaryText,
                item.expanded ? "rotate-0" : "-rotate-90",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("font-medium", primaryText)}>
                  {item.title}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    item.lines.length > 0
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 text-amber-800 dark:text-amber-200",
                  )}
                >
                  {item.lines.length > 0
                    ? `${item.lines.length} line${item.lines.length === 1 ? "" : "s"}`
                    : "No recipe"}
                </span>
              </div>
              <p className={cn("mt-0.5 truncate text-xs", secondaryText)}>
                {formatPreview(item.lines)}
              </p>
            </div>
          </button>
          {item.expanded && item.editor ? (
            <div className="border-t border-zinc-200/40 bg-zinc-50/60 px-4 py-4 dark:border-white/5 dark:bg-zinc-950/40">
              {item.editor}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MenuRecipeEditor({
  title,
  drafts,
  onChangeDrafts,
  stockItems,
  isSaving,
  onSave,
}: {
  title: string;
  drafts: MenuDraftLine[];
  onChangeDrafts: (drafts: MenuDraftLine[]) => void;
  stockItems: StockItem[];
  isSaving: boolean;
  onSave: () => void;
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <p className={cn("text-sm font-medium", primaryText)}>
          Stock used per 1 × {title}
        </p>
        <p className={cn("mt-1 text-xs", secondaryText)}>
          Leave size blank to skip. Default applies when no size-specific amount
          is set. Amounts save in the stock item’s unit.
        </p>
      </div>

      {drafts.length === 0 ? (
        <p className={cn("text-sm", secondaryText)}>
          No recipe lines yet. Add flour, cheese, oil, etc.
        </p>
      ) : null}

      {drafts.map((line, index) => {
        const stock = stockItems.find((item) => item.id === line.stockItemId);
        const stockUnit = stock?.unit ?? line.displayUnit;
        const qtyFields = [
          ["qtyDefault", "Default", line.qtyDefault],
          ["qtySmall", "Small", line.qtySmall],
          ["qtyLarge", "Large", line.qtyLarge],
          ["qtyFamily", "Family", line.qtyFamily],
        ] as const;
        const oversized = qtyFields.some(([, , raw]) =>
          stock
            ? isLikelyOversizedRecipeQty(raw, line.displayUnit, stockUnit)
            : false,
        );

        return (
          <div
            className="space-y-2 rounded-xl border border-zinc-200/50 bg-white/70 p-3 dark:border-white/10 dark:bg-zinc-900/40"
            key={line.key}
          >
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <label className={cn("mb-1 block text-xs", secondaryText)}>
                  Stock item
                </label>
                <select
                  className={inventorySelectClassName}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const nextUnit = resolveStockUnit(nextId, stockItems);
                    onChangeDrafts(
                      drafts.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              stockItemId: nextId,
                              displayUnit: nextUnit,
                            }
                          : entry,
                      ),
                    );
                  }}
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
              {stock ? (
                <div>
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    Enter as
                  </label>
                  <UnitToggle
                    displayUnit={line.displayUnit}
                    onChange={(unit) =>
                      onChangeDrafts(
                        drafts.map((entry, i) =>
                          i === index
                            ? convertMenuDraftDisplayUnit(entry, unit)
                            : entry,
                        ),
                      )
                    }
                    stockUnit={stockUnit}
                  />
                </div>
              ) : null}
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

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {qtyFields.map(([field, label]) => (
                <div key={field}>
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    {label} ({STOCK_UNIT_LABELS[line.displayUnit]})
                  </label>
                  <Input
                    inputMode="decimal"
                    onChange={(event) =>
                      onChangeDrafts(
                        drafts.map((entry, i) =>
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

            {oversized ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                That looks large for one pizza — check you meant{" "}
                {STOCK_UNIT_LABELS[line.displayUnit]} (stored as{" "}
                {STOCK_UNIT_LABELS[stockUnit]}).
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onChangeDrafts([...drafts, emptyMenuDraft()])}
          type="button"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add stock line
        </Button>
        <Button disabled={isSaving} onClick={onSave} type="button">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save recipe
        </Button>
      </div>
    </div>
  );
}

function SimpleRecipeEditor({
  title,
  drafts,
  onChangeDrafts,
  stockItems,
  emptyMessage,
  isSaving,
  onSave,
}: {
  title: string;
  drafts: SimpleDraftLine[];
  onChangeDrafts: (drafts: SimpleDraftLine[]) => void;
  stockItems: StockItem[];
  emptyMessage: string;
  isSaving: boolean;
  onSave: () => void;
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <p className={cn("text-sm font-medium", primaryText)}>
          Stock used per 1 × {title}
        </p>
        <p className={cn("mt-1 text-xs", secondaryText)}>
          Amounts save in the stock item’s unit. Use g/kg or mL/L when helpful.
        </p>
      </div>

      {drafts.length === 0 ? (
        <p className={cn("text-sm", secondaryText)}>{emptyMessage}</p>
      ) : null}

      {drafts.map((line, index) => {
        const stock = stockItems.find((item) => item.id === line.stockItemId);
        const stockUnit = stock?.unit ?? line.displayUnit;
        const oversized = stock
          ? isLikelyOversizedRecipeQty(
              line.qtyPerUnit,
              line.displayUnit,
              stockUnit,
            )
          : false;

        return (
          <div
            className="space-y-2 rounded-xl border border-zinc-200/50 bg-white/70 p-3 dark:border-white/10 dark:bg-zinc-900/40"
            key={line.key}
          >
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[12rem] flex-1">
                <label className={cn("mb-1 block text-xs", secondaryText)}>
                  Stock item
                </label>
                <select
                  className={inventorySelectClassName}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    const nextUnit = resolveStockUnit(nextId, stockItems);
                    onChangeDrafts(
                      drafts.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              stockItemId: nextId,
                              displayUnit: nextUnit,
                            }
                          : entry,
                      ),
                    );
                  }}
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
                  Qty ({STOCK_UNIT_LABELS[line.displayUnit]})
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
              {stock ? (
                <div>
                  <label className={cn("mb-1 block text-xs", secondaryText)}>
                    Enter as
                  </label>
                  <UnitToggle
                    displayUnit={line.displayUnit}
                    onChange={(unit) =>
                      onChangeDrafts(
                        drafts.map((entry, i) =>
                          i === index
                            ? convertSimpleDraftDisplayUnit(entry, unit)
                            : entry,
                        ),
                      )
                    }
                    stockUnit={stockUnit}
                  />
                </div>
              ) : null}
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
            {oversized ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                That looks large for one unit — check you meant{" "}
                {STOCK_UNIT_LABELS[line.displayUnit]} (stored as{" "}
                {STOCK_UNIT_LABELS[stockUnit]}).
              </p>
            ) : null}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onChangeDrafts([...drafts, emptySimpleDraft()])}
          type="button"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add stock line
        </Button>
        <Button disabled={isSaving} onClick={onSave} type="button">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save recipe
        </Button>
      </div>
    </div>
  );
}
