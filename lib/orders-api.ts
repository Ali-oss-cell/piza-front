import { apiRequest } from "@/lib/api-client";
import type { DeliveryMode } from "@/types/menu";

export interface CreateOrderPayload {
  deliveryMode: "DELIVERY" | "PICKUP";
  items: Array<{
    menuItemId?: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    size?: string;
    crust?: string;
    toppings?: string[];
    removedIngredients?: string[];
  }>;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  deliveryAddressLine1?: string;
  deliveryAddressLine2?: string;
  deliverySuburb?: string;
  deliveryState?: string;
  deliveryPostcode?: string;
  scheduledAt: string;
  notes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CreatedOrder {
  id: string;
  status: string;
  total: string | number;
  scheduledAt?: string | null;
}

export function toApiDeliveryMode(mode: DeliveryMode): "DELIVERY" | "PICKUP" {
  return mode === "delivery" ? "DELIVERY" : "PICKUP";
}

export function createOrder(
  payload: CreateOrderPayload,
  token?: string,
): Promise<CreatedOrder> {
  return apiRequest<CreatedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}
