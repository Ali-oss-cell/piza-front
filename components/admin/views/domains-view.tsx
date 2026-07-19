"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Globe, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchHqDomains, createHqDomain, updateHqDomain } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqDomain } from "@/types/hq";
import type { Brand } from "@/types/brand";
import { cn } from "@/lib/utils";

interface DomainsViewProps {
  token: string;
  brands: Brand[];
}

interface DomainFormState {
  storeSlug: string;
  host: string;
  pathPrefix: string;
  isPrimary: boolean;
}

function emptyForm(brands: Brand[]): DomainFormState {
  return {
    storeSlug: brands[0]?.slug ?? "",
    host: "",
    pathPrefix: "",
    isPrimary: false,
  };
}

export function DomainsView({ token, brands }: DomainsViewProps): React.ReactElement {
  const [domains, setDomains] = useState<HqDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<DomainFormState>(() => emptyForm(brands));
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadDomains = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHqDomains(token);
      setDomains(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load domains.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);

    try {
      await createHqDomain(token, {
        storeSlug: form.storeSlug,
        host: form.host.trim() || undefined,
        pathPrefix: form.pathPrefix.trim() || undefined,
        isPrimary: form.isPrimary,
      });
      await loadDomains();
      setIsModalOpen(false);
      setForm(emptyForm(brands));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create domain.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (domain: HqDomain): Promise<void> => {
    setBusyId(domain.id);
    try {
      await updateHqDomain(token, domain.id, { isActive: !domain.isActive });
      await loadDomains();
    } finally {
      setBusyId(null);
    }
  };

  const handleSetPrimary = async (domain: HqDomain): Promise<void> => {
    setBusyId(domain.id);
    try {
      await updateHqDomain(token, domain.id, { isPrimary: true });
      await loadDomains();
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
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Domains</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Path and host routing for storefronts
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <div className="space-y-3">
        {domains.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
            <p className={cn("text-sm", secondaryText)}>No domains configured yet.</p>
          </div>
        ) : (
          domains.map((domain) => (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
              key={domain.id}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Globe className="h-4 w-4 text-[#d81b60]" />
                  <p className={cn("font-medium", primaryText)}>
                    {domain.store.name}
                  </p>
                  {domain.isPrimary ? (
                    <span className="rounded-full bg-[#d81b60]/10 px-2 py-0.5 text-xs font-semibold text-[#d81b60]">
                      Primary
                    </span>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  {domain.host || "(no host)"}
                  {domain.pathPrefix ? ` / ${domain.pathPrefix}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    domain.isActive
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-zinc-500/15 text-zinc-500"
                  )}
                  disabled={busyId === domain.id}
                  onClick={() => void handleToggleActive(domain)}
                  type="button"
                >
                  {domain.isActive ? "Active" : "Inactive"}
                </button>
                {!domain.isPrimary ? (
                  <button
                    className="rounded-full bg-zinc-500/15 px-3 py-1 text-xs font-medium text-zinc-500"
                    disabled={busyId === domain.id}
                    onClick={() => void handleSetPrimary(domain)}
                    type="button"
                  >
                    Set primary
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
              Add Domain
            </Dialog.Title>
            <div className="mt-6 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Store</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, storeSlug: event.target.value }))
                  }
                  value={form.storeSlug}
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Path prefix
                </label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, pathPrefix: event.target.value }))
                  }
                  placeholder="e.g. /leovorno"
                  value={form.pathPrefix}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Host</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, host: event.target.value }))
                  }
                  placeholder="e.g. example.com (optional)"
                  value={form.host}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={form.isPrimary}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isPrimary: event.target.checked }))
                  }
                  type="checkbox"
                />
                <span className={primaryText}>Set as primary domain</span>
              </label>
              {error ? <p className="text-sm text-red-500">{error}</p> : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isSaving || !form.storeSlug}
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
