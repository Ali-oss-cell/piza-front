"use client";

import {
  DollarSign,
  Loader2,
  ShoppingBag,
  Store,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { KpiCard } from "@/components/admin/kpi-card";
import { Button } from "@/components/ui/button";
import { fetchHqOverview } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqOverview } from "@/types/hq";
import { cn } from "@/lib/utils";

interface HqOverviewViewProps {
  token: string;
  onOpenStore: (slug: string) => void;
  onManageStores: () => void;
}

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function HqOverviewView({
  token,
  onOpenStore,
  onManageStores,
}: HqOverviewViewProps): React.ReactElement {
  const [data, setData] = useState<HqOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchHqOverview(token)
      .then((overview) => {
        if (!cancelled) {
          setData(overview);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load HQ overview.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-[#d81b60]/20 bg-[#d81b60]/10 p-6 text-[#d81b60]">
        {error ?? "No data"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Franchise HQ</h2>
          <p className={cn("mt-1 text-sm", secondaryText)}>
            Network performance across all stores (Melbourne day by default).
          </p>
        </div>
        <Button onClick={onManageStores} type="button" variant="outline">
          <Store className="mr-2 h-4 w-4" />
          Manage stores
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          highlight
          hint="Paid orders"
          icon={DollarSign}
          label="Revenue"
          value={money(data.totals.revenue)}
        />
        <KpiCard
          hint="Paid in period"
          icon={ShoppingBag}
          label="Orders"
          value={String(data.totals.orderCount)}
        />
        <KpiCard
          hint="Average order value"
          icon={TrendingUp}
          label="AOV"
          value={money(data.totals.averageOrderValue)}
        />
        <KpiCard
          hint="In progress"
          icon={ShoppingBag}
          label="Live orders"
          value={String(data.totals.liveOrders)}
        />
        <KpiCard
          hint={`${data.totals.activeLocations} locations`}
          icon={MapPin}
          label="Active stores"
          value={String(data.totals.activeStores)}
        />
      </div>

      {data.alerts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.alerts.slice(0, 12).map((alert) => (
            <span
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-800 dark:text-amber-200"
              key={`${alert.type}-${alert.brandSlug}-${alert.message}`}
            >
              {alert.message}
            </span>
          ))}
        </div>
      ) : null}

      <section className={cn("overflow-hidden", dashboardGlass)}>
        <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
          <h3 className={cn("font-display text-lg font-bold", primaryText)}>Stores</h3>
        </div>
        <div className="divide-y divide-zinc-200/50 dark:divide-white/10">
          {data.byStore.map((store) => (
            <div
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              key={store.brandId}
            >
              <div>
                <p className={cn("font-medium", primaryText)}>
                  {store.name}
                  {!store.isActive ? (
                    <span className="ml-2 text-xs text-red-500">suspended</span>
                  ) : null}
                </p>
                <p className={cn("text-xs", secondaryText)}>
                  {store.pathPrefix ?? store.slug} · Ready {store.readiness.percent}% ·{" "}
                  {store.liveOrders} live · {money(store.revenue)}
                </p>
              </div>
              <Button onClick={() => onOpenStore(store.slug)} type="button">
                Open
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className={cn("overflow-hidden", dashboardGlass)}>
        <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
          <h3 className={cn("font-display text-lg font-bold", primaryText)}>Recent orders</h3>
        </div>
        <div className="divide-y divide-zinc-200/50 dark:divide-white/10">
          {data.recentOrders.map((order) => (
            <div className="flex items-center justify-between px-6 py-3 text-sm" key={order.id}>
              <div>
                <p className={primaryText}>
                  {order.brandName} · {order.customerName}
                </p>
                <p className={secondaryText}>
                  {order.channel} · {order.status} · {order.paymentStatus}
                </p>
              </div>
              <p className={cn("font-medium", primaryText)}>{money(order.total)}</p>
            </div>
          ))}
          {data.recentOrders.length === 0 ? (
            <p className={cn("px-6 py-8 text-sm", secondaryText)}>No recent orders.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
