"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCrustOption, deleteCrustOption, updateCrustOption } from "@/lib/admin-api";
import { slugifyMenuName } from "@/lib/menu-categories";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminCrustOption, CreateCrustOptionPayload, UpdateCrustOptionPayload } from "@/types/store";
import { cn } from "@/lib/utils";

interface CrustsViewProps {
  token: string;
  crusts: AdminCrustOption[];
  onCrustsChange: (crusts: AdminCrustOption[]) => void;
}

interface CrustFormState {
  label: string;
  slug: string;
  priceDelta: string;
  sortOrder: string;
  isActive: boolean;
}

function emptyForm(crusts: AdminCrustOption[]): CrustFormState {
  return {
    label: "",
    slug: "",
    priceDelta: "0",
    sortOrder: String(crusts.length),
    isActive: true,
  };
}

function formFromCrust(crust: AdminCrustOption): CrustFormState {
  return {
    label: crust.label,
    slug: crust.slug,
    priceDelta: String(crust.priceDelta),
    sortOrder: String(crust.sortOrder),
    isActive: crust.isActive,
  };
}

export function CrustsView({ token, crusts, onCrustsChange }: CrustsViewProps): React.ReactElement {
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrust, setEditingCrust] = useState<AdminCrustOption | null>(null);
  const [form, setForm] = useState<CrustFormState>(() => emptyForm(crusts));
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedCrusts = [...crusts].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
  );

  const openCreateModal = (): void => {
    setModalMode("create");
    setEditingCrust(null);
    setForm(emptyForm(crusts));
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (crust: AdminCrustOption): void => {
    setModalMode("edit");
    setEditingCrust(crust);
    setForm(formFromCrust(crust));
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    const payload: CreateCrustOptionPayload | UpdateCrustOptionPayload = {
      slug: form.slug.trim() || slugifyMenuName(form.label),
      label: form.label.trim(),
      priceDelta: Number(form.priceDelta),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      if (modalMode === "create") {
        const created = await createCrustOption(token, payload as CreateCrustOptionPayload);
        onCrustsChange([...crusts, created]);
      } else if (editingCrust) {
        const updated = await updateCrustOption(token, editingCrust.id, payload);
        onCrustsChange(crusts.map((entry) => (entry.id === editingCrust.id ? updated : entry)));
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save crust.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (crust: AdminCrustOption): Promise<void> => {
    setBusyId(crust.id);
    try {
      const updated = await updateCrustOption(token, crust.id, { isActive: !crust.isActive });
      onCrustsChange(crusts.map((entry) => (entry.id === crust.id ? updated : entry)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (crust: AdminCrustOption): Promise<void> => {
    if (!window.confirm(`Delete "${crust.label}"?`)) {
      return;
    }

    setBusyId(crust.id);
    try {
      await deleteCrustOption(token, crust.id);
      onCrustsChange(crusts.filter((entry) => entry.id !== crust.id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Crust Management</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Manage bake styles and price adjustments for pizza customization.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Crust
        </Button>
      </div>

      <div className="space-y-3">
        {sortedCrusts.map((crust) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
            key={crust.id}
          >
            <div>
              <p className={cn("font-medium", primaryText)}>{crust.label}</p>
              <p className={cn("text-xs", secondaryText)}>
                {crust.slug} · +${Number(crust.priceDelta).toFixed(2)} · order {crust.sortOrder}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  crust.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-zinc-500/15 text-zinc-500"
                )}
                disabled={busyId === crust.id}
                onClick={() => void handleToggleActive(crust)}
                type="button"
              >
                {crust.isActive ? "Active" : "Hidden"}
              </button>
              <Button onClick={() => openEditModal(crust)} size="icon" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                disabled={busyId === crust.id}
                onClick={() => void handleDelete(crust)}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root onOpenChange={setIsModalOpen} open={isModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className={cn("fixed left-1/2 top-1/2 z-50 w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl", dashboardGlass)}>
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              {modalMode === "create" ? "Add Crust" : "Edit Crust"}
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Label</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      label: event.target.value,
                      slug: modalMode === "create" && !current.slug ? slugifyMenuName(event.target.value) : current.slug,
                    }))
                  }
                  value={form.label}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Slug</label>
                <Input onChange={(event) => setForm((c) => ({ ...c, slug: event.target.value }))} value={form.slug} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Price (+)</label>
                  <Input min="0" onChange={(event) => setForm((c) => ({ ...c, priceDelta: event.target.value }))} step="0.01" type="number" value={form.priceDelta} />
                </div>
                <div>
                  <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Sort order</label>
                  <Input min="0" onChange={(event) => setForm((c) => ({ ...c, sortOrder: event.target.value }))} type="number" value={form.sortOrder} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input checked={form.isActive} onChange={(event) => setForm((c) => ({ ...c, isActive: event.target.checked }))} type="checkbox" />
                <span className={primaryText}>Visible to customers</span>
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">Cancel</Button>
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
