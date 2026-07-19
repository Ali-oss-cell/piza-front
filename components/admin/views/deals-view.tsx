"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDeal, deleteDeal, pushDealToStores, updateDeal } from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { CreateDealPayload, Deal, DealDiscountType, UpdateDealPayload } from "@/types/deals";
import { formatDealBadge } from "@/types/deals";
import { cn } from "@/lib/utils";

interface DealsViewProps {
  token: string;
  deals: Deal[];
  onDealsChange: (deals: Deal[]) => void;
  brands?: import("@/types/brand").Brand[];
  isPlatformAdmin?: boolean;
}

interface DealFormState {
  slug: string;
  title: string;
  description: string;
  badgeLabel: string;
  discountType: DealDiscountType;
  discountValue: string;
  promoCode: string;
  imageUrl: string;
  imageAlt: string;
  termsNote: string;
  ctaLabel: string;
  ctaHref: string;
  validFrom: string;
  validUntil: string;
  sortOrder: string;
  isActive: boolean;
  isFeatured: boolean;
}

function emptyForm(deals: Deal[]): DealFormState {
  return {
    slug: "",
    title: "",
    description: "",
    badgeLabel: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    promoCode: "",
    imageUrl: "",
    imageAlt: "",
    termsNote: "",
    ctaLabel: "Order Now",
    ctaHref: "/",
    validFrom: "",
    validUntil: "",
    sortOrder: String(deals.length),
    isActive: true,
    isFeatured: false,
  };
}

function formFromDeal(deal: Deal): DealFormState {
  return {
    slug: deal.slug,
    title: deal.title,
    description: deal.description,
    badgeLabel: deal.badgeLabel ?? "",
    discountType: deal.discountType,
    discountValue: String(deal.discountValue),
    promoCode: deal.promoCode ?? "",
    imageUrl: deal.imageUrl ?? "",
    imageAlt: deal.imageAlt ?? "",
    termsNote: deal.termsNote ?? "",
    ctaLabel: deal.ctaLabel,
    ctaHref: deal.ctaHref,
    validFrom: deal.validFrom ? deal.validFrom.slice(0, 16) : "",
    validUntil: deal.validUntil ? deal.validUntil.slice(0, 16) : "",
    sortOrder: String(deal.sortOrder),
    isActive: deal.isActive,
    isFeatured: deal.isFeatured,
  };
}

function buildPayload(form: DealFormState): CreateDealPayload {
  const payload: CreateDealPayload = {
    slug: form.slug.trim() || slugifyMenuName(form.title),
    title: form.title.trim(),
    description: form.description.trim(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    ctaLabel: form.ctaLabel.trim() || "Order Now",
    ctaHref: form.ctaHref.trim() || "/",
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
  };

  if (form.badgeLabel.trim()) {
    payload.badgeLabel = form.badgeLabel.trim();
  }
  if (form.promoCode.trim()) {
    payload.promoCode = form.promoCode.trim().toUpperCase();
  }
  if (form.imageUrl.trim()) {
    payload.imageUrl = form.imageUrl.trim();
  }
  if (form.imageAlt.trim()) {
    payload.imageAlt = form.imageAlt.trim();
  }
  if (form.termsNote.trim()) {
    payload.termsNote = form.termsNote.trim();
  }
  if (form.validFrom) {
    payload.validFrom = new Date(form.validFrom).toISOString();
  }
  if (form.validUntil) {
    payload.validUntil = new Date(form.validUntil).toISOString();
  }

  return payload;
}

export function DealsView({
  token,
  deals,
  onDealsChange,
  brands = [],
  isPlatformAdmin = false,
}: DealsViewProps): React.ReactElement {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState<DealFormState>(() => emptyForm(deals));
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushDealId, setPushDealId] = useState<string | null>(null);
  const [pushTargets, setPushTargets] = useState<string[]>([]);
  const [pushMessage, setPushMessage] = useState<string | null>(null);

  const sortedDeals = [...deals].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
  );

  const openCreateModal = (): void => {
    setModalMode("create");
    setEditingDeal(null);
    setForm(emptyForm(deals));
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (deal: Deal): void => {
    setModalMode("edit");
    setEditingDeal(deal);
    setForm(formFromDeal(deal));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload = buildPayload(form);

    try {
      if (modalMode === "create") {
        const created = await createDeal(token, payload);
        onDealsChange([...deals, created]);
      } else if (editingDeal) {
        const updated = await updateDeal(token, editingDeal.id, payload as UpdateDealPayload);
        onDealsChange(deals.map((entry) => (entry.id === editingDeal.id ? updated : entry)));
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save deal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (deal: Deal): Promise<void> => {
    setBusyId(deal.id);
    try {
      const updated = await updateDeal(token, deal.id, { isActive: !deal.isActive });
      onDealsChange(deals.map((entry) => (entry.id === deal.id ? updated : entry)));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFeatured = async (deal: Deal): Promise<void> => {
    setBusyId(deal.id);
    try {
      const updated = await updateDeal(token, deal.id, { isFeatured: !deal.isFeatured });
      onDealsChange(deals.map((entry) => (entry.id === deal.id ? updated : entry)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (deal: Deal): Promise<void> => {
    if (!window.confirm(`Delete "${deal.title}"?`)) {
      return;
    }

    setBusyId(deal.id);
    try {
      await deleteDeal(token, deal.id);
      onDealsChange(deals.filter((entry) => entry.id !== deal.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Deals & Promotions</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Create limited-time offers, promo codes, and featured specials for the storefront.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="space-y-3">
        {sortedDeals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No deals yet. Add your first promotion.</p>
          </div>
        ) : (
          sortedDeals.map((deal) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={deal.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", primaryText)}>{deal.title}</p>
                  <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                    {formatDealBadge(deal)}
                  </span>
                  {deal.isFeatured ? (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 line-clamp-1 text-xs", secondaryText)}>
                  {deal.slug}
                  {deal.promoCode ? ` · code ${deal.promoCode}` : ""}
                  {` · order ${deal.sortOrder}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    deal.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-500/15 text-zinc-500"
                  )}
                  disabled={busyId === deal.id}
                  onClick={() => void handleToggleActive(deal)}
                  type="button"
                >
                  {deal.isActive ? "Active" : "Hidden"}
                </button>
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    deal.isFeatured ? "bg-amber-500/15 text-amber-600" : "bg-zinc-500/15 text-zinc-500"
                  )}
                  disabled={busyId === deal.id}
                  onClick={() => void handleToggleFeatured(deal)}
                  type="button"
                >
                  {deal.isFeatured ? "Featured" : "Standard"}
                </button>
                <Button onClick={() => openEditModal(deal)} size="icon" variant="ghost">
                  <Pencil className="h-4 w-4" />
                </Button>
                {isPlatformAdmin && brands.length > 1 ? (
                  <Button
                    onClick={() => {
                      setPushDealId(deal.id);
                      setPushTargets([]);
                      setPushMessage(null);
                    }}
                    type="button"
                    variant="outline"
                  >
                    Push
                  </Button>
                ) : null}
                <Button
                  disabled={busyId === deal.id}
                  onClick={() => void handleDelete(deal)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {pushDealId ? (
        <div className={cn("space-y-3 rounded-2xl border p-4", dashboardGlass)}>
          <p className={cn("text-sm font-medium", primaryText)}>Push deal to other stores</p>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <label className="flex items-center gap-2 text-sm" key={brand.id}>
                <input
                  checked={pushTargets.includes(brand.slug)}
                  onChange={(event) => {
                    setPushTargets((current) =>
                      event.target.checked
                        ? [...current, brand.slug]
                        : current.filter((slug) => slug !== brand.slug),
                    );
                  }}
                  type="checkbox"
                />
                {brand.name}
              </label>
            ))}
          </div>
          {pushMessage ? <p className={cn("text-sm", secondaryText)}>{pushMessage}</p> : null}
          <div className="flex gap-2">
            <Button
              disabled={pushTargets.length === 0 || busyId === pushDealId}
              onClick={() => {
                void (async () => {
                  setBusyId(pushDealId);
                  try {
                    const result = await pushDealToStores(token, pushDealId, pushTargets);
                    setPushMessage(`Pushed to: ${result.pushed.join(", ") || "none"}`);
                  } catch (pushError) {
                    setPushMessage(
                      pushError instanceof Error ? pushError.message : "Push failed.",
                    );
                  } finally {
                    setBusyId(null);
                  }
                })();
              }}
              type="button"
            >
              Confirm push
            </Button>
            <Button onClick={() => setPushDealId(null)} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {modalMode === "create" ? "Add Deal" : "Edit Deal"}
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Title</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                      slug:
                        modalMode === "create" && !current.slug
                          ? slugifyMenuName(event.target.value)
                          : current.slug,
                    }))
                  }
                  value={form.title}
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
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  value={form.description}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Discount type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-900"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        discountType: event.target.value as DealDiscountType,
                      }))
                    }
                    value={form.discountType}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Discount value</label>
                  <Input
                    min="0"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, discountValue: event.target.value }))
                    }
                    step="0.01"
                    type="number"
                    value={form.discountValue}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Badge label</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, badgeLabel: event.target.value }))
                    }
                    placeholder="Optional override"
                    value={form.badgeLabel}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Promo code</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, promoCode: event.target.value }))
                    }
                    placeholder="PIZZA20"
                    value={form.promoCode}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>CTA label</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, ctaLabel: event.target.value }))
                    }
                    value={form.ctaLabel}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>CTA link</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, ctaHref: event.target.value }))
                    }
                    value={form.ctaHref}
                  />
                </div>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Image URL</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  placeholder="https://..."
                  value={form.imageUrl}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Image alt text</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                  value={form.imageAlt}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Terms note</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, termsNote: event.target.value }))
                  }
                  placeholder="Valid on delivery only, etc."
                  value={form.termsNote}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Valid from</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, validFrom: event.target.value }))
                    }
                    type="datetime-local"
                    value={form.validFrom}
                  />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Valid until</label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({ ...current, validUntil: event.target.value }))
                    }
                    type="datetime-local"
                    value={form.validUntil}
                  />
                </div>
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
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isActive: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  <span className={primaryText}>Active on storefront</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={form.isFeatured}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, isFeatured: event.target.checked }))
                    }
                    type="checkbox"
                  />
                  <span className={primaryText}>Featured deal</span>
                </label>
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !form.title.trim() || !form.description.trim()}
                onClick={() => void handleSubmit()}
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
