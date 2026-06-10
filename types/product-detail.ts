import type { MenuItem, PizzaSize } from "@/types/menu";

export interface ProductSizeOption {
  id: PizzaSize;
  label: string;
  price: number;
  deltaFromSmall: number;
}

export interface CrustOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ToppingOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ToppingCategory {
  id: string;
  label: string;
  toppings: ToppingOption[];
}

export interface ProductConfiguration {
  size: PizzaSize;
  crustId: string;
  toppingIds: string[];
  removedIngredients: string[];
  quantity: number;
}

export interface ProductDetailProps {
  item: MenuItem;
}

export interface PriceBreakdown {
  basePrice: number;
  crustDelta: number;
  toppingsTotal: number;
  unitPrice: number;
  totalPrice: number;
}
