import type { MenuItemBadge } from "@/lib/menu-badges";

export type MenuCategory = string;

export type PizzaSize = "S" | "L" | "F";

export interface SizePricing {
  small: number;
  large: number;
  family: number;
}

export interface AddToCartPayload {
  item: MenuItem;
  price: number;
  size?: PizzaSize;
  crust?: string;
  toppings?: string[];
  removedIngredients?: string[];
  quantity?: number;
}

export interface MenuItem {
  id: string;
  apiId?: string;
  slug?: string;
  number: number;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  imageAlt: string;
  badges?: MenuItemBadge[];
  sizePricing?: SizePricing;
  priceNote?: string;
  ingredients?: string[];
  allowedToppingIds?: string[];
}

export interface CartItem {
  id: string;
  itemId: string;
  menuItemId?: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  imageAlt: string;
  size?: PizzaSize;
  crust?: string;
  toppings?: string[];
  removedIngredients?: string[];
}

export type DeliveryMode = "delivery" | "pickup";
