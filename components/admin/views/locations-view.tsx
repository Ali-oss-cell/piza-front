"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminLocations, createAdminLocation, updateAdminLocation } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminLocation } from "@/types/hq";
import { cn } from "@/lib/utils";

interface LocationsViewProps {
  token: string;
  brandSlug: string;
}

interface LocationFormState {
  name: string;
  suburb: string;
  address: string;
}

function emptyForm(): LocationFormState {
  return {
    name: "",
    suburb: "",
    address: "",
  };
}

export function LocationsView({ token, brandSlug }: LocationsViewProps): React.ReactElement {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<LocationFormState>(emptyForm);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadLocations = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLocations(token, brandSlug);
      setLocations(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load locations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, brandSlug]);

  const handleCreate = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await createAdminLocation(token, {
        brandSlug,
        name: form.name.trim(),
        suburb: form.suburb.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      await loadLocations();
      setIsModalOpen(false);
      setForm(emptyForm());
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create location.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (location: AdminLocation): Promise<void> => {
    setBusyId(location.id);
    try {
      await updateAdminLocation(token, location.id, { isActive: !location.isActive });
      await loadLocations();
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (location: AdminLocation): Promise<void> => {
    setBusyId(location.id);
    try {
      await updateAdminLocation(token, location.id, { isDefault: true });
      await loadLocations();
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Locations</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Store locations for delivery zones and staff assignment
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="space-y-3">
        {locations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No locations yet.</p>
          </div>
        ) : (
          locations.map((location) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={location.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#d81b60]" />
                  <p className={cn("font-medium", primaryText)}>{location.name}</p>
                  {location.isDefault ? (
                    <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {location.suburb ? `${location.suburb} · ` : ""}
                  {location.address || "No address"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    location.isActive
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-zinc-500/15 text-zinc-500"
                  )}
                  disabled={busyId === location.id}
                  onClick={() => void handleToggleActive(location)}
                  type="button"
                >
                  {location.isActive ? "Active" : "Inactive"}
                </button>
                {!location.isDefault ? (
                  <button
                    className="rounded-full bg-zinc-500/15 px-3 py-1 text-xs font-medium text-zinc-500"
                    disabled={busyId === location.id}
                    onClick={() => void handleSetDefault(location)}
                    type="button"
                  >
                    Set default
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
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
              Add Location
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Name</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="e.g. Melbourne CBD"
                  value={form.name}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Suburb</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, suburb: event.target.value }))
                  }
                  value={form.suburb}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Address</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                  value={form.address}
                />
              </div>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !form.name.trim()}
                onClick={() => void handleCreate()}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
