import { apiRequest } from "@/lib/api-client";
import { getSiteBrandSlug, getSiteLocationId } from "@/lib/brand-storage";
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
  locationId?: string;
}

export interface CreatedOrder {
  id: string;
  status: string;
  paymentStatus?: string;
  ticketNumber?: number | null;
  total: string | number;
  scheduledAt?: string | null;
  requiresPayment?: boolean;
  clientSecret?: string | null;
  publishableKey?: string | null;
}

export interface CheckoutOrderStatus {
  id: string;
  ticketNumber: number | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: string | number;
  fulfillmentType: string;
  channel: string;
}

export function toApiDeliveryMode(mode: DeliveryMode): "DELIVERY" | "PICKUP" {
  return mode === "delivery" ? "DELIVERY" : "PICKUP";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createOrder(
  payload: CreateOrderPayload,
  token?: string,
  brandSlug?: string,
): Promise<CreatedOrder> {
  const locationId = payload.locationId ?? getSiteLocationId() ?? undefined;
  const items = payload.items.map((item) => {
    const menuItemId =
      item.menuItemId && UUID_RE.test(item.menuItemId)
        ? item.menuItemId
        : undefined;
    return {
      ...item,
      menuItemId,
      description: item.description ?? "",
    };
  });

  return apiRequest<CreatedOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      items,
      ...(locationId ? { locationId } : {}),
    }),
    token,
    brandSlug: brandSlug ?? getSiteBrandSlug(),
    locationId,
  });
}

export function fetchCheckoutOrderStatus(
  orderId: string,
  brandSlug?: string,
): Promise<CheckoutOrderStatus> {
  return apiRequest<CheckoutOrderStatus>(`/orders/${orderId}/checkout-status`, {
    brandSlug: brandSlug ?? getSiteBrandSlug(),
  });
}
