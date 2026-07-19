"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  applyMenuTemplate,
  fetchAdminMenuItems,
  fetchMenuTemplates,
  transferMenu,
} from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminMenuItem } from "@/types/admin";
import type { Brand } from "@/types/brand";
import type { HqMenuTemplate } from "@/types/hq";
import { cn } from "@/lib/utils";

interface TemplatesViewProps {
  token: string;
  brands: Brand[];
}

type Step = 1 | 2 | 3;

function formatPrice(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
}

export function TemplatesView({ token, brands }: TemplatesViewProps): React.ReactElement {
  const [step, setStep] = useState<Step>(1);
  const [sourceSlug, setSourceSlug] = useState(brands[0]?.slug ?? "");
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [targetSlugs, setTargetSlugs] = useState<Set<string>>(new Set());
  const [lockItems, setLockItems] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<HqMenuTemplate[]>([]);
  const [reapplyTargets, setReapplyTargets] = useState<Record<string, Set<string>>>({});
  const [reapplyingId, setReapplyingId] = useState<string | null>(null);

  const sourceBrand = brands.find((brand) => brand.slug === sourceSlug) ?? null;
  const targetBrands = brands.filter((brand) => brand.slug !== sourceSlug);

  const itemsByCategory = useMemo(() => {
    const groups = new Map<string, AdminMenuItem[]>();
    for (const item of menuItems) {
      const key = item.categorySlug || "uncategorized";
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [menuItems]);

  const loadTemplates = async (): Promise<void> => {
    try {
      const data = await fetchMenuTemplates(token);
      setTemplates(data);
    } catch {
      // History is secondary; keep transfer flow usable if this fails.
    }
  };

  useEffect(() => {
    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!sourceSlug) {
      setMenuItems([]);
      setSelectedSlugs(new Set());
      return;
    }

    let cancelled = false;
    const load = async (): Promise<void> => {
      setIsLoadingMenu(true);
      setError(null);
      try {
        const items = await fetchAdminMenuItems(token, sourceSlug);
        if (cancelled) return;
        setMenuItems(items);
        setSelectedSlugs(new Set());
      } catch (loadError) {
        if (cancelled) return;
        setMenuItems([]);
        setError(loadError instanceof Error ? loadError.message : "Unable to load menu.");
      } finally {
        if (!cancelled) setIsLoadingMenu(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, sourceSlug]);

  const toggleItem = (slug: string): void => {
    setSelectedSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = (): void => {
    setSelectedSlugs(new Set(menuItems.map((item) => item.slug)));
  };

  const clearSelection = (): void => {
    setSelectedSlugs(new Set());
  };

  const toggleTarget = (slug: string): void => {
    setTargetSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const resetWizard = (): void => {
    setStep(1);
    setSelectedSlugs(new Set());
    setTargetSlugs(new Set());
    setLockItems(false);
    setSaveAsName("");
  };

  const handleTransfer = async (): Promise<void> => {
    if (!sourceSlug || selectedSlugs.size === 0 || targetSlugs.size === 0) return;

    setIsTransferring(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await transferMenu(token, {
        sourceBrandSlug: sourceSlug,
        targetBrandSlugs: Array.from(targetSlugs),
        itemSlugs: Array.from(selectedSlugs),
        lockItems,
        saveAsName: saveAsName.trim() || undefined,
      });

      const failedNote =
        result.failed.length > 0
          ? ` Failed: ${result.failed.map((row) => `${row.slug} (${row.reason})`).join(", ")}.`
          : "";

      setSuccess(
        `Transferred ${result.itemCount} item(s) from ${sourceBrand?.name ?? sourceSlug} to ${result.applied.length} store(s).${failedNote}`,
      );
      await loadTemplates();
      resetWizard();
    } catch (transferError) {
      setError(transferError instanceof Error ? transferError.message : "Transfer failed.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleReapply = async (templateId: string): Promise<void> => {
    const targets = reapplyTargets[templateId];
    if (!targets || targets.size === 0) return;

    setReapplyingId(templateId);
    setError(null);
    setSuccess(null);

    try {
      const result = await applyMenuTemplate(token, templateId, Array.from(targets), lockItems);
      setSuccess(
        `Re-applied template to ${result.applied?.length ?? targets.size} store(s).`,
      );
      setReapplyTargets((current) => ({ ...current, [templateId]: new Set() }));
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Unable to re-apply template.");
    } finally {
      setReapplyingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Transfer menu</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Copy selected menu items from one store into another. Choose the source, pick the items,
          then choose where they go.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(
          [
            { id: 1 as const, label: "1. From store" },
            { id: 2 as const, label: "2. Select items" },
            { id: 3 as const, label: "3. To store(s)" },
          ] as const
        ).map((entry, index) => (
          <div className="flex items-center gap-2" key={entry.id}>
            {index > 0 ? <ArrowRight className={cn("h-3.5 w-3.5", secondaryText)} /> : null}
            <button
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition-colors",
                step === entry.id
                  ? "bg-[#d81b60] text-white"
                  : step > entry.id
                    ? "bg-[#d81b60]/10 text-[#d81b60]"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
              )}
              onClick={() => {
                if (entry.id === 1) setStep(1);
                if (entry.id === 2 && sourceSlug) setStep(2);
                if (entry.id === 3 && selectedSlugs.size > 0) setStep(3);
              }}
              type="button"
            >
              {entry.label}
            </button>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          {success}
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-zinc-900/40">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h3 className={cn("text-lg font-semibold", primaryText)}>From store</h3>
              <p className={cn("mt-1 text-sm", secondaryText)}>
                We load the full menu from this store so you can pick what to copy.
              </p>
            </div>
            <select
              className="flex h-11 w-full max-w-md rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
              onChange={(event) => {
                setSourceSlug(event.target.value);
                setTargetSlugs(new Set());
                setSuccess(null);
              }}
              value={sourceSlug}
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <Button
                disabled={!sourceSlug || isLoadingMenu}
                onClick={() => setStep(2)}
                type="button"
              >
                Next: select items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className={cn("text-lg font-semibold", primaryText)}>
                  Select items from {sourceBrand?.name ?? "source"}
                </h3>
                <p className={cn("mt-1 text-sm", secondaryText)}>
                  Only checked items will be transferred. Categories for those items are included
                  automatically.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={selectAll} type="button" variant="outline">
                  Select all
                </Button>
                <Button onClick={clearSelection} type="button" variant="ghost">
                  Clear
                </Button>
              </div>
            </div>

            {isLoadingMenu ? (
              <div className="flex min-h-[12rem] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#d81b60]" />
              </div>
            ) : menuItems.length === 0 ? (
              <p className={cn("text-sm", secondaryText)}>This store has no menu items yet.</p>
            ) : (
              <div className="max-h-[28rem] space-y-5 overflow-y-auto pr-1">
                {itemsByCategory.map(([categorySlug, items]) => (
                  <div key={categorySlug}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#d81b60]">
                      {categorySlug.replace(/-/g, " ")}
                    </p>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const checked = selectedSlugs.has(item.slug);
                        return (
                          <label
                            className={cn(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                              checked
                                ? "border-[#d81b60]/40 bg-[#d81b60]/5"
                                : "border-zinc-200/70 bg-white/80 dark:border-white/10 dark:bg-zinc-900/50",
                            )}
                            key={item.id}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <input
                                checked={checked}
                                onChange={() => toggleItem(item.slug)}
                                type="checkbox"
                              />
                              <span className="min-w-0">
                                <span className={cn("block truncate font-medium", primaryText)}>
                                  {item.name}
                                </span>
                                <span className={cn("block truncate text-xs", secondaryText)}>
                                  #{item.number} · {item.slug}
                                </span>
                              </span>
                            </span>
                            <span className={cn("shrink-0 tabular-nums", secondaryText)}>
                              {formatPrice(item.price)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
              <p className={cn("text-sm", secondaryText)}>
                {selectedSlugs.size} item{selectedSlugs.size === 1 ? "" : "s"} selected
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} type="button" variant="ghost">
                  Back
                </Button>
                <Button
                  disabled={selectedSlugs.size === 0}
                  onClick={() => setStep(3)}
                  type="button"
                >
                  Next: choose stores
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <h3 className={cn("text-lg font-semibold", primaryText)}>To store(s)</h3>
              <p className={cn("mt-1 text-sm", secondaryText)}>
                Transfer {selectedSlugs.size} item(s) from{" "}
                <span className="font-medium text-[#d81b60]">{sourceBrand?.name}</span> into the
                stores below. Existing items with the same slug are updated.
              </p>
            </div>

            {targetBrands.length === 0 ? (
              <p className={cn("text-sm", secondaryText)}>
                Add another store first — you need a different target than the source.
              </p>
            ) : (
              <div className="space-y-2">
                {targetBrands.map((brand) => (
                  <label
                    className="flex items-center gap-2 rounded-xl border border-zinc-200/70 px-3 py-2.5 text-sm dark:border-white/10"
                    key={brand.id}
                  >
                    <input
                      checked={targetSlugs.has(brand.slug)}
                      onChange={() => toggleTarget(brand.slug)}
                      type="checkbox"
                    />
                    <span className={primaryText}>{brand.name}</span>
                  </label>
                ))}
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                checked={lockItems}
                onChange={(event) => setLockItems(event.target.checked)}
                type="checkbox"
              />
              <span className={primaryText}>Lock transferred items on target stores</span>
            </label>

            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Save as reusable template (optional)
              </label>
              <Input
                onChange={(event) => setSaveAsName(event.target.value)}
                placeholder="e.g. Core pizza list"
                value={saveAsName}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
              <Button onClick={() => setStep(2)} type="button" variant="ghost">
                Back
              </Button>
              <Button
                disabled={isTransferring || targetSlugs.size === 0 || selectedSlugs.size === 0}
                onClick={() => void handleTransfer()}
                type="button"
              >
                {isTransferring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Transfer to {targetSlugs.size || "…"} store{targetSlugs.size === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {templates.length > 0 ? (
        <div className="space-y-3">
          <div>
            <h3 className={cn("text-lg font-semibold", primaryText)}>Saved templates</h3>
            <p className={cn("mt-1 text-sm", secondaryText)}>
              Re-apply a previously saved selection to more stores.
            </p>
          </div>
          {templates.map((template) => {
            const selected = reapplyTargets[template.id] ?? new Set<string>();
            return (
              <div
                className="rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/30"
                key={template.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={cn("font-medium", primaryText)}>{template.name}</p>
                    <p className={cn("mt-1 text-xs", secondaryText)}>
                      {template.sourceBrand
                        ? `From ${template.sourceBrand.name}`
                        : "Saved selection"}
                      {template.description ? ` · ${template.description}` : ""}
                    </p>
                  </div>
                  <Button
                    disabled={reapplyingId === template.id || selected.size === 0}
                    onClick={() => void handleReapply(template.id)}
                    type="button"
                  >
                    {reapplyingId === template.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Re-apply
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {brands.map((brand) => (
                    <label className="flex items-center gap-2 text-xs" key={brand.id}>
                      <input
                        checked={selected.has(brand.slug)}
                        onChange={() => {
                          setReapplyTargets((current) => {
                            const next = new Set(current[template.id] ?? []);
                            if (next.has(brand.slug)) next.delete(brand.slug);
                            else next.add(brand.slug);
                            return { ...current, [template.id]: next };
                          });
                        }}
                        type="checkbox"
                      />
                      <span className={primaryText}>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
