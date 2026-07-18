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

export function fetchMenuItems(brandSlug?: string): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu", { brandSlug });
}

export function fetchMenuCategories(brandSlug?: string): Promise<ApiMenuCategory[]> {
  return apiRequest<ApiMenuCategory[]>("/menu/categories", { brandSlug });
}

export function fetchMenuItemById(id: string): Promise<AdminMenuItem & { brandSlug?: string }> {
  return apiRequest<AdminMenuItem & { brandSlug?: string }>(`/menu/${id}`);
}

export function fetchMenuItemBySlug(slug: string, brandSlug?: string): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>(`/menu/slug/${slug}`, { brandSlug });
}

export function fetchToppings(brandSlug?: string): Promise<ToppingCategoryGroup[]> {
  return apiRequest<ToppingCategoryGroup[]>("/customizations/toppings", { brandSlug });
}

export function fetchCrusts(brandSlug?: string): Promise<AdminCrustOption[]> {
  return apiRequest<AdminCrustOption[]>("/customizations/crusts", { brandSlug });
}

export function fetchStoreSettings(brandSlug?: string): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings", { brandSlug });
}

export function fetchDeals(brandSlug?: string): Promise<Deal[]> {
  return apiRequest<Deal[]>("/deals", { brandSlug });
}

export interface ResolvedStore {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  isActive: boolean;
  pathPrefix?: string | null;
  host?: string | null;
}

export function resolveStoreByPath(storePath: string): Promise<ResolvedStore> {
  const path = storePath.startsWith("/") ? storePath : `/${storePath}`;
  return apiRequest<ResolvedStore>(`/brands/resolve?path=${encodeURIComponent(path)}`);
}

export function resolveStoreByHost(host: string): Promise<ResolvedStore> {
  return apiRequest<ResolvedStore>(`/brands/resolve?host=${encodeURIComponent(host)}`);
}
