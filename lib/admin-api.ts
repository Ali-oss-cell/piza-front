import type { AuthResponse, LoginCredentials } from "@/types/auth";
import type {
  AdminExtraTopping,
  AdminIngredient,
  AdminIngredientCategory,
  AdminMenuCategoryRecord,
  AdminMenuItem,
  AdminOrder,
  AdminToppingCategory,
  CreateExtraToppingPayload,
  CreateIngredientCategoryPayload,
  CreateIngredientPayload,
  CreateMenuCategoryPayload,
  CreateMenuItemPayload,
  CreateToppingCategoryPayload,
  IngredientCategoryGroup,
  OrderStatus,
  ToppingCategoryGroup,
  UpdateExtraToppingPayload,
  UpdateIngredientCategoryPayload,
  UpdateIngredientPayload,
  UpdateMenuCategoryPayload,
  UpdateMenuItemPayload,
  UpdateToppingCategoryPayload,
} from "@/types/admin";
import type { CreateDealPayload, Deal, UpdateDealPayload } from "@/types/deals";
import type {
  AdminCrustOption,
  CreateCrustOptionPayload,
  StoreSettings,
  UpdateCrustOptionPayload,
  UpdateStoreSettingsPayload,
} from "@/types/store";
import type { Brand } from "@/types/brand";
import { apiRequest } from "@/lib/api-client";
import { getAdminBrandSlug } from "@/lib/brand-storage";

function withBrand(brandSlug?: string): string | undefined {
  return brandSlug ?? getAdminBrandSlug() ?? undefined;
}

export function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchBrands(token: string): Promise<Brand[]> {
  return apiRequest<Brand[]>("/brands", { token });
}

export function fetchOrders(token: string, brandSlug?: string): Promise<AdminOrder[]> {
  return apiRequest<AdminOrder[]>("/orders", { token, brandSlug: withBrand(brandSlug) });
}

export function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
  brandSlug?: string
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/orders/${orderId}`, {
    method: "PATCH",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify({ status }),
  });
}

export function fetchMenuItems(brandSlug?: string): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu", { brandSlug: withBrand(brandSlug) });
}

export function fetchAdminMenuItems(token: string, brandSlug?: string): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createMenuItem(
  token: string,
  payload: CreateMenuItemPayload,
  brandSlug?: string
): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>("/menu", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateMenuItem(
  token: string,
  id: string,
  payload: UpdateMenuItemPayload,
  brandSlug?: string
): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>(`/menu/${id}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function fetchAdminToppings(
  token: string,
  brandSlug?: string
): Promise<ToppingCategoryGroup[]> {
  return apiRequest<ToppingCategoryGroup[]>("/customizations/toppings/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createExtraTopping(
  token: string,
  payload: CreateExtraToppingPayload,
  brandSlug?: string
): Promise<AdminExtraTopping> {
  return apiRequest("/customizations/toppings", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateExtraTopping(
  token: string,
  id: string,
  payload: UpdateExtraToppingPayload,
  brandSlug?: string
): Promise<AdminExtraTopping> {
  return apiRequest(`/customizations/toppings/${id}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteExtraTopping(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/toppings/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchToppingCategories(
  token: string,
  brandSlug?: string
): Promise<AdminToppingCategory[]> {
  return apiRequest<AdminToppingCategory[]>("/customizations/categories/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createToppingCategory(
  token: string,
  payload: CreateToppingCategoryPayload,
  brandSlug?: string
): Promise<AdminToppingCategory> {
  return apiRequest<AdminToppingCategory>("/customizations/categories", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateToppingCategory(
  token: string,
  slug: string,
  payload: UpdateToppingCategoryPayload,
  brandSlug?: string
): Promise<AdminToppingCategory> {
  return apiRequest<AdminToppingCategory>(`/customizations/categories/${slug}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteToppingCategory(
  token: string,
  slug: string,
  brandSlug?: string
): Promise<void> {
  return apiRequest<void>(`/customizations/categories/${slug}`, {
    method: "DELETE",
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function fetchMenuCategories(
  token: string,
  brandSlug?: string
): Promise<AdminMenuCategoryRecord[]> {
  return apiRequest<AdminMenuCategoryRecord[]>("/menu/categories/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createMenuCategory(
  token: string,
  payload: CreateMenuCategoryPayload,
  brandSlug?: string
): Promise<AdminMenuCategoryRecord> {
  return apiRequest<AdminMenuCategoryRecord>("/menu/categories", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateMenuCategory(
  token: string,
  slug: string,
  payload: UpdateMenuCategoryPayload,
  brandSlug?: string
): Promise<AdminMenuCategoryRecord> {
  return apiRequest<AdminMenuCategoryRecord>(`/menu/categories/${slug}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteMenuCategory(
  token: string,
  slug: string,
  brandSlug?: string
): Promise<void> {
  return apiRequest<void>(`/menu/categories/${slug}`, {
    method: "DELETE",
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function fetchAdminCrusts(token: string, brandSlug?: string): Promise<AdminCrustOption[]> {
  return apiRequest<AdminCrustOption[]>("/customizations/crusts/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createCrustOption(
  token: string,
  payload: CreateCrustOptionPayload,
  brandSlug?: string
): Promise<AdminCrustOption> {
  return apiRequest<AdminCrustOption>("/customizations/crusts", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateCrustOption(
  token: string,
  id: string,
  payload: UpdateCrustOptionPayload,
  brandSlug?: string
): Promise<AdminCrustOption> {
  return apiRequest<AdminCrustOption>(`/customizations/crusts/${id}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteCrustOption(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/crusts/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchAdminIngredients(
  token: string,
  brandSlug?: string
): Promise<IngredientCategoryGroup[]> {
  return apiRequest<IngredientCategoryGroup[]>("/customizations/ingredients/manage/all", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function createIngredient(
  token: string,
  payload: CreateIngredientPayload,
  brandSlug?: string
): Promise<AdminIngredient> {
  return apiRequest<AdminIngredient>("/customizations/ingredients", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateIngredient(
  token: string,
  id: string,
  payload: UpdateIngredientPayload,
  brandSlug?: string
): Promise<AdminIngredient> {
  return apiRequest<AdminIngredient>(`/customizations/ingredients/${id}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteIngredient(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/ingredients/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchIngredientCategories(
  token: string,
  brandSlug?: string
): Promise<AdminIngredientCategory[]> {
  return apiRequest<AdminIngredientCategory[]>(
    "/customizations/ingredient-categories/manage/all",
    { token, brandSlug: withBrand(brandSlug) }
  );
}

export function createIngredientCategory(
  token: string,
  payload: CreateIngredientCategoryPayload,
  brandSlug?: string
): Promise<AdminIngredientCategory> {
  return apiRequest<AdminIngredientCategory>("/customizations/ingredient-categories", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateIngredientCategory(
  token: string,
  slug: string,
  payload: UpdateIngredientCategoryPayload,
  brandSlug?: string
): Promise<AdminIngredientCategory> {
  return apiRequest<AdminIngredientCategory>(
    `/customizations/ingredient-categories/${slug}`,
    {
      method: "PUT",
      token,
      brandSlug: withBrand(brandSlug),
      body: JSON.stringify(payload),
    }
  );
}

export function deleteIngredientCategory(
  token: string,
  slug: string,
  brandSlug?: string
): Promise<void> {
  return apiRequest<void>(`/customizations/ingredient-categories/${slug}`, {
    method: "DELETE",
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function fetchStoreSettings(token: string, brandSlug?: string): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings", { token, brandSlug: withBrand(brandSlug) });
}

export function updateStoreSettings(
  token: string,
  payload: UpdateStoreSettingsPayload,
  brandSlug?: string
): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings", {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function fetchAdminDeals(token: string, brandSlug?: string): Promise<Deal[]> {
  return apiRequest<Deal[]>("/deals/manage/all", { token, brandSlug: withBrand(brandSlug) });
}

export function createDeal(
  token: string,
  payload: CreateDealPayload,
  brandSlug?: string
): Promise<Deal> {
  return apiRequest<Deal>("/deals", {
    method: "POST",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function updateDeal(
  token: string,
  id: string,
  payload: UpdateDealPayload,
  brandSlug?: string
): Promise<Deal> {
  return apiRequest<Deal>(`/deals/${id}`, {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function deleteDeal(token: string, id: string, brandSlug?: string): Promise<void> {
  return apiRequest<void>(`/deals/${id}`, {
    method: "DELETE",
    token,
    brandSlug: withBrand(brandSlug),
  });
}
