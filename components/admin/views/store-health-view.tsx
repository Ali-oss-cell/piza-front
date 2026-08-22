"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchHqStoreHealth, updateStoreStatus } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqStoreHealth, HqStoreHealthRow } from "@/types/hq";
import { cn } from "@/lib/utils";

interface StoreHealthViewProps {
  token: string;
  onOpenStore?: (slug: string) => void;
}

type Filter = "all" | "critical" | "warning" | "ok";

export function StoreHealthView({
  token,
  onOpenStore,
}: StoreHealthViewProps): React.ReactElement {
  const [data, setData] = useState<HqStoreHealth | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchHqStoreHealth(token);
      setData(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load store health.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stores = useMemo(() => {
    const rows = data?.stores ?? [];
    if (filter === "all") return rows;
    return rows.filter((row) => row.severity === filter);
  }, [data, filter]);

  const handleStatus = async (store: HqStoreHealthRow, isActive: boolean): Promise<void> => {
    if (!isActive) {
      const confirmed = window.confirm(
        `Delete store "${store.name}"?\n\nSoft delete: hidden from customers/POS, data kept. You can reactivate later.`,
      );
      if (!confirmed) {
        return;
      }
    }

    setBusySlug(store.slug);
    setError(null);
    try {
      await updateStoreStatus(token, store.slug, isActive);
      await load();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : isActive
            ? "Unable to reactivate store."
            : "Unable to delete store.",
      );
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Store health</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Setup and payment readiness issues across every store
          </p>
        </div>
        <Button onClick={() => void load()} type="button" variant="outline">
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#d81b60]/30 bg-[#d81b60]/10 px-4 py-3 text-sm text-[#d81b60]">
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {(
            [
              { key: "all" as const, label: "Stores", value: data.totals.stores },
              { key: "ok" as const, label: "Healthy", value: data.totals.healthy },
              { key: "warning" as const, label: "Warnings", value: data.totals.warning },
              { key: "critical" as const, label: "Critical", value: data.totals.critical },
            ] as const
          ).map((card) => (
            <button
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                filter === card.key
                  ? "border-[#d81b60]/40 bg-[#d81b60]/5"
                  : "border-zinc-200/70 bg-white/70 dark:border-white/10 dark:bg-zinc-900/40",
              )}
              key={card.key}
              onClick={() => setFilter(card.key)}
              type="button"
            >
              <p className={cn("text-xs uppercase tracking-wide", secondaryText)}>{card.label}</p>
              <p className={cn("mt-1 font-display text-2xl font-bold", primaryText)}>{card.value}</p>
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
        </div>
      ) : (
        <div className="space-y-3">
          {stores.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300/70 p-8 text-center dark:border-white/10">
              <p className={cn("text-sm", secondaryText)}>No stores match this filter.</p>
            </div>
          ) : (
            stores.map((store) => (
              <HealthRow
                busy={busySlug === store.slug}
                key={store.id}
                onDelete={() => void handleStatus(store, false)}
                onOpenStore={onOpenStore}
                onReactivate={() => void handleStatus(store, true)}
                store={store}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function HealthRow({
  store,
  onOpenStore,
  onDelete,
  onReactivate,
  busy,
}: {
  store: HqStoreHealthRow;
  onOpenStore?: (slug: string) => void;
  onDelete: () => void;
  onReactivate: () => void;
  busy: boolean;
}): React.ReactElement {
  const tone =
    store.severity === "critical"
      ? "border-red-200 bg-red-50/70 dark:border-red-500/30 dark:bg-red-500/10"
      : store.severity === "warning"
        ? "border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10"
        : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5";

  return (
    <div className={cn("rounded-2xl border px-4 py-4", tone, dashboardGlass)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("font-display text-lg font-semibold", primaryText)}>{store.name}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                store.severity === "critical"
                  ? "bg-red-500/15 text-red-700"
                  : store.severity === "warning"
                    ? "bg-amber-500/15 text-amber-700"
                    : "bg-emerald-500/15 text-emerald-700",
              )}
            >
              {store.severity}
            </span>
          </div>
          <p className={cn("mt-1 text-xs", secondaryText)}>
            {store.status}
            {!store.isActive ? " · deleted (soft)" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenStore ? (
            <Button onClick={() => onOpenStore(store.slug)} type="button" variant="outline">
              Open store
            </Button>
          ) : null}
          {store.isActive ? (
            <Button disabled={busy} onClick={onDelete} type="button" variant="outline">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete store
            </Button>
          ) : (
            <Button disabled={busy} onClick={onReactivate} type="button">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {store.alerts.length === 0 ? (
        <p className={cn("mt-3 flex items-center gap-2 text-sm text-emerald-700")}>
          <CheckCircle2 className="h-4 w-4" />
          No issues detected
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {store.alerts.map((alert) => (
            <li className={cn("flex items-start gap-2 text-sm", primaryText)} key={alert.code}>
              <AlertTriangle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  alert.severity === "critical" ? "text-red-600" : "text-amber-600",
                )}
              />
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
