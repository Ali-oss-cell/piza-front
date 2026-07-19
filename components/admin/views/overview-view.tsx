"use client";

import { DollarSign, MapPin, ShoppingBag, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/order-status";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminOrder } from "@/types/admin";
import { locations } from "@/data/locations";
import { cn } from "@/lib/utils";

interface OverviewViewProps {
  orders: AdminOrder[];
}

function formatMoney(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
}

export function OverviewView({ orders }: OverviewViewProps): React.ReactElement {
  const completedOrders = orders.filter((order) => order.status === "COMPLETED");
  const liveOrders = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status));
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const averageOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          highlight
          hint="Completed orders"
          icon={DollarSign}
          label="Total Revenue"
          value={formatMoney(totalRevenue)}
        />
        <KpiCard
          hint="Awaiting fulfillment"
          icon={ShoppingBag}
          label="Live Orders Pending"
          value={String(liveOrders.length)}
        />
        <KpiCard
          hint="Based on completed orders"
          icon={TrendingUp}
          label="Average Order Value"
          value={formatMoney(averageOrderValue)}
        />
        <KpiCard
          hint="Melbourne network"
          icon={MapPin}
          label="Active Store Locations"
          value={String(locations.length)}
        />
      </div>

      <section className={cn("overflow-hidden", dashboardGlass)}>
        <div className="border-b border-zinc-200/50 px-6 py-4 dark:border-white/10">
          <h2 className={cn("font-display text-xl font-semibold", primaryText)}>Recent Orders</h2>
          <p className={cn("text-sm", secondaryText)}>Latest five customer transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className={cn("border-b border-zinc-200/50 text-xs uppercase tracking-wide dark:border-white/10", secondaryText)}>
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td className={cn("px-6 py-8 text-center", secondaryText)} colSpan={5}>
                    No orders yet. They will appear here once customers start checking out.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    className="border-b border-zinc-200/40 last:border-0 dark:border-white/5"
                    key={order.id}
                  >
                    <td className={cn("px-6 py-4 font-medium", primaryText)}>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : order.guestName ?? "Guest"}
                    </td>
                    <td className={cn("px-6 py-4", secondaryText)}>
                      {new Intl.DateTimeFormat("en-AU", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      }).format(new Date(order.createdAt))}
                    </td>
                    <td className={cn("px-6 py-4", secondaryText)}>
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#d81b60]">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          getStatusBadgeClass(order.status)
                        )}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
