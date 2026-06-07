"use client";

import Image from "next/image";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { MenuItemModal } from "@/components/admin/menu-item-modal";
import { Button } from "@/components/ui/button";
import { createMenuItem, updateMenuItem } from "@/lib/admin-api";
import { formatMenuCategory, hasSizePricing } from "@/lib/menu-categories";
import { MenuItemBadges } from "@/components/features/menu-item-badges";
import { SIZE_OPTION_FIELDS, sizeOptionsFromApi, sizeOptionsFromLegacyPricing } from "@/lib/size-options";
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

interface MenuViewProps {
  items: AdminMenuItem[];
  token: string;
  toppingCatalog: ToppingCategoryGroup[];
  ingredientCatalog: IngredientCategoryGroup[];
  menuCategories: AdminMenuCategoryRecord[];
  onItemsChange: (items: AdminMenuItem[]) => void;
}

function formatMoney(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
}

export function MenuView({
  items,
  token,
  toppingCatalog,
  ingredientCatalog,
  menuCategories,
  onItemsChange,
}: MenuViewProps): React.ReactElement {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const openCreateModal = (): void => {
    setModalMode("create");
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminMenuItem): void => {
    setModalMode("edit");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (item: AdminMenuItem): Promise<void> => {
    setSavingId(item.id);

    try {
      const updated = await updateMenuItem(token, item.id, { isActive: !item.isActive });
      onItemsChange(items.map((entry) => (entry.id === item.id ? updated : entry)));
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async (payload: CreateMenuItemPayload): Promise<void> => {
    const created = await createMenuItem(token, payload);
    onItemsChange([created, ...items]);
  };

  const handleUpdate = async (id: string, payload: UpdateMenuItemPayload): Promise<void> => {
    const updated = await updateMenuItem(token, id, payload);
    onItemsChange(items.map((entry) => (entry.id === id ? updated : entry)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Menu Management</h2>
          <p className={cn("text-sm", secondaryText)}>
            Control ingredients, sizes, extra toppings, badges, and pricing.
          </p>
        </div>
        <Button className="rounded-xl" onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className={cn("p-8 text-center", dashboardGlass)}>
            <p className={cn("font-medium", primaryText)}>No menu items in the database yet</p>
            <p className={cn("mt-2 text-sm", secondaryText)}>
              Use &quot;Add Menu Item&quot; to publish your first item.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const sizeOptions = item.sizeOptions
              ? sizeOptionsFromApi(item.sizeOptions)
              : hasSizePricing(item.categorySlug, menuCategories)
                ? sizeOptionsFromLegacyPricing(item.sizePricing)
                : null;

            return (
              <article className={cn("p-5", dashboardGlass)} key={item.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image alt={item.imageAlt} className="object-cover" fill src={item.imageUrl} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className={cn("font-semibold", primaryText)}>{item.name}</h3>
                      <span className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                        {formatMenuCategory(item.categorySlug, menuCategories)}
                      </span>
                      {item.badges?.length ? <MenuItemBadges badges={item.badges} /> : null}
                      {!item.isActive ? (
                        <span className="rounded-full bg-zinc-500/15 px-2 py-1 text-xs font-semibold text-zinc-500">
                          Archived
                        </span>
                      ) : null}
                    </div>
                    <p className={cn("mt-1 text-sm", secondaryText)}>{item.description}</p>
                    {item.ingredients?.length ? (
                      <p className={cn("mt-2 text-xs", secondaryText)}>
                        {item.ingredients.length} ingredients configured
                      </p>
                    ) : null}
                    {item.priceNote ? (
                      <p className={cn("mt-2 text-sm italic", secondaryText)}>{item.priceNote}</p>
                    ) : null}
                    <div className={cn("mt-3 flex flex-wrap gap-4 text-sm", secondaryText)}>
                      <span>Base: {formatMoney(item.price)}</span>
                      {sizeOptions
                        ? SIZE_OPTION_FIELDS.map((field) => {
                            const option = sizeOptions[field.key];
                            return (
                              <span key={field.key}>
                                {field.label.split(" ")[1]?.replace(/[()]/g, "") ?? field.key}:{" "}
                                {option.enabled
                                  ? formatMoney(option.price)
                                  : "off"}
                              </span>
                            );
                          })
                        : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button onClick={() => openEditModal(item)} size="default" variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>

                    <button
                      aria-label={item.isActive ? "Archive item" : "Restore item"}
                      aria-pressed={item.isActive}
                      className={cn(
                        "relative h-8 w-14 rounded-full transition-colors duration-300",
                        item.isActive ? "bg-[#d81b60]" : "bg-zinc-300 dark:bg-zinc-700"
                      )}
                      disabled={savingId === item.id}
                      onClick={() => void handleToggleActive(item)}
                      type="button"
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-6 w-6 rounded-full bg-white transition-transform duration-300",
                          item.isActive ? "left-7" : "left-1"
                        )}
                      />
                      {savingId === item.id ? (
                        <Loader2 className="absolute -right-6 top-1 h-4 w-4 animate-spin text-[#d81b60]" />
                      ) : null}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <MenuItemModal
        item={editingItem}
        mode={modalMode}
        menuCategories={menuCategories}
        onCreate={handleCreate}
        onOpenChange={setIsModalOpen}
        onUpdate={handleUpdate}
        open={isModalOpen}
        toppingCatalog={toppingCatalog}
        ingredientCatalog={ingredientCatalog}
      />
    </div>
  );
}
