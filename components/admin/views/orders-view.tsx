"use client";

import { OrderCard } from "@/components/admin/order-card";
import { updateOrderStatus } from "@/lib/admin-api";
import { getNextOrderStatus, ORDER_STATUS_TABS } from "@/lib/order-status";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminOrder } from "@/types/admin";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface OrdersViewProps {
  orders: AdminOrder[];
  token: string;
  onOrdersChange: (orders: AdminOrder[]) => void;
}

export function OrdersView({
  orders,
  token,
  onOrdersChange,
}: OrdersViewProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<(typeof ORDER_STATUS_TABS)[number]["id"]>("pending");

  const activeStatuses =
    ORDER_STATUS_TABS.find((tab) => tab.id === activeTab)?.statuses ?? [];

  const filteredOrders = orders.filter((order) => activeStatuses.includes(order.status));

  const handleAdvance = async (orderId: string): Promise<void> => {
    const order = orders.find((entry) => entry.id === orderId);

    if (!order) {
      return;
    }

    const nextStatus = getNextOrderStatus(order.status);

    if (!nextStatus) {
      return;
    }

    const updated = await updateOrderStatus(token, orderId, nextStatus);
    onOrdersChange(orders.map((entry) => (entry.id === orderId ? updated : entry)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUS_TABS.map((tab) => (
          <button
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
              activeTab === tab.id
                ? "bg-[#d81b60] text-white"
                : "border border-zinc-200/60 bg-white/60 text-zinc-600 hover:text-[#d81b60] dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400"
            )}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className={cn("p-8 text-center", dashboardGlass)}>
          <p className={cn("font-medium", primaryText)}>No orders in this stage</p>
          <p className={cn("mt-2 text-sm", secondaryText)}>
            Orders will appear here as they move through the fulfillment pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} onAdvance={handleAdvance} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
