"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createToppingCategory,
  deleteToppingCategory,
  updateToppingCategory,
} from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type {
  AdminToppingCategory,
  CreateToppingCategoryPayload,
  ToppingCategoryGroup,
  UpdateToppingCategoryPayload,
} from "@/types/admin";
import { cn } from "@/lib/utils";

interface CategoriesViewProps {
  token: string;
  categories: AdminToppingCategory[];
  toppingCatalog: ToppingCategoryGroup[];
  onCategoriesChange: (categories: AdminToppingCategory[]) => void;
  onCatalogRefresh: () => void;
}

interface CategoryFormState {
  label: string;
  slug: string;
  sortOrder: string;
}

function emptyForm(categories: AdminToppingCategory[]): CategoryFormState {
  return {
    label: "",
    slug: "",
    sortOrder: String(categories.length),
  };
}

function formFromCategory(category: AdminToppingCategory): CategoryFormState {
  return {
    label: category.label,
    slug: category.slug,
    sortOrder: String(category.sortOrder),
  };
}

export function CategoriesView({
  token,
  categories,
  toppingCatalog,
  onCategoriesChange,
  onCatalogRefresh,
}: CategoriesViewProps): React.ReactElement {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminToppingCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(() => emptyForm(categories));
  const [isSaving, setIsSaving] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toppingCountBySlug = new Map(
    toppingCatalog.map((group) => [group.id, group.toppings.length])
  );

  const sortedCategories = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
  );

  const openCreateModal = (): void => {
    setModalMode("create");
    setEditingCategory(null);
    setForm(emptyForm(categories));
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: AdminToppingCategory): void => {
    setModalMode("edit");
    setEditingCategory(category);
    setForm(formFromCategory(category));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload: CreateToppingCategoryPayload | UpdateToppingCategoryPayload = {
      slug: form.slug.trim() || slugifyMenuName(form.label),
      label: form.label.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (modalMode === "create") {
        const created = await createToppingCategory(token, payload as CreateToppingCategoryPayload);
        onCategoriesChange([...categories, created]);
      } else if (editingCategory) {
        const updated = await updateToppingCategory(token, editingCategory.slug, payload);
        onCategoriesChange(
          categories.map((entry) => (entry.slug === editingCategory.slug ? updated : entry))
        );
        onCatalogRefresh();
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: AdminToppingCategory): Promise<void> => {
    const count = toppingCountBySlug.get(category.slug) ?? 0;

    if (count > 0) {
      window.alert(`Move or delete ${count} topping(s) before removing this category.`);
      return;
    }

    if (!window.confirm(`Delete category "${category.label}"?`)) {
      return;
    }

    setBusySlug(category.slug);

    try {
      await deleteToppingCategory(token, category.slug);
      onCategoriesChange(categories.filter((entry) => entry.slug !== category.slug));
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : "Unable to delete category.");
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Topping Categories</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Group extra toppings into sections like Meats, Cheeses, and Veggies.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className={cn("rounded-2xl border border-dashed p-8 text-center", dashboardGlass)}>
          <p className={cn("text-sm", secondaryText)}>No categories yet. Add your first category.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedCategories.map((category) => {
            const toppingCount = toppingCountBySlug.get(category.slug) ?? 0;

            return (
              <div className={cn("rounded-2xl border p-5", dashboardGlass)} key={category.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className={cn("font-display text-lg font-semibold", primaryText)}>
                      {category.label}
                    </h3>
                    <p className={cn("text-xs", secondaryText)}>
                      {category.slug} · order {category.sortOrder}
                    </p>
                    <p className={cn("mt-2 text-sm", secondaryText)}>
                      {toppingCount} topping{toppingCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => openEditModal(category)} size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={busySlug === category.slug}
                      onClick={() => void handleDelete(category)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {modalMode === "create" ? "Add Category" : "Edit Category"}
            </Dialog.Title>

            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Label</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      label: event.target.value,
                      slug:
                        modalMode === "create" && !current.slug
                          ? slugifyMenuName(event.target.value)
                          : current.slug,
                    }))
                  }
                  value={form.label}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Slug</label>
                <Input
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  value={form.slug}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Sort order</label>
                <Input
                  min="0"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  type="number"
                  value={form.sortOrder}
                />
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button disabled={isSaving || !form.label.trim()} onClick={() => void handleSubmit()}>
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
