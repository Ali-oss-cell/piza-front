import type { CartItem } from "@/types/menu";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";
import { getSiteBrandSlug } from "@/lib/brand-storage";

export const CART_STORAGE_KEY_PREFIX = "marina-cart";

function cartStorageKey(brandSlug?: string): string {
  const slug = (brandSlug ?? getSiteBrandSlug() ?? DEFAULT_BRAND_SLUG).trim().toLowerCase();
  return `${CART_STORAGE_KEY_PREFIX}:${slug}`;
}

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

export function readCartFromStorage(brandSlug?: string): CartItem[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(cartStorageKey(brandSlug));

  if (!raw) {
    // Migrate legacy single-key cart into default brand once.
    if (!brandSlug || brandSlug === DEFAULT_BRAND_SLUG) {
      const legacy = window.localStorage.getItem("leovorno-cart");
      if (legacy) {
        try {
          const parsed: unknown = JSON.parse(legacy);
          if (Array.isArray(parsed)) {
            const items = parsed.filter(isCartItem);
            if (items.length > 0) {
              writeCartToStorage(items, DEFAULT_BRAND_SLUG);
              window.localStorage.removeItem("leovorno-cart");
              return items;
            }
          }
        } catch {
          // ignore corrupt legacy cart
        }
      }
    }
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

export function writeCartToStorage(items: CartItem[], brandSlug?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(cartStorageKey(brandSlug), JSON.stringify(items));
}
