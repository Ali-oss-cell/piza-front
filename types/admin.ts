export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type MenuCategory = string;

export type { MenuItemBadge } from "@/lib/menu-badges";

import type { MenuItemBadge } from "@/lib/menu-badges";
import type { SizeOptions } from "@/lib/size-options";

export interface AdminExtraTopping {
  id: string;
  slug: string;
  label: string;
  categorySlug: string;
  categoryLabel: string;
  priceDelta: string | number;
  sortOrder: number;
  isActive: boolean;
}

export interface ToppingCategoryGroup {
  id: string;
  label: string;
  toppings: AdminExtraTopping[];
}

export interface AdminToppingCategory {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
}

export interface AdminIngredient {
  id: string;
  slug: string;
  label: string;
  categorySlug: string;
  categoryLabel: string;
  sortOrder: number;
  isActive: boolean;
}

export interface IngredientCategoryGroup {
  id: string;
  label: string;
  ingredients: AdminIngredient[];
}

export interface AdminIngredientCategory {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
}

export interface AdminMenuCategoryRecord {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  supportsSizeOptions: boolean;
  supportsExtras: boolean;
  isActive: boolean;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  description: string;
  price: string | number;
  quantity: number;
  size?: string | null;
  crust?: string | null;
  toppings?: string[] | null;
}

export interface AdminOrder {
  id: string;
  status: OrderStatus;
  deliveryMode: "DELIVERY" | "PICKUP";
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  guestEmail?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  deliveryAddressLine1?: string | null;
  deliveryAddressLine2?: string | null;
  deliverySuburb?: string | null;
  deliveryState?: string | null;
  deliveryPostcode?: string | null;
  scheduledAt?: string | null;
  notes?: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AdminMenuItem {
  id: string;
  slug: string;
  number: number;
  name: string;
  description: string;
  price: string | number;
  categorySlug: string;
  imageUrl: string;
  imageAlt: string;
  badges: MenuItemBadge[];
  priceNote?: string | null;
  ingredients: string[];
  sizeOptions?: SizeOptions | null;
  sizePricing?: {
    small?: number;
    large?: number;
    family?: number;
  } | null;
  allowedToppingIds: string[];
  isActive: boolean;
  brandSlug?: string;
}

export type AdminView =
  | "overview"
  | "orders"
  | "menu"
  | "toppings"
  | "categories"
  | "ingredients"
  | "menu-categories"
  | "crusts"
  | "deals"
  | "payments"
  | "settings"
  | "hq"
  | "reports"
  | "team"
  | "locations"
  | "domains"
  | "templates"
  | "customers"
  | "activity";

export interface CreateMenuItemPayload {
  slug: string;
  number: number;
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  imageAlt: string;
  badges?: MenuItemBadge[];
  priceNote?: string | null;
  ingredients?: string[];
  sizeOptions?: SizeOptions;
  sizePricing?: { small: number; large: number; family: number };
  allowedToppingIds?: string[];
  isActive?: boolean;
}

export interface CreateExtraToppingPayload {
  slug: string;
  label: string;
  categorySlug: string;
  priceDelta: number;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateExtraToppingPayload = Partial<CreateExtraToppingPayload>;

export interface CreateToppingCategoryPayload {
  slug: string;
  label: string;
  sortOrder?: number;
}

export type UpdateToppingCategoryPayload = Partial<CreateToppingCategoryPayload>;

export interface CreateIngredientPayload {
  slug: string;
  label: string;
  categorySlug: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateIngredientPayload = Partial<CreateIngredientPayload>;

export interface CreateIngredientCategoryPayload {
  slug: string;
  label: string;
  sortOrder?: number;
}

export type UpdateIngredientCategoryPayload = Partial<CreateIngredientCategoryPayload>;

export interface CreateMenuCategoryPayload {
  slug: string;
  label: string;
  sortOrder?: number;
  supportsSizeOptions?: boolean;
  supportsExtras?: boolean;
  isActive?: boolean;
}

export type UpdateMenuCategoryPayload = Partial<CreateMenuCategoryPayload>;

export type UpdateMenuItemPayload = Partial<
  Omit<
    CreateMenuItemPayload,
    "slug" | "number" | "sizePricing" | "sizeOptions" | "priceNote" | "badges" | "ingredients" | "allowedToppingIds"
  >
> & {
  slug?: string;
  number?: number;
  isActive?: boolean;
  sizePricing?: { small: number; large: number; family: number } | null;
  sizeOptions?: SizeOptions | null;
  priceNote?: string | null;
  badges?: MenuItemBadge[];
  ingredients?: string[];
  allowedToppingIds?: string[];
};
