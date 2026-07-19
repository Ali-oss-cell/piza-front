"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminDeals, pushDealToStores } from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import type { Brand } from "@/types/brand";
import type { Deal } from "@/types/deals";
import { cn } from "@/lib/utils";

interface HqDealsViewProps {
  token: string;
  brands: Brand[];
}

type Step = 1 | 2 | 3;

export function HqDealsView({ token, brands }: HqDealsViewProps): React.ReactElement {
  const [step, setStep] = useState<Step>(1);
  const [sourceSlug, setSourceSlug] = useState(brands[0]?.slug ?? "");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [targetSlugs, setTargetSlugs] = useState<Set<string>>(new Set());
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sourceBrand = brands.find((brand) => brand.slug === sourceSlug) ?? null;
  const selectedDeal = deals.find((deal) => deal.id === selectedDealId) ?? null;
  const targetBrands = brands.filter((brand) => brand.slug !== sourceSlug);

  useEffect(() => {
    if (!sourceSlug) {
      setDeals([]);
      setSelectedDealId("");
      return;
    }

    let cancelled = false;
    const load = async (): Promise<void> => {
      setIsLoadingDeals(true);
      setError(null);
      try {
        const data = await fetchAdminDeals(token, sourceSlug);
        if (cancelled) return;
        setDeals(data);
        setSelectedDealId("");
      } catch (loadError) {
        if (cancelled) return;
        setDeals([]);
        setError(loadError instanceof Error ? loadError.message : "Unable to load deals.");
      } finally {
        if (!cancelled) setIsLoadingDeals(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, sourceSlug]);

  const handlePush = async (): Promise<void> => {
    if (!selectedDealId || targetSlugs.size === 0) return;

    setIsPushing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await pushDealToStores(token, selectedDealId, Array.from(targetSlugs));
      setSuccess(
        `Pushed “${selectedDeal?.title ?? "deal"}” from ${sourceBrand?.name ?? sourceSlug} to ${result.pushed.length} store(s).${
          result.failed.length
            ? ` Failed: ${result.failed.map((row) => row.slug).join(", ")}.`
            : ""
        }`,
      );
      setStep(1);
      setSelectedDealId("");
      setTargetSlugs(new Set());
    } catch (pushError) {
      setError(pushError instanceof Error ? pushError.message : "Push failed.");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Deals push</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Pick a deal from one store and push it to other stores
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(
          [
            { id: 1 as const, label: "1. From store" },
            { id: 2 as const, label: "2. Select deal" },
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
                if (entry.id === 3 && selectedDealId) setStep(3);
              }}
              type="button"
            >
              {entry.label}
            </button>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-zinc-900/40">
        {step === 1 ? (
          <div className="space-y-4">
            <h3 className={cn("text-lg font-semibold", primaryText)}>From store</h3>
            <select
              className="flex h-11 w-full max-w-md rounded-xl border border-zinc-200/70 bg-white px-4 text-sm dark:border-white/10 dark:bg-zinc-900"
              onChange={(event) => {
                setSourceSlug(event.target.value);
                setTargetSlugs(new Set());
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
              <Button disabled={!sourceSlug} onClick={() => setStep(2)} type="button">
                Next: select deal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <h3 className={cn("text-lg font-semibold", primaryText)}>
              Deals in {sourceBrand?.name ?? "source"}
            </h3>
            {isLoadingDeals ? (
              <div className="flex min-h-[10rem] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#d81b60]" />
              </div>
            ) : deals.length === 0 ? (
              <p className={cn("text-sm", secondaryText)}>
                No deals in this store. Create one in the store admin Deals screen first.
              </p>
            ) : (
              <div className="max-h-[24rem] space-y-2 overflow-y-auto">
                {deals.map((deal) => {
                  const selected = selectedDealId === deal.id;
                  return (
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition",
                        selected
                          ? "border-[#d81b60]/40 bg-[#d81b60]/5"
                          : "border-zinc-200/70 bg-white/80 dark:border-white/10",
                      )}
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      type="button"
                    >
                      <span>
                        <span className={cn("block font-medium", primaryText)}>{deal.title}</span>
                        <span className={cn("block text-xs", secondaryText)}>
                          {deal.slug} · {deal.isActive ? "active" : "hidden"}
                        </span>
                      </span>
                      {selected ? <Check className="h-4 w-4 text-[#d81b60]" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
              <Button onClick={() => setStep(1)} type="button" variant="ghost">
                Back
              </Button>
              <Button disabled={!selectedDealId} onClick={() => setStep(3)} type="button">
                Next: choose stores
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <h3 className={cn("text-lg font-semibold", primaryText)}>To store(s)</h3>
            <p className={cn("text-sm", secondaryText)}>
              Push <span className="font-medium text-[#d81b60]">{selectedDeal?.title}</span> from{" "}
              {sourceBrand?.name}
            </p>
            {targetBrands.length === 0 ? (
              <p className={cn("text-sm", secondaryText)}>Need another store as the target.</p>
            ) : (
              <div className="space-y-2">
                {targetBrands.map((brand) => (
                  <label
                    className="flex items-center gap-2 rounded-xl border border-zinc-200/70 px-3 py-2.5 text-sm dark:border-white/10"
                    key={brand.id}
                  >
                    <input
                      checked={targetSlugs.has(brand.slug)}
                      onChange={() => {
                        setTargetSlugs((current) => {
                          const next = new Set(current);
                          if (next.has(brand.slug)) next.delete(brand.slug);
                          else next.add(brand.slug);
                          return next;
                        });
                      }}
                      type="checkbox"
                    />
                    <span className={primaryText}>{brand.name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
              <Button onClick={() => setStep(2)} type="button" variant="ghost">
                Back
              </Button>
              <Button
                disabled={isPushing || targetSlugs.size === 0}
                onClick={() => void handlePush()}
                type="button"
              >
                {isPushing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Push to {targetSlugs.size || "…"} store{targetSlugs.size === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
