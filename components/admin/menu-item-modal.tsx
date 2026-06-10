"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { MenuItemCustomizationFields } from "@/components/admin/menu-item-customization-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  hasExtras,
  hasSizePricing,
  slugifyMenuName,
} from "@/lib/menu-categories";
import { MENU_ITEM_BADGES, type MenuItemBadge } from "@/lib/menu-badges";
import {
  createDefaultSizeOptions,
  deriveBasePrice,
  formatIngredients,
  parseIngredientInput,
  sizeOptionsFromApi,
  sizeOptionsFromLegacyPricing,
  type SizeOptions,
} from "@/lib/size-options";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type {
  AdminMenuCategoryRecord,
  AdminMenuItem,
  CreateMenuItemPayload,
  IngredientCategoryGroup,
  ToppingCategoryGroup,
  UpdateMenuItemPayload,
} from "@/types/admin";
import { cn } from "@/lib/utils";

const DEFAULT_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDAztgV3gtFx59ndY07FTi3-NLqYaoI0rIdAXFlvqVqNS7mzdMxuwyGZehBKvZXg9VEXj5-Y18b3E83yfMVk-ROgSK32TAENHOaZYeAoBfXItyQL4dsjb50MDQ1X2j8kXPbXb6TGrQh8TB8rdCGwot8PiAKLc6vr3dAtdnXmL0WeLZ9414jYzOVxu_C1sYfQ5S_wYQiD6n4a_6LjpzS61Q8jfeZquqtPk0Bjo3PSqsscEePNO-gS1NxvK0WUUHnUWIZIr3Wt9Qi-E4";

interface MenuItemFormState {
  name: string;
  description: string;
  categorySlug: string;
  price: string;
  priceNote: string;
  imageUrl: string;
  imageAlt: string;
  badges: MenuItemBadge[];
  ingredients: string[];
  sizeOptions: SizeOptions;
  allowedToppingIds: string[];
  isActive: boolean;
}

interface MenuItemModalProps {
  mode: "create" | "edit";
  open: boolean;
  item?: AdminMenuItem | null;
  toppingCatalog: ToppingCategoryGroup[];
  ingredientCatalog: IngredientCategoryGroup[];
  menuCategories: AdminMenuCategoryRecord[];
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateMenuItemPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateMenuItemPayload) => Promise<void>;
}

function normalizeIngredientSlugs(
  values: string[],
  catalog: IngredientCategoryGroup[]
): string[] {
  const all = catalog.flatMap((group) => group.ingredients);
  const bySlug = new Set(all.map((entry) => entry.slug));
  const byLabel = new Map(all.map((entry) => [entry.label.toLowerCase(), entry.slug]));

  return values.map((value) => {
    if (bySlug.has(value)) {
      return value;
    }

    return byLabel.get(value.toLowerCase()) ?? value;
  });
}

function ingredientLabelsFromSlugs(
  slugs: string[],
  catalog: IngredientCategoryGroup[]
): string[] {
  const bySlug = new Map(
    catalog.flatMap((group) => group.ingredients).map((entry) => [entry.slug, entry.label])
  );

  return slugs.map((slug) => bySlug.get(slug) ?? slug);
}

function emptyForm(categories: AdminMenuCategoryRecord[]): MenuItemFormState {
  return {
    name: "",
    description: "",
    categorySlug: categories[0]?.slug ?? "traditional-pizza",
    price: "20",
    priceNote: "",
    imageUrl: DEFAULT_IMAGE_URL,
    imageAlt: "",
    badges: [],
    ingredients: [],
    sizeOptions: createDefaultSizeOptions(),
    allowedToppingIds: [],
    isActive: true,
  };
}

function formFromItem(
  item: AdminMenuItem,
  ingredientCatalog: IngredientCategoryGroup[]
): MenuItemFormState {
  const rawIngredients =
    item.ingredients?.length > 0 ? item.ingredients : parseIngredientInput(item.description);
  const ingredients = normalizeIngredientSlugs(rawIngredients, ingredientCatalog);
  const sizeOptions = item.sizeOptions
    ? sizeOptionsFromApi(item.sizeOptions)
    : sizeOptionsFromLegacyPricing(item.sizePricing);

  return {
    name: item.name,
    description: item.description,
    categorySlug: item.categorySlug,
    price: String(item.price),
    priceNote: item.priceNote ?? "",
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    badges: item.badges ?? [],
    ingredients,
    sizeOptions,
    allowedToppingIds: item.allowedToppingIds ?? [],
    isActive: item.isActive,
  };
}

export function MenuItemModal({
  mode,
  open,
  item,
  toppingCatalog,
  ingredientCatalog,
  menuCategories,
  onOpenChange,
  onCreate,
  onUpdate,
}: MenuItemModalProps): React.ReactElement {
  const [form, setForm] = useState<MenuItemFormState>(() => emptyForm(menuCategories));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setError(null);
      setForm(mode === "edit" && item ? formFromItem(item, ingredientCatalog) : emptyForm(menuCategories));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, mode, item, menuCategories, ingredientCatalog]);

  const showSizeOptions = hasSizePricing(form.categorySlug, menuCategories);
  const showExtraToppings = hasExtras(form.categorySlug, menuCategories);

  const updateField = <K extends keyof MenuItemFormState>(
    key: K,
    value: MenuItemFormState[K]
  ): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleBadge = (badgeId: MenuItemBadge): void => {
    setForm((current) => ({
      ...current,
      badges: current.badges.includes(badgeId)
        ? current.badges.filter((entry) => entry !== badgeId)
        : [...current.badges, badgeId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.imageUrl.trim() || !form.imageAlt.trim()) {
      setError("Image URL and alt text are required.");
      return;
    }

    const description =
      form.ingredients.length > 0
        ? formatIngredients(ingredientLabelsFromSlugs(form.ingredients, ingredientCatalog))
        : form.description.trim();

    if (!description) {
      setError("Add at least one ingredient or a description.");
      return;
    }

    const price = showSizeOptions ? deriveBasePrice(form.sizeOptions) : Number(form.price);

    if (Number.isNaN(price) || price < 0) {
      setError("Prices must be valid non-negative numbers.");
      return;
    }

    if (
      showSizeOptions &&
      !form.sizeOptions.small.enabled &&
      !form.sizeOptions.large.enabled &&
      !form.sizeOptions.family.enabled
    ) {
      setError("Enable at least one size for pizza items.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payloadBase = {
      name: form.name.trim(),
      description,
      price,
      categorySlug: form.categorySlug,
      imageUrl: form.imageUrl.trim(),
      imageAlt: form.imageAlt.trim(),
      badges: form.badges,
      priceNote: form.priceNote.trim() || null,
      ingredients: form.ingredients,
      allowedToppingIds: form.allowedToppingIds,
      isActive: form.isActive,
    };

    try {
      if (mode === "create") {
        await onCreate({
          ...payloadBase,
          slug: slugifyMenuName(form.name),
          number: Math.floor(Date.now() / 1000) % 1000,
          sizeOptions: showSizeOptions ? form.sizeOptions : undefined,
        });
      } else if (item) {
        await onUpdate(item.id, {
          ...payloadBase,
          sizeOptions: showSizeOptions ? form.sizeOptions : null,
        });
      }

      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[60] max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6",
            dashboardGlass
          )}
        >
          <Dialog.Title className={cn("font-display text-2xl font-bold", primaryText)}>
            {mode === "create" ? "Add Menu Item" : "Edit Menu Item"}
          </Dialog.Title>
          <Dialog.Description className={cn("mt-2 text-sm", secondaryText)}>
            Configure ingredients, sizes, extra toppings, badges, and pricing.
          </Dialog.Description>

          <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Name</label>
                <Input
                  onChange={(event) => updateField("name", event.target.value)}
                  value={form.name}
                />
              </div>

              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Category</label>
                <select
                  className="h-11 w-full rounded-xl border border-zinc-200/70 bg-white/80 px-4 text-sm text-zinc-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                  onChange={(event) => updateField("categorySlug", event.target.value)}
                  value={form.categorySlug}
                >
                  {menuCategories.map((entry) => (
                    <option key={entry.slug} value={entry.slug}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>
                  Price note <span className={cn("font-normal", secondaryText)}>(optional)</span>
                </label>
                <Input
                  onChange={(event) => updateField("priceNote", event.target.value)}
                  placeholder="e.g. Gnocchi option add $2"
                  value={form.priceNote}
                />
              </div>
            </div>

            <MenuItemCustomizationFields
              allowedToppingIds={form.allowedToppingIds}
              ingredientCatalog={ingredientCatalog}
              ingredients={form.ingredients}
              onAllowedToppingIdsChange={(ids) => updateField("allowedToppingIds", ids)}
              onIngredientsChange={(ingredients) => updateField("ingredients", ingredients)}
              onSizeOptionsChange={(sizeOptions) => updateField("sizeOptions", sizeOptions)}
              showExtraToppings={showExtraToppings}
              showSizeOptions={showSizeOptions}
              sizeOptions={form.sizeOptions}
              toppingCatalog={toppingCatalog}
            />

            {!showSizeOptions ? (
              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Price</label>
                <Input
                  min="0"
                  onChange={(event) => updateField("price", event.target.value)}
                  step="0.01"
                  type="number"
                  value={form.price}
                />
              </div>
            ) : null}

            {!showSizeOptions && form.ingredients.length === 0 ? (
              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Description</label>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-zinc-200/70 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-[#d81b60] focus:ring-2 focus:ring-[#d81b60]/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
                  onChange={(event) => updateField("description", event.target.value)}
                  value={form.description}
                />
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Image URL</label>
                <Input
                  onChange={(event) => updateField("imageUrl", event.target.value)}
                  type="url"
                  value={form.imageUrl}
                />
              </div>
              <div>
                <label className={cn("mb-2 block text-sm font-medium", primaryText)}>Image alt text</label>
                <Input
                  onChange={(event) => updateField("imageAlt", event.target.value)}
                  value={form.imageAlt}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className={cn("text-sm font-medium", primaryText)}>Menu badges</p>
              <div className="flex flex-wrap gap-2">
                {MENU_ITEM_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  const selected = form.badges.includes(badge.id);

                  return (
                    <button
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                        selected
                          ? badge.className
                          : "border-zinc-200/70 bg-white/60 text-zinc-600 hover:border-[#d81b60]/30 hover:text-[#d81b60] dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400"
                      )}
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      type="button"
                    >
                      <Icon className="h-4 w-4" />
                      {badge.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                checked={form.isActive}
                className="h-4 w-4 rounded border-zinc-300 text-[#d81b60] focus:ring-[#d81b60]"
                onChange={(event) => updateField("isActive", event.target.checked)}
                type="checkbox"
              />
              <span className={cn("text-sm font-medium", primaryText)}>Visible on menu</span>
            </label>

            {error ? <p className="text-sm text-[#d81b60]">{error}</p> : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "create" ? (
                  "Create Item"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
