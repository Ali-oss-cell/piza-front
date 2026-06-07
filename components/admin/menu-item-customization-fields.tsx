"use client";

import { X } from "lucide-react";
import {
  SIZE_OPTION_FIELDS,
  type SizeOptions,
} from "@/lib/size-options";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { IngredientCategoryGroup, ToppingCategoryGroup } from "@/types/admin";
import { cn } from "@/lib/utils";

interface MenuItemCustomizationFieldsProps {
  showSizeOptions: boolean;
  ingredients: string[];
  sizeOptions: SizeOptions;
  allowedToppingIds: string[];
  toppingCatalog: ToppingCategoryGroup[];
  ingredientCatalog: IngredientCategoryGroup[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSizeOptionsChange: (sizeOptions: SizeOptions) => void;
  onAllowedToppingIdsChange: (ids: string[]) => void;
}

function ingredientLabel(
  slug: string,
  catalog: IngredientCategoryGroup[]
): string {
  const match = catalog.flatMap((group) => group.ingredients).find((entry) => entry.slug === slug);
  return match?.label ?? slug;
}

export function MenuItemCustomizationFields({
  showSizeOptions,
  ingredients,
  sizeOptions,
  allowedToppingIds,
  toppingCatalog,
  ingredientCatalog,
  onIngredientsChange,
  onSizeOptionsChange,
  onAllowedToppingIdsChange,
}: MenuItemCustomizationFieldsProps): React.ReactElement {
  const toggleIngredient = (slug: string): void => {
    if (ingredients.includes(slug)) {
      onIngredientsChange(ingredients.filter((entry) => entry !== slug));
      return;
    }

    onIngredientsChange([...ingredients, slug]);
  };

  const allSlugs = toppingCatalog.flatMap((category) =>
    category.toppings.map((topping) => topping.slug)
  );
  const allToppingsSelected = allowedToppingIds.length === 0;

  const toggleTopping = (slug: string): void => {
    if (allToppingsSelected) {
      onAllowedToppingIdsChange(allSlugs.filter((entry) => entry !== slug));
      return;
    }

    if (allowedToppingIds.includes(slug)) {
      onAllowedToppingIdsChange(allowedToppingIds.filter((entry) => entry !== slug));
      return;
    }

    const next = [...allowedToppingIds, slug];
    onAllowedToppingIdsChange(next.length === allSlugs.length ? [] : next);
  };

  const selectAllToppings = (): void => {
    onAllowedToppingIdsChange([]);
  };

  return (
    <div className="space-y-6">
      <section className={cn("space-y-3 rounded-2xl border border-zinc-200/50 p-4 dark:border-white/10", dashboardGlass)}>
        <div>
          <p className={cn("text-sm font-medium", primaryText)}>Base ingredients</p>
          <p className={cn("mt-1 text-xs", secondaryText)}>
            Select from the ingredient catalog. Shown to customers on the menu and product pages.
          </p>
        </div>

        {ingredientCatalog.length === 0 ? (
          <p className={cn("text-sm", secondaryText)}>
            No ingredients in the catalog yet. Add them in the Ingredients admin tab.
          </p>
        ) : (
          <>
            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((slug) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-[#d81b60]/40 bg-[#d81b60]/10 px-3 py-1 text-sm text-[#d81b60]"
                    key={slug}
                  >
                    {ingredientLabel(slug, ingredientCatalog)}
                    <button
                      aria-label={`Remove ${ingredientLabel(slug, ingredientCatalog)}`}
                      className="rounded-full p-0.5 hover:text-red-500"
                      onClick={() => toggleIngredient(slug)}
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            {ingredientCatalog.map((category) => (
              <div key={category.id}>
                <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", secondaryText)}>
                  {category.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.ingredients
                    .filter((entry) => entry.isActive)
                    .map((entry) => {
                      const selected = ingredients.includes(entry.slug);

                      return (
                        <button
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            selected
                              ? "border-[#d81b60]/40 bg-[#d81b60]/10 text-[#d81b60]"
                              : "border-zinc-200/70 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400"
                          )}
                          key={entry.slug}
                          onClick={() => toggleIngredient(entry.slug)}
                          type="button"
                        >
                          {entry.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {showSizeOptions ? (
        <section className={cn("space-y-3 rounded-2xl border border-zinc-200/50 p-4 dark:border-white/10", dashboardGlass)}>
          <div>
            <p className={cn("text-sm font-medium", primaryText)}>Sizes & pricing</p>
            <p className={cn("mt-1 text-xs", secondaryText)}>
              Enable each size and set its price. Disabled sizes won&apos;t appear for customers.
            </p>
          </div>

          <div className="space-y-3">
            {SIZE_OPTION_FIELDS.map((field) => {
              const option = sizeOptions[field.key];

              return (
                <div
                  className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-zinc-200/50 p-3 dark:border-white/10"
                  key={field.key}
                >
                  <label className="flex items-center gap-2">
                    <input
                      checked={option.enabled}
                      className="h-4 w-4 rounded border-zinc-300 text-[#d81b60] focus:ring-[#d81b60]"
                      onChange={(event) =>
                        onSizeOptionsChange({
                          ...sizeOptions,
                          [field.key]: { ...option, enabled: event.target.checked },
                        })
                      }
                      type="checkbox"
                    />
                    <span className={cn("text-sm font-medium", primaryText)}>{field.label}</span>
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900"
                    disabled={!option.enabled}
                    min="0"
                    onChange={(event) =>
                      onSizeOptionsChange({
                        ...sizeOptions,
                        [field.key]: { ...option, price: Number(event.target.value) },
                      })
                    }
                    step="0.01"
                    type="number"
                    value={option.price}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {showSizeOptions && toppingCatalog.length > 0 ? (
        <section className={cn("space-y-3 rounded-2xl border border-zinc-200/50 p-4 dark:border-white/10", dashboardGlass)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={cn("text-sm font-medium", primaryText)}>Extra toppings</p>
              <p className={cn("mt-1 text-xs", secondaryText)}>
                Choose which add-ons customers can pick. Leave all selected to allow every topping.
              </p>
            </div>
            <button
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                allToppingsSelected
                  ? "border-[#d81b60]/40 bg-[#d81b60]/10 text-[#d81b60]"
                  : "border-zinc-200/70 text-zinc-600 hover:border-[#d81b60]/30 dark:border-white/10 dark:text-zinc-400"
              )}
              onClick={selectAllToppings}
              type="button"
            >
              Allow all toppings
            </button>
          </div>

          {toppingCatalog.map((category) => (
            <div key={category.id}>
              <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", secondaryText)}>
                {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.toppings.map((topping) => {
                  const selected = allToppingsSelected || allowedToppingIds.includes(topping.slug);

                  return (
                    <button
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-[#d81b60]/40 bg-[#d81b60]/10 text-[#d81b60]"
                          : "border-zinc-200/70 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400"
                      )}
                      key={topping.slug}
                      onClick={() => toggleTopping(topping.slug)}
                      type="button"
                    >
                      {topping.label}
                      <span className="ml-1 text-xs opacity-70">
                        +${Number(topping.priceDelta).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
