"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { fetchInventoryStats } from "@/lib/admin-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { InventoryStats, InventoryStatsKpis } from "@/types/inventory";

type RangePreset = "this-week" | "last-7" | "last-30";

interface StatisticsPanelProps {
  token: string;
  brandSlug: string;
}

function melbourneTodayKey(reference = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference);
}

function addDaysKey(dayKey: string, delta: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + delta);
  return utc.toISOString().slice(0, 10);
}

function resolvePreset(preset: RangePreset): { from?: string; to?: string } {
  if (preset === "this-week") {
    return {};
  }
  const today = melbourneTodayKey();
  if (preset === "last-7") {
    return { from: addDaysKey(today, -6), to: today };
  }
  return { from: addDaysKey(today, -29), to: today };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatQty(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 3,
  });
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatPct(value: number | null): string {
  if (value === null) {
    return "n/a";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function pctClass(value: number | null): string {
  if (value === null || value === 0) {
    return secondaryText;
  }
  return value > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500";
}

function formatShortDate(isoOrDay: string): string {
  const day = isoOrDay.includes("T") ? isoOrDay.slice(0, 10) : isoOrDay;
  const [y, m, d] = day.split("-");
  return `${d}/${m}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  previous: string;
  change: number | null;
  hint?: string;
}

function KpiCard({
  label,
  value,
  previous,
  change,
  hint,
}: KpiCardProps): React.ReactElement {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
      <p className={cn("text-xs font-medium uppercase tracking-wide", secondaryText)}>
        {label}
      </p>
      <p className={cn("mt-2 font-display text-2xl font-bold tabular-nums", primaryText)}>
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-2 text-xs">
        <span className={cn("font-semibold tabular-nums", pctClass(change))}>
          {formatPct(change)}
        </span>
        <span className={secondaryText}>vs prior {previous}</span>
      </div>
      {hint ? <p className={cn("mt-1 text-[11px]", secondaryText)}>{hint}</p> : null}
    </div>
  );
}

export function StatisticsPanel({
  token,
  brandSlug,
}: StatisticsPanelProps): React.ReactElement {
  const [preset, setPreset] = useState<RangePreset>("this-week");
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const range = resolvePreset(preset);
      const next = await fetchInventoryStats(token, brandSlug, range);
      setStats(next);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load inventory statistics.",
      );
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug, preset]);

  useEffect(() => {
    void load();
  }, [load]);

  const kpiCards = useMemo(() => {
    if (!stats) {
      return [];
    }
    const { kpis, previousKpis } = stats;
    const row = (
      label: string,
      key: keyof InventoryStatsKpis,
      format: (n: number) => string,
      hint?: string,
    ) => ({
      label,
      value: format(kpis[key]),
      previous: format(previousKpis[key]),
      change: pctChange(Number(kpis[key]), Number(previousKpis[key])),
      hint,
    });

    return [
      row("Sold qty", "soldQty", formatQty, "Stock deducted by paid sales"),
      row("Sold cost est.", "soldCostEst", formatMoney, "Using avg cost / unit"),
      row("Waste qty", "wasteQty", formatQty),
      row("Waste cost est.", "wasteCostEst", formatMoney),
      row("Received qty", "receiveQty", formatQty),
      row("Receive spend", "receiveCost", formatMoney, "From delivery unit costs"),
      row("Refund restock", "refundQty", formatQty),
      row("Net stock change", "netChange", formatQty),
      row("Orders touched", "ordersTouched", formatQty, "Distinct orders with stock moves"),
      {
        label: "Low stock now",
        value: formatQty(kpis.lowStockCount),
        previous: formatQty(previousKpis.lowStockCount),
        change: null,
        hint: "Snapshot — not period-based",
      },
    ];
  }, [stats]);

  const chartData = useMemo(
    () =>
      (stats?.daily ?? []).map((row) => ({
        ...row,
        label: formatShortDate(row.date),
      })),
    [stats],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
            Statistics
          </h2>
          <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
            Real inventory movement for this store — sold usage, waste, receives,
            and week-over-week change (Melbourne time). Dollar figures for sold
            and waste are estimates from average unit cost.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["this-week", "This week"],
              ["last-7", "Last 7 days"],
              ["last-30", "Last 30 days"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              onClick={() => setPreset(id)}
              type="button"
              variant={preset === id ? "default" : "outline"}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {stats ? (
        <p className={cn("text-xs", secondaryText)}>
          Comparing {formatShortDate(stats.range.from)}–
          {formatShortDate(stats.range.to)} vs prior{" "}
          {formatShortDate(stats.previousRange.from)}–
          {formatShortDate(stats.previousRange.to)}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {kpiCards.map((card) => (
              <KpiCard
                key={card.label}
                change={card.change}
                hint={card.hint}
                label={card.label}
                previous={card.previous}
                value={card.value}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
              <h3 className={cn("mb-3 text-sm font-semibold", primaryText)}>
                Daily sold vs waste (qty)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="soldQty"
                      name="Sold"
                      stroke="#d81b60"
                      fill="#d81b60"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="wasteQty"
                      name="Waste"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200/60 bg-white/50 p-4 dark:border-white/10 dark:bg-zinc-900/30">
              <h3 className={cn("mb-3 text-sm font-semibold", primaryText)}>
                Daily receive spend (AUD)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="receiveCost"
                      name="Receive $"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SkuTable
              empty="No sale deductions in this period."
              rows={stats.topSold}
              title="Top sold stock (by qty)"
            />
            <SkuTable
              empty="No waste recorded in this period."
              rows={stats.topWaste}
              title="Top waste (by qty)"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function SkuTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: InventoryStats["topSold"];
  empty: string;
}): React.ReactElement {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-white/10">
      <div className="border-b border-zinc-200/60 bg-zinc-50/80 px-4 py-3 dark:border-white/10 dark:bg-zinc-900/50">
        <h3 className={cn("text-sm font-semibold", primaryText)}>{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className={cn("text-xs uppercase tracking-wide", secondaryText)}>
              <th className="px-4 py-2 font-semibold">Item</th>
              <th className="px-4 py-2 font-semibold">Qty</th>
              <th className="px-4 py-2 font-semibold">Cost est.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={cn("px-4 py-8 text-center", secondaryText)} colSpan={3}>
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  className="border-t border-zinc-100 dark:border-white/5"
                  key={row.stockItemId}
                >
                  <td className={cn("px-4 py-2 font-medium", primaryText)}>
                    {row.name}
                  </td>
                  <td className={cn("px-4 py-2 tabular-nums", secondaryText)}>
                    {formatQty(row.qty)}
                  </td>
                  <td className={cn("px-4 py-2 tabular-nums", secondaryText)}>
                    {formatMoney(row.costEst)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
