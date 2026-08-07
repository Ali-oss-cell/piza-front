"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
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
  const [formMode, setFormMode] = useState<"create" | "edit" | null>("create");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const startCreate = (): void => {
    setFormMode("create");
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setSuccess(null);
  };

  const startEdit = (supplier: Supplier): void => {
    setFormMode("edit");
    setEditing(supplier);
    setForm(formFromSupplier(supplier));
    setError(null);
    setSuccess(null);
  };

  const cancelForm = (): void => {
    setFormMode(null);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (formMode === "create") {
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
        setForm(emptyForm());
        setSuccess(`Added "${created.name}".`);
      } else if (formMode === "edit" && editing) {
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
        setSuccess(`Updated "${updated.name}".`);
        cancelForm();
      }
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
      if (editing?.id === supplier.id) {
        cancelForm();
      }
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Suppliers
          </h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Vendors for purchase orders — edit inline on this page, no popups.
          </p>
        </div>
        {formMode !== "create" ? (
          <Button onClick={startCreate} type="button">
            <Plus className="mr-2 h-4 w-4" />
            Add supplier
          </Button>
        ) : null}
      </div>

      {formMode ? (
        <section className="space-y-3 rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between gap-3">
            <h3 className={cn("text-sm font-semibold", primaryText)}>
              {formMode === "create" ? "Add supplier" : `Edit ${editing?.name}`}
            </h3>
            {formMode === "edit" ? (
              <Button onClick={cancelForm} type="button" variant="ghost">
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            ) : null}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
                  <th className="px-2 py-2 font-semibold">Name</th>
                  <th className="px-2 py-2 font-semibold">Phone</th>
                  <th className="px-2 py-2 font-semibold">
                    Email
                    <span className="mt-0.5 block normal-case tracking-normal font-normal opacity-70">
                      Optional — needed to email POs
                    </span>
                  </th>
                  <th className="px-2 py-2 font-semibold">ABN</th>
                  <th className="px-2 py-2 font-semibold">Address</th>
                  <th className="px-2 py-2 font-semibold">Notes</th>
                  <th className="px-2 py-2 font-semibold">Active</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 min-w-[9rem]"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Supplier name"
                      value={form.name}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 min-w-[8rem]"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      value={form.phone}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 min-w-[10rem]"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="orders@supplier.com"
                      type="email"
                      value={form.email}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 w-28"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          abn: event.target.value,
                        }))
                      }
                      value={form.abn}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 min-w-[10rem]"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      value={form.address}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-10 min-w-[8rem]"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      value={form.notes}
                    />
                  </td>
                  <td className="px-2 py-2">
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
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button
              disabled={isSaving || !form.name.trim()}
              onClick={() => void handleSave()}
              type="button"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {formMode === "create" ? "Save supplier" : "Save changes"}
            </Button>
          </div>
        </section>
      ) : null}

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

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200/60 dark:border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200/60 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/50">
            <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">ABN</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  className={cn("px-4 py-10 text-center", secondaryText)}
                  colSpan={6}
                >
                  No suppliers yet — use the form above to add one.
                </td>
              </tr>
            ) : (
              filtered.map((supplier) => (
                <tr
                  className="border-b border-zinc-100 dark:border-white/5"
                  key={supplier.id}
                >
                  <td className={cn("px-4 py-3 font-medium", primaryText)}>
                    {supplier.name}
                    {!supplier.isActive ? (
                      <span className="ml-2 rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                        Inactive
                      </span>
                    ) : null}
                  </td>
                  <td className={cn("px-4 py-3", secondaryText)}>
                    {supplier.phone ?? "—"}
                  </td>
                  <td className={cn("px-4 py-3", secondaryText)}>
                    {supplier.email ?? "—"}
                  </td>
                  <td className={cn("px-4 py-3", secondaryText)}>
                    {supplier.abn ?? "—"}
                  </td>
                  <td
                    className={cn(
                      "max-w-[14rem] truncate px-4 py-3",
                      secondaryText,
                    )}
                  >
                    {supplier.notes ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => startEdit(supplier)}
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
