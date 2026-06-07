"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createExtraTopping,
  deleteExtraTopping,
  updateExtraTopping,
} from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type {
  AdminExtraTopping,
  AdminToppingCategory,
  CreateExtraToppingPayload,
  ToppingCategoryGroup,
  UpdateExtraToppingPayload,
} from "@/types/admin";
import { cn } from "@/lib/utils";

interface ToppingsViewProps {
  token: string;
  toppingCatalog: ToppingCategoryGroup[];
  categories: AdminToppingCategory[];
  onCatalogChange: (catalog: ToppingCategoryGroup[]) => void;
}

interface ToppingFormState {
  label: string;
  slug: string;
  categorySlug: string;
  priceDelta: string;
  sortOrder: string;
  isActive: boolean;
}

function emptyForm(categories: AdminToppingCategory[]): ToppingFormState {
  return {
    label: "",
    slug: "",
    categorySlug: categories[0]?.slug ?? "",
    priceDelta: "2.50",
    sortOrder: "0",
    isActive: true,
  };
}

function formFromTopping(topping: AdminExtraTopping): ToppingFormState {
  return {
    label: topping.label,
    slug: topping.slug,
    categorySlug: topping.categorySlug,
    priceDelta: String(topping.priceDelta),
    sortOrder: String(topping.sortOrder),
    isActive: topping.isActive,
  };
}

function formatMoney(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
}

function regroupCatalog(
  catalog: ToppingCategoryGroup[],
  topping: AdminExtraTopping,
  mode: "create" | "update" | "delete"
): ToppingCategoryGroup[] {
  const flat = catalog.flatMap((group) => group.toppings);

  const nextFlat =
    mode === "delete"
      ? flat.filter((entry) => entry.id !== topping.id)
      : mode === "create"
        ? [...flat, topping]
        : flat.map((entry) => (entry.id === topping.id ? topping : entry));

  const groups = new Map<string, ToppingCategoryGroup>();

  for (const entry of nextFlat) {
    const existing = groups.get(entry.categorySlug);

    if (existing) {
      existing.toppings.push(entry);
      continue;
    }

    groups.set(entry.categorySlug, {
      id: entry.categorySlug,
      label: entry.categoryLabel,
      toppings: [entry],
    });
  }

  return [...groups.values()].map((group) => ({
    ...group,
    toppings: [...group.toppings].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
  }));
}

export function ToppingsView({
  token,
  toppingCatalog,
  categories,
  onCatalogChange,
}: ToppingsViewProps): React.ReactElement {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<AdminExtraTopping | null>(null);
  const [form, setForm] = useState<ToppingFormState>(() => emptyForm(categories));
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedCatalog = useMemo(
    () =>
      [...toppingCatalog].map((group) => ({
        ...group,
        toppings: [...group.toppings].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
        ),
      })),
    [toppingCatalog]
  );

  const openCreateModal = (): void => {
    setModalMode("create");
    setEditingTopping(null);
    setForm(emptyForm(categories));
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (topping: AdminExtraTopping): void => {
    setModalMode("edit");
    setEditingTopping(topping);
    setForm(formFromTopping(topping));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload: CreateExtraToppingPayload | UpdateExtraToppingPayload = {
      slug: form.slug.trim() || slugifyMenuName(form.label),
      label: form.label.trim(),
      categorySlug: form.categorySlug,
      priceDelta: Number(form.priceDelta),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      if (modalMode === "create") {
        const created = await createExtraTopping(token, payload as CreateExtraToppingPayload);
        onCatalogChange(regroupCatalog(toppingCatalog, created, "create"));
      } else if (editingTopping) {
        const updated = await updateExtraTopping(token, editingTopping.id, payload);
        onCatalogChange(regroupCatalog(toppingCatalog, updated, "update"));
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save topping.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (topping: AdminExtraTopping): Promise<void> => {
    setBusyId(topping.id);

    try {
      const updated = await updateExtraTopping(token, topping.id, { isActive: !topping.isActive });
      onCatalogChange(regroupCatalog(toppingCatalog, updated, "update"));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (topping: AdminExtraTopping): Promise<void> => {
    if (!window.confirm(`Delete "${topping.label}"? This cannot be undone.`)) {
      return;
    }

    setBusyId(topping.id);

    try {
      await deleteExtraTopping(token, topping.id);
      onCatalogChange(regroupCatalog(toppingCatalog, topping, "delete"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Toppings Management</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Manage extra toppings customers can add to pizzas.
          </p>
        </div>
        <Button disabled={categories.length === 0} onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Topping
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className={cn("rounded-2xl border border-dashed p-8 text-center", dashboardGlass)}>
          <p className={cn("text-sm", secondaryText)}>
            Create a topping category first, then add toppings here.
          </p>
        </div>
      ) : null}

      {sortedCatalog.length === 0 && categories.length > 0 ? (
        <div className={cn("rounded-2xl border border-dashed p-8 text-center", dashboardGlass)}>
          <p className={cn("text-sm", secondaryText)}>No toppings yet. Add your first topping.</p>
        </div>
      ) : null}

      <div className="space-y-6">
        {sortedCatalog.map((group) => (
          <section className={cn("rounded-2xl border p-5", dashboardGlass)} key={group.id}>
            <h3 className={cn("mb-4 font-display text-lg font-semibold", primaryText)}>{group.label}</h3>
            <div className="space-y-3">
              {group.toppings.map((topping) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
                  key={topping.id}
                >
                  <div>
                    <p className={cn("font-medium", primaryText)}>{topping.label}</p>
                    <p className={cn("text-xs", secondaryText)}>
                      {topping.slug} · +{formatMoney(topping.priceDelta)} · order {topping.sortOrder}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        topping.isActive
                          ? "bg-emerald-500/15 text-emerald-600"
                          : "bg-zinc-500/15 text-zinc-500"
                      )}
                      disabled={busyId === topping.id}
                      onClick={() => void handleToggleActive(topping)}
                      type="button"
                    >
                      {busyId === topping.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : topping.isActive ? (
                        "Active"
                      ) : (
                        "Hidden"
                      )}
                    </button>
                    <Button onClick={() => openEditModal(topping)} size="icon" variant="ghost">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={busyId === topping.id}
                      onClick={() => void handleDelete(topping)}
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
        ))}
      </div>

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {modalMode === "create" ? "Add Topping" : "Edit Topping"}
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
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Category</label>
                <select
                  className="w-full rounded-xl border border-zinc-200/60 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900/50"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, categorySlug: event.target.value }))
                  }
                  value={form.categorySlug}
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Price (+)</label>
                  <Input
                    min="0"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, priceDelta: event.target.value }))
                    }
                    step="0.01"
                    type="number"
                    value={form.priceDelta}
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
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Visible to customers</span>
              </label>
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
