"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createIngredient,
  createIngredientCategory,
  deleteIngredient,
  deleteIngredientCategory,
  updateIngredient,
  updateIngredientCategory,
} from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type {
  AdminIngredient,
  AdminIngredientCategory,
  CreateIngredientCategoryPayload,
  CreateIngredientPayload,
  IngredientCategoryGroup,
  UpdateIngredientCategoryPayload,
  UpdateIngredientPayload,
} from "@/types/admin";
import { cn } from "@/lib/utils";

interface IngredientsViewProps {
  token: string;
  ingredientCatalog: IngredientCategoryGroup[];
  categories: AdminIngredientCategory[];
  onCatalogChange: (catalog: IngredientCategoryGroup[]) => void;
  onCategoriesChange: (categories: AdminIngredientCategory[]) => void;
  onCatalogRefresh: () => Promise<void>;
}

interface IngredientFormState {
  label: string;
  slug: string;
  categorySlug: string;
  sortOrder: string;
  isActive: boolean;
}

interface CategoryFormState {
  label: string;
  slug: string;
  sortOrder: string;
}

function emptyIngredientForm(categories: AdminIngredientCategory[]): IngredientFormState {
  return {
    label: "",
    slug: "",
    categorySlug: categories[0]?.slug ?? "",
    sortOrder: "0",
    isActive: true,
  };
}

function ingredientFormFromRecord(ingredient: AdminIngredient): IngredientFormState {
  return {
    label: ingredient.label,
    slug: ingredient.slug,
    categorySlug: ingredient.categorySlug,
    sortOrder: String(ingredient.sortOrder),
    isActive: ingredient.isActive,
  };
}

function emptyCategoryForm(categories: AdminIngredientCategory[]): CategoryFormState {
  return {
    label: "",
    slug: "",
    sortOrder: String(categories.length),
  };
}

function categoryFormFromRecord(category: AdminIngredientCategory): CategoryFormState {
  return {
    label: category.label,
    slug: category.slug,
    sortOrder: String(category.sortOrder),
  };
}

function regroupCatalog(
  catalog: IngredientCategoryGroup[],
  ingredient: AdminIngredient,
  mode: "create" | "update" | "delete"
): IngredientCategoryGroup[] {
  const flat = catalog.flatMap((group) => group.ingredients);

  const nextFlat =
    mode === "delete"
      ? flat.filter((entry) => entry.id !== ingredient.id)
      : mode === "create"
        ? [...flat, ingredient]
        : flat.map((entry) => (entry.id === ingredient.id ? ingredient : entry));

  const groups = new Map<string, IngredientCategoryGroup>();

  for (const entry of nextFlat) {
    const existing = groups.get(entry.categorySlug);

    if (existing) {
      existing.ingredients.push(entry);
      continue;
    }

    groups.set(entry.categorySlug, {
      id: entry.categorySlug,
      label: entry.categoryLabel,
      ingredients: [entry],
    });
  }

  return [...groups.values()].map((group) => ({
    ...group,
    ingredients: [...group.ingredients].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
    ),
  }));
}

export function IngredientsView({
  token,
  ingredientCatalog,
  categories,
  onCatalogChange,
  onCategoriesChange,
  onCatalogRefresh,
}: IngredientsViewProps): React.ReactElement {
  const [ingredientModalMode, setIngredientModalMode] = useState<"create" | "edit">("create");
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<AdminIngredient | null>(null);
  const [ingredientForm, setIngredientForm] = useState<IngredientFormState>(() =>
    emptyIngredientForm(categories)
  );

  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminIngredientCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(() =>
    emptyCategoryForm(categories)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
  );

  const sortedCatalog = useMemo(
    () =>
      [...ingredientCatalog]
        .map((group) => ({
          ...group,
          ingredients: [...group.ingredients].sort(
            (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
          ),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [ingredientCatalog]
  );

  const ingredientCountBySlug = new Map(
    ingredientCatalog.map((group) => [group.id, group.ingredients.length])
  );

  const openCreateIngredientModal = (): void => {
    setIngredientModalMode("create");
    setEditingIngredient(null);
    setIngredientForm(emptyIngredientForm(categories));
    setError(null);
    setIsIngredientModalOpen(true);
  };

  const openEditIngredientModal = (ingredient: AdminIngredient): void => {
    setIngredientModalMode("edit");
    setEditingIngredient(ingredient);
    setIngredientForm(ingredientFormFromRecord(ingredient));
    setError(null);
    setIsIngredientModalOpen(true);
  };

  const openCreateCategoryModal = (): void => {
    setCategoryModalMode("create");
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm(categories));
    setError(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: AdminIngredientCategory): void => {
    setCategoryModalMode("edit");
    setEditingCategory(category);
    setCategoryForm(categoryFormFromRecord(category));
    setError(null);
    setIsCategoryModalOpen(true);
  };

  const handleIngredientSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload: CreateIngredientPayload | UpdateIngredientPayload = {
      slug: ingredientForm.slug.trim() || slugifyMenuName(ingredientForm.label),
      label: ingredientForm.label.trim(),
      categorySlug: ingredientForm.categorySlug,
      sortOrder: Number(ingredientForm.sortOrder) || 0,
      isActive: ingredientForm.isActive,
    };

    try {
      if (ingredientModalMode === "create") {
        const created = await createIngredient(token, payload as CreateIngredientPayload);
        onCatalogChange(regroupCatalog(ingredientCatalog, created, "create"));
      } else if (editingIngredient) {
        const updated = await updateIngredient(token, editingIngredient.id, payload);
        onCatalogChange(regroupCatalog(ingredientCatalog, updated, "update"));
      }

      setIsIngredientModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save ingredient.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategorySubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload: CreateIngredientCategoryPayload | UpdateIngredientCategoryPayload = {
      slug: categoryForm.slug.trim() || slugifyMenuName(categoryForm.label),
      label: categoryForm.label.trim(),
      sortOrder: Number(categoryForm.sortOrder) || 0,
    };

    try {
      if (categoryModalMode === "create") {
        const created = await createIngredientCategory(token, payload as CreateIngredientCategoryPayload);
        onCategoriesChange([...categories, created]);
      } else if (editingCategory) {
        const updated = await updateIngredientCategory(token, editingCategory.slug, payload);
        onCategoriesChange(
          categories.map((entry) => (entry.slug === editingCategory.slug ? updated : entry))
        );
        await onCatalogRefresh();
      }

      setIsCategoryModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleIngredientActive = async (ingredient: AdminIngredient): Promise<void> => {
    setBusyId(ingredient.id);
    try {
      const updated = await updateIngredient(token, ingredient.id, {
        isActive: !ingredient.isActive,
      });
      onCatalogChange(regroupCatalog(ingredientCatalog, updated, "update"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteIngredient = async (ingredient: AdminIngredient): Promise<void> => {
    if (!window.confirm(`Delete "${ingredient.label}"?`)) {
      return;
    }

    setBusyId(ingredient.id);
    try {
      await deleteIngredient(token, ingredient.id);
      onCatalogChange(regroupCatalog(ingredientCatalog, ingredient, "delete"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCategory = async (category: AdminIngredientCategory): Promise<void> => {
    if (!window.confirm(`Delete category "${category.label}"?`)) {
      return;
    }

    setBusySlug(category.slug);
    try {
      await deleteIngredientCategory(token, category.slug);
      onCategoriesChange(categories.filter((entry) => entry.slug !== category.slug));
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Ingredients</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Manage the base ingredient catalog used on menu items. Group ingredients by category for
          easier selection in the menu editor.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className={cn("font-display text-lg font-semibold", primaryText)}>Categories</h3>
            <p className={cn("mt-1 text-xs", secondaryText)}>
              Organise ingredients into groups like sauces, cheeses, and proteins.
            </p>
          </div>
          <Button onClick={openCreateCategoryModal} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sortedCategories.map((category) => (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={category.slug}
            >
              <div>
                <p className={cn("font-medium", primaryText)}>{category.label}</p>
                <p className={cn("text-xs", secondaryText)}>
                  {category.slug} · {ingredientCountBySlug.get(category.slug) ?? 0} ingredients
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => openEditCategoryModal(category)} size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  disabled={busySlug === category.slug}
                  onClick={() => void handleDeleteCategory(category)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className={cn("font-display text-lg font-semibold", primaryText)}>Catalog</h3>
            <p className={cn("mt-1 text-xs", secondaryText)}>
              These appear when configuring base ingredients on menu items.
            </p>
          </div>
          <Button disabled={categories.length === 0} onClick={openCreateIngredientModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ingredient
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>Add a category before creating ingredients.</p>
          </div>
        ) : sortedCatalog.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No ingredients yet. Add your first one.</p>
          </div>
        ) : (
          sortedCatalog.map((group) => (
            <div className="space-y-3" key={group.id}>
              <p className={cn("text-xs font-semibold uppercase tracking-wide", secondaryText)}>
                {group.label}
              </p>
              <div className="space-y-2">
                {group.ingredients.map((ingredient) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
                    key={ingredient.id}
                  >
                    <div>
                      <p className={cn("font-medium", primaryText)}>{ingredient.label}</p>
                      <p className={cn("text-xs", secondaryText)}>
                        {ingredient.slug} · order {ingredient.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          ingredient.isActive
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-zinc-500/15 text-zinc-500"
                        )}
                        disabled={busyId === ingredient.id}
                        onClick={() => void handleToggleIngredientActive(ingredient)}
                        type="button"
                      >
                        {ingredient.isActive ? "Active" : "Hidden"}
                      </button>
                      <Button onClick={() => openEditIngredientModal(ingredient)} size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={busyId === ingredient.id}
                        onClick={() => void handleDeleteIngredient(ingredient)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <Dialog.Root onOpenChange={setIsIngredientModalOpen} open={isIngredientModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl", dashboardGlass)}>
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {ingredientModalMode === "create" ? "Add Ingredient" : "Edit Ingredient"}
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Label</label>
                <Input
                  onChange={(event) =>
                    setIngredientForm((current) => ({
                      ...current,
                      label: event.target.value,
                      slug:
                        ingredientModalMode === "create" && !current.slug
                          ? slugifyMenuName(event.target.value)
                          : current.slug,
                    }))
                  }
                  value={ingredientForm.label}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Slug</label>
                <Input
                  onChange={(event) =>
                    setIngredientForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  value={ingredientForm.slug}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setIngredientForm((current) => ({
                      ...current,
                      categorySlug: event.target.value,
                    }))
                  }
                  value={ingredientForm.categorySlug}
                >
                  {sortedCategories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Sort order</label>
                <Input
                  min="0"
                  onChange={(event) =>
                    setIngredientForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  type="number"
                  value={ingredientForm.sortOrder}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={ingredientForm.isActive}
                  onChange={(event) =>
                    setIngredientForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Visible in menu editor</span>
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsIngredientModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !ingredientForm.label.trim() || !ingredientForm.categorySlug}
                onClick={() => void handleIngredientSubmit()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root onOpenChange={setIsCategoryModalOpen} open={isCategoryModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl", dashboardGlass)}>
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {categoryModalMode === "create" ? "Add Category" : "Edit Category"}
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Label</label>
                <Input
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      label: event.target.value,
                      slug:
                        categoryModalMode === "create" && !current.slug
                          ? slugifyMenuName(event.target.value)
                          : current.slug,
                    }))
                  }
                  value={categoryForm.label}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Slug</label>
                <Input
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  value={categoryForm.slug}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Sort order</label>
                <Input
                  min="0"
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  type="number"
                  value={categoryForm.sortOrder}
                />
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsCategoryModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !categoryForm.label.trim()}
                onClick={() => void handleCategorySubmit()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
