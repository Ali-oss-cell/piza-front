import { apiRequest } from "@/lib/api-client";
import type { AdminMenuItem, ToppingCategoryGroup } from "@/types/admin";
import type { AdminCrustOption, StoreSettings } from "@/types/store";
import type { Deal } from "@/types/deals";

export interface ApiMenuCategory {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  supportsSizeOptions: boolean;
  supportsExtras: boolean;
  isActive: boolean;
}

export function fetchMenuItems(): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu");
}

export function fetchMenuCategories(): Promise<ApiMenuCategory[]> {
  return apiRequest<ApiMenuCategory[]>("/menu/categories");
}

export function fetchMenuItemBySlug(slug: string): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>(`/menu/slug/${slug}`);
}

export function fetchToppings(): Promise<ToppingCategoryGroup[]> {
  return apiRequest<ToppingCategoryGroup[]>("/customizations/toppings");
}

export function fetchCrusts(): Promise<AdminCrustOption[]> {
  return apiRequest<AdminCrustOption[]>("/customizations/crusts");
}

export function fetchStoreSettings(): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings");
}

export function fetchDeals(): Promise<Deal[]> {
  return apiRequest<Deal[]>("/deals");
}
