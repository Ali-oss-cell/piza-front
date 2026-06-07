import type { CartItem } from "@/types/menu";

export const CART_STORAGE_KEY = "leovorno-cart";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as CartItem;

  return (
    typeof item.id === "string" &&
    typeof item.itemId === "string" &&
    typeof item.name === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.imageUrl === "string" &&
    typeof item.imageAlt === "string"
  );
}

export function readCartFromStorage(): CartItem[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return null;
    }

    const items = parsed.filter(isCartItem);

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}
