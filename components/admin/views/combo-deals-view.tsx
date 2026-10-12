"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createComboDeal,
  deleteComboDeal,
  updateComboDeal,
} from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminMenuCategoryRecord, AdminMenuItem } from "@/types/admin";
import type {
  ComboDeal,
  ComboDealSlotPayload,
  ComboSlotSourceType,
  CreateComboDealPayload,
} from "@/types/combo-deals";
import { cn } from "@/lib/utils";

interface ComboDealsViewProps {
  token: string;
  comboDeals: ComboDeal[];
  menuItems: AdminMenuItem[];
  menuCategories: AdminMenuCategoryRecord[];
  onComboDealsChange: (deals: ComboDeal[]) => void;
}

interface SlotForm {
  key: string;
  label: string;
  quantity: string;
  sourceType: ComboSlotSourceType;
  categorySlug: string;
  menuItemId: string;
  allowedSizes: string[];
  allowModifiers: boolean;
}

interface ComboFormState {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  bundlePrice: string;
  sortOrder: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  slots: SlotForm[];
}

const SIZE_OPTIONS = ["small", "large", "family"] as const;

function newSlotKey(): string {
  return `slot-${Math.random().toString(36).slice(2, 9)}`;
}

function emptySlot(): SlotForm {
  return {
    key: newSlotKey(),
    label: "",
    quantity: "1",
    sourceType: "CATEGORY",
    categorySlug: "basic-pizzas",
    menuItemId: "",
    allowedSizes: ["small"],
    allowModifiers: true,
  };
}

function emptyForm(deals: ComboDeal[]): ComboFormState {
  return {
    slug: "",
    name: "",
    description: "",
    imageUrl: "",
    imageAlt: "",
    bundlePrice: "16.90",
    sortOrder: String(deals.length),
    isActive: true,
    validFrom: "",
    validUntil: "",
    slots: [emptySlot()],
  };
}

function formFromDeal(deal: ComboDeal): ComboFormState {
  return {
    slug: deal.slug,
    name: deal.name,
    description: deal.description,
    imageUrl: deal.imageUrl ?? "",
    imageAlt: deal.imageAlt ?? "",
    bundlePrice: String(deal.bundlePrice),
    sortOrder: String(deal.sortOrder),
    isActive: deal.isActive,
    validFrom: deal.validFrom ? deal.validFrom.slice(0, 16) : "",
    validUntil: deal.validUntil ? deal.validUntil.slice(0, 16) : "",
    slots: deal.slots.map((slot) => ({
      key: slot.id,
      label: slot.label,
      quantity: String(slot.quantity),
      sourceType: slot.sourceType,
      categorySlug: slot.categorySlug ?? "",
      menuItemId: slot.menuItemId ?? "",
      allowedSizes: Array.isArray(slot.allowedSizes)
        ? slot.allowedSizes.map(String)
        : [],
      allowModifiers: slot.allowModifiers,
    })),
  };
}

function buildPayload(form: ComboFormState): CreateComboDealPayload {
  const slots: ComboDealSlotPayload[] = form.slots.map((slot, index) => ({
    label: slot.label.trim() || `Slot ${index + 1}`,
    sortOrder: index,
    quantity: Math.max(1, Number(slot.quantity) || 1),
    sourceType: slot.sourceType,
    categorySlug:
      slot.sourceType === "CATEGORY" ? slot.categorySlug.trim() : undefined,
    menuItemId: slot.sourceType === "ITEM" ? slot.menuItemId : undefined,
    allowedSizes: slot.allowedSizes.length ? slot.allowedSizes : undefined,
    allowModifiers: slot.allowModifiers,
  }));

  return {
    slug: form.slug.trim() || slugifyMenuName(form.name),
    name: form.name.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    imageAlt: form.imageAlt.trim() || undefined,
    bundlePrice: Number(form.bundlePrice),
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
    validFrom: form.validFrom || undefined,
    validUntil: form.validUntil || undefined,
    slots,
  };
}

function formatMoney(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(value);
}

function slotSummary(slot: ComboDeal["slots"][number]): string {
  const qty = slot.quantity > 1 ? `${slot.quantity}× ` : "";
  if (slot.sourceType === "ITEM") {
    return `${qty}${slot.menuItem?.name ?? "fixed item"}`;
  }
  const sizes = Array.isArray(slot.allowedSizes) && slot.allowedSizes.length
    ? ` (${slot.allowedSizes.join("/")})`
    : "";
  return `${qty}${slot.categorySlug}${sizes}`;
}

export function ComboDealsView({
  token,
  comboDeals,
  menuItems,
  menuCategories,
  onComboDealsChange,
}: ComboDealsViewProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ComboDeal | null>(null);
  const [form, setForm] = useState<ComboFormState>(() => emptyForm(comboDeals));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...comboDeals].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
  const activeItems = menuItems.filter((item) => item.isActive);

  function openCreate(): void {
    setEditing(null);
    setForm(emptyForm(comboDeals));
    setError(null);
    setOpen(true);
  }

  function openEdit(deal: ComboDeal): void {
    setEditing(deal);
    setForm(formFromDeal(deal));
    setError(null);
    setOpen(true);
  }

  async function handleSave(): Promise<void> {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!Number.isFinite(Number(form.bundlePrice))) {
      setError("Bundle price must be a number.");
      return;
    }
    if (form.slots.length === 0) {
      setError("Add at least one slot.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(form);
      if (editing) {
        const updated = await updateComboDeal(token, editing.id, payload);
        onComboDealsChange(
          comboDeals.map((d) => (d.id === editing.id ? updated : d)),
        );
      } else {
        const created = await createComboDeal(token, payload);
        onComboDealsChange([...comboDeals, created]);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save combo deal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(deal: ComboDeal): Promise<void> {
    if (!window.confirm(`Delete combo "${deal.name}"?`)) return;
    try {
      await deleteComboDeal(token, deal.id);
      onComboDealsChange(comboDeals.filter((d) => d.id !== deal.id));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function toggleActive(deal: ComboDeal): Promise<void> {
    try {
      const updated = await updateComboDeal(token, deal.id, {
        isActive: !deal.isActive,
      });
      onComboDealsChange(
        comboDeals.map((d) => (d.id === deal.id ? updated : d)),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Update failed.");
    }
  }

  function updateSlot(key: string, patch: Partial<SlotForm>): void {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) =>
        slot.key === key ? { ...slot, ...patch } : slot,
      ),
    }));
  }

  function toggleSize(key: string, size: string): void {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.map((slot) => {
        if (slot.key !== key) return slot;
        const has = slot.allowedSizes.includes(size);
        return {
          ...slot,
          allowedSizes: has
            ? slot.allowedSizes.filter((s) => s !== size)
            : [...slot.allowedSizes, size],
        };
      }),
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Combo deals
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Fixed-price bundles with pick-your-item slots for POS and the website.
            Promo codes stay under Promo codes.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add combo
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>
              No combo deals yet. Create Single Deal, Double Deal, and other specials
              here.
            </p>
          </div>
        ) : (
          sorted.map((deal) => (
            <div
              className={cn(
                "flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3",
                dashboardGlass,
              )}
              key={deal.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-semibold", primaryText)}>{deal.name}</p>
                  <span className="text-sm font-medium text-[#d81b60]">
                    {formatMoney(deal.bundlePrice)}
                  </span>
                  {!deal.isActive ? (
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {deal.slots.map(slotSummary).join(" · ") || "No slots"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void toggleActive(deal)}
                  variant="outline"
                >
                  {deal.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button onClick={() => openEdit(deal)} size="icon" variant="outline">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  onClick={() => void handleDelete(deal)}
                  size="icon"
                  variant="outline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog.Root onOpenChange={setOpen} open={open}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(640px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {editing ? "Edit combo deal" : "New combo deal"}
            </Dialog.Title>
            <Dialog.Description className={cn("mt-1 text-sm", secondaryText)}>
              Set the bundle price, then add slots customers pick from.
            </Dialog.Description>

            <div className="mt-4 space-y-3">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Name
                </label>
                <Input
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug || slugifyMenuName(e.target.value),
                    }))
                  }
                  value={form.name}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Slug
                  </label>
                  <Input
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    value={form.slug}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Bundle price (AUD)
                  </label>
                  <Input
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bundlePrice: e.target.value }))
                    }
                    type="number"
                    step="0.01"
                    value={form.bundlePrice}
                  />
                </div>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Description
                </label>
                <textarea
                  className="min-h-[72px] w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-600"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  value={form.description}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Image URL
                  </label>
                  <Input
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    value={form.imageUrl}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                    Sort order
                  </label>
                  <Input
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sortOrder: e.target.value }))
                    }
                    type="number"
                    value={form.sortOrder}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  type="checkbox"
                />
                Active
              </label>

              <div className="border-t border-zinc-200 pt-3 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between">
                  <p className={cn("font-medium", primaryText)}>Slots</p>
                  <Button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        slots: [...f.slots, emptySlot()],
                      }))
                    }
                    type="button"
                    variant="outline"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Slot
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.slots.map((slot, index) => (
                    <div
                      className="rounded-lg border border-zinc-200/70 p-3 dark:border-white/10"
                      key={slot.key}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={cn("text-xs font-medium", secondaryText)}>
                          Slot {index + 1}
                        </span>
                        {form.slots.length > 1 ? (
                          <button
                            className="text-xs text-red-600"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                slots: f.slots.filter((s) => s.key !== slot.key),
                              }))
                            }
                            type="button"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          onChange={(e) =>
                            updateSlot(slot.key, { label: e.target.value })
                          }
                          placeholder="Label e.g. Small Basic Pizza"
                          value={slot.label}
                        />
                        <Input
                          min={1}
                          onChange={(e) =>
                            updateSlot(slot.key, { quantity: e.target.value })
                          }
                          placeholder="Qty"
                          type="number"
                          value={slot.quantity}
                        />
                        <select
                          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-600"
                          onChange={(e) =>
                            updateSlot(slot.key, {
                              sourceType: e.target.value as ComboSlotSourceType,
                            })
                          }
                          value={slot.sourceType}
                        >
                          <option value="CATEGORY">From category</option>
                          <option value="ITEM">Specific item</option>
                        </select>
                        {slot.sourceType === "CATEGORY" ? (
                          <select
                            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-600"
                            onChange={(e) =>
                              updateSlot(slot.key, {
                                categorySlug: e.target.value,
                              })
                            }
                            value={slot.categorySlug}
                          >
                            {menuCategories.map((cat) => (
                              <option key={cat.id} value={cat.slug}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-600"
                            onChange={(e) =>
                              updateSlot(slot.key, {
                                menuItemId: e.target.value,
                              })
                            }
                            value={slot.menuItemId}
                          >
                            <option value="">Select item…</option>
                            {activeItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.categorySlug})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className={cn("text-xs", secondaryText)}>Sizes:</span>
                        {SIZE_OPTIONS.map((size) => (
                          <label
                            className="flex items-center gap-1 text-xs"
                            key={size}
                          >
                            <input
                              checked={slot.allowedSizes.includes(size)}
                              onChange={() => toggleSize(slot.key, size)}
                              type="checkbox"
                            />
                            {size}
                          </label>
                        ))}
                        <label className="ml-auto flex items-center gap-1 text-xs">
                          <input
                            checked={slot.allowModifiers}
                            onChange={(e) =>
                              updateSlot(slot.key, {
                                allowModifiers: e.target.checked,
                              })
                            }
                            type="checkbox"
                          />
                          Allow modifiers
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setOpen(false)} type="button" variant="outline">
                  Cancel
                </Button>
                <Button disabled={saving} onClick={() => void handleSave()}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
