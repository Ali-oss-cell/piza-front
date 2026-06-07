import type { OrderStatus } from "@/types/admin";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

export const ORDER_STATUS_TABS = [
  { id: "pending", label: "Pending", statuses: ["PENDING"] as OrderStatus[] },
  { id: "preparing", label: "Preparing", statuses: ["CONFIRMED", "PREPARING"] as OrderStatus[] },
  { id: "baking", label: "Baking", statuses: ["READY"] as OrderStatus[] },
  { id: "delivery", label: "Out for Delivery", statuses: ["OUT_FOR_DELIVERY"] as OrderStatus[] },
  { id: "delivered", label: "Delivered", statuses: ["COMPLETED"] as OrderStatus[] },
] as const;

export function getNextOrderStatus(current: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(current);

  if (index === -1 || index >= ORDER_STATUS_FLOW.length - 1) {
    return null;
  }

  return ORDER_STATUS_FLOW[index + 1];
}

export function getStatusLabel(status: OrderStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "CONFIRMED":
    case "PREPARING":
      return "bg-[#d81b60]/15 text-[#d81b60]";
    case "READY":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
    case "OUT_FOR_DELIVERY":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    case "COMPLETED":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "CANCELLED":
      return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400";
    default:
      return "bg-zinc-500/15 text-zinc-600";
  }
}
