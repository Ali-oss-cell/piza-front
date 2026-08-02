"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Pencil, Plus, Trash2, Truck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type {
  CreateSupplierPayload,
  Supplier,
  UpdateSupplierPayload,
} from "@/types/inventory";

interface SuppliersPanelProps {
  token: string;
  brandSlug: string;
}

interface SupplierFormState {
  name: string;
  phone: string;
  email: string;
  abn: string;
  address: string;
  notes: string;
  isActive: boolean;
}

function emptyForm(): SupplierFormState {
  return {
    name: "",
    phone: "",
    email: "",
    abn: "",
    address: "",
    notes: "",
    isActive: true,
  };
}

function formFromSupplier(supplier: Supplier): SupplierFormState {
  return {
    name: supplier.name,
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    abn: supplier.abn ?? "",
    address: supplier.address ?? "",
    notes: supplier.notes ?? "",
    isActive: supplier.isActive,
  };
}

export function SuppliersPanel({
  token,
  brandSlug,
}: SuppliersPanelProps): React.ReactElement {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchSuppliers(token, brandSlug, {
        includeInactive: true,
      });
      setSuppliers(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load suppliers.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return suppliers
      .filter((supplier) => (showInactive ? true : supplier.isActive))
      .filter((supplier) => {
        if (!query) {
          return true;
        }
        return (
          supplier.name.toLowerCase().includes(query) ||
          (supplier.email?.toLowerCase().includes(query) ?? false) ||
          (supplier.phone?.toLowerCase().includes(query) ?? false) ||
          (supplier.abn?.toLowerCase().includes(query) ?? false)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, search, showInactive]);

  const openCreate = (): void => {
    setModalMode("create");
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (supplier: Supplier): void => {
    setModalMode("edit");
    setEditing(supplier);
    setForm(formFromSupplier(supplier));
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (modalMode === "create") {
        const payload: CreateSupplierPayload = {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          abn: form.abn.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          isActive: form.isActive,
        };
        const created = await createSupplier(token, payload, brandSlug);
        setSuppliers((current) => [...current, created]);
      } else if (editing) {
        const payload: UpdateSupplierPayload = {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          abn: form.abn.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          isActive: form.isActive,
        };
        const updated = await updateSupplier(
          token,
          editing.id,
          payload,
          brandSlug,
        );
        setSuppliers((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
      }
      setModalOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save supplier.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (supplier: Supplier): Promise<void> => {
    if (
      !window.confirm(
        `Deactivate "${supplier.name}"? You can re-enable them later.`,
      )
    ) {
      return;
    }
    setBusyId(supplier.id);
    setError(null);
    try {
      const updated = await deleteSupplier(token, supplier.id, brandSlug);
      setSuppliers((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
    } catch (deactivateError) {
      setError(
        deactivateError instanceof Error
          ? deactivateError.message
          : "Unable to deactivate supplier.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Suppliers
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Vendors for purchase orders — contact details and notes.
          </p>
        </div>
        <Button onClick={openCreate} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add supplier
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, phone…"
          value={search}
        />
        <label className={cn("flex items-center gap-2 text-sm", secondaryText)}>
          <input
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            type="checkbox"
          />
          Show inactive
        </label>
      </div>

      {error && !modalOpen ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-white/15",
              dashboardGlass,
            )}
          >
            <Truck className={cn("h-8 w-8", secondaryText)} />
            <p className={cn("text-sm", secondaryText)}>
              No suppliers yet. Add your flour mill, dairy, packaging vendor…
            </p>
          </div>
        ) : (
          filtered.map((supplier) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={supplier.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("font-medium", primaryText)}>
                    {supplier.name}
                  </p>
                  {!supplier.isActive ? (
                    <span className="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-0.5 text-xs", secondaryText)}>
                  {[supplier.phone, supplier.email, supplier.abn]
                    .filter(Boolean)
                    .join(" · ") || "No contact details"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => openEdit(supplier)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {supplier.isActive ? (
                  <Button
                    disabled={busyId === supplier.id}
                    onClick={() => void handleDeactivate(supplier)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog.Root onOpenChange={setModalOpen} open={modalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(96vw,28rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title
              className={cn("font-display text-xl font-bold", primaryText)}
            >
              {modalMode === "create" ? "Add supplier" : "Edit supplier"}
            </Dialog.Title>
            <div className="mt-5 space-y-3">
              <div>
                <label
                  className={cn("mb-1 block text-sm font-medium", primaryText)}
                >
                  Name
                </label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  value={form.name}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={cn("mb-1 block text-sm font-medium", primaryText)}
                  >
                    Phone
                  </label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    value={form.phone}
                  />
                </div>
                <div>
                  <label
                    className={cn("mb-1 block text-sm font-medium", primaryText)}
                  >
                    Email
                  </label>
                  <Input
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    type="email"
                    value={form.email}
                  />
                </div>
              </div>
              <div>
                <label
                  className={cn("mb-1 block text-sm font-medium", primaryText)}
                >
                  ABN
                </label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      abn: event.target.value,
                    }))
                  }
                  value={form.abn}
                />
              </div>
              <div>
                <label
                  className={cn("mb-1 block text-sm font-medium", primaryText)}
                >
                  Address
                </label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  value={form.address}
                />
              </div>
              <div>
                <label
                  className={cn("mb-1 block text-sm font-medium", primaryText)}
                >
                  Notes
                </label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  value={form.notes}
                />
              </div>
              <label
                className={cn("flex items-center gap-2 text-sm", secondaryText)}
              >
                <input
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Active
              </label>
              {error ? (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={() => setModalOpen(false)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSaving}
                  onClick={() => void handleSave()}
                  type="button"
                >
                  {isSaving ? (
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
