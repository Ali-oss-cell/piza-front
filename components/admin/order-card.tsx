"use client";

import { ChevronRight, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatScheduledAt } from "@/lib/opening-hours";
import { getNextOrderStatus, getStatusBadgeClass, getStatusLabel } from "@/lib/order-status";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { AdminOrder } from "@/types/admin";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: AdminOrder;
  onAdvance: (orderId: string) => Promise<void>;
}

function formatMoney(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
}

function formatOrderTime(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function OrderCard({ order, onAdvance }: OrderCardProps): React.ReactElement {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const nextStatus = getNextOrderStatus(order.status);
  const customerName =
    order.user ? `${order.user.firstName} ${order.user.lastName}` : order.guestName ?? "Guest";
  const customerEmail = order.user?.email ?? order.guestEmail;
  const deliveryAddress = [
    order.deliveryAddressLine1,
    order.deliveryAddressLine2,
    [order.deliverySuburb, order.deliveryState, order.deliveryPostcode]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const handleAdvance = async (): Promise<void> => {
    if (!nextStatus) {
      return;
    }

    setIsAdvancing(true);

    try {
      await onAdvance(order.id);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <article className={cn("p-5", dashboardGlass)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={cn("font-semibold", primaryText)}>{customerName}</p>
          <p className={cn("text-sm", secondaryText)}>
            {order.deliveryMode === "DELIVERY" ? "Delivery" : "Pickup"}
            {order.scheduledAt
              ? ` · ${formatScheduledAt(order.scheduledAt)}`
              : ` · ${formatOrderTime(order.createdAt)}`}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            getStatusBadgeClass(order.status)
          )}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="mb-4 space-y-1.5 text-sm">
        {customerEmail ? (
          <p className={cn("flex items-center gap-2", secondaryText)}>
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {customerEmail}
          </p>
        ) : null}
        {order.guestPhone ? (
          <p className={cn("flex items-center gap-2", secondaryText)}>
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {order.guestPhone}
          </p>
        ) : null}
        {order.deliveryMode === "DELIVERY" && deliveryAddress ? (
          <p className={cn("flex items-start gap-2", secondaryText)}>
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {deliveryAddress}
          </p>
        ) : null}
        {order.notes ? (
          <p className={cn("text-xs italic", secondaryText)}>Note: {order.notes}</p>
        ) : null}
      </div>

      <ul className="space-y-2">
        {order.items.map((item) => (
          <li className={cn("text-sm", secondaryText)} key={item.id}>
            {item.quantity}x {item.name}
            {item.size ? ` - ${item.size}` : ""}
            {item.toppings?.length ? `, ${item.toppings.join(", ")}` : ""}
            {item.description.includes("Extras") ? ` (${item.description.split(" · ").pop()})` : ""}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-zinc-200/50 pt-4 dark:border-white/10">
        <span className="font-semibold text-[#d81b60]">{formatMoney(order.total)}</span>
        {nextStatus ? (
          <Button
            className="rounded-xl"
            disabled={isAdvancing}
            onClick={() => void handleAdvance()}
            size="default"
            variant="outline"
          >
            {isAdvancing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Advance to {getStatusLabel(nextStatus)}
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <span className={cn("text-xs font-medium uppercase tracking-wide", secondaryText)}>
            Completed
          </span>
        )}
      </div>
    </article>
  );
}
