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
import { apiRequest } from "@/lib/api-client";

export function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchOrders(token: string): Promise<AdminOrder[]> {
  return apiRequest<AdminOrder[]>("/orders", { token });
}

export function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/orders/${orderId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export function fetchMenuItems(): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu");
}

export function fetchAdminMenuItems(token: string): Promise<AdminMenuItem[]> {
  return apiRequest<AdminMenuItem[]>("/menu/manage/all", { token });
}

export function createMenuItem(token: string, payload: CreateMenuItemPayload): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>("/menu", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateMenuItem(
  token: string,
  id: string,
  payload: UpdateMenuItemPayload
): Promise<AdminMenuItem> {
  return apiRequest<AdminMenuItem>(`/menu/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchAdminToppings(token: string): Promise<ToppingCategoryGroup[]> {
  return apiRequest<ToppingCategoryGroup[]>("/customizations/toppings/manage/all", { token });
}

export function createExtraTopping(
  token: string,
  payload: CreateExtraToppingPayload
): Promise<AdminExtraTopping> {
  return apiRequest("/customizations/toppings", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateExtraTopping(
  token: string,
  id: string,
  payload: UpdateExtraToppingPayload
): Promise<AdminExtraTopping> {
  return apiRequest(`/customizations/toppings/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteExtraTopping(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/toppings/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchToppingCategories(token: string): Promise<AdminToppingCategory[]> {
  return apiRequest<AdminToppingCategory[]>("/customizations/categories/manage/all", { token });
}

export function createToppingCategory(
  token: string,
  payload: CreateToppingCategoryPayload
): Promise<AdminToppingCategory> {
  return apiRequest<AdminToppingCategory>("/customizations/categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateToppingCategory(
  token: string,
  slug: string,
  payload: UpdateToppingCategoryPayload
): Promise<AdminToppingCategory> {
  return apiRequest<AdminToppingCategory>(`/customizations/categories/${slug}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteToppingCategory(token: string, slug: string): Promise<void> {
  return apiRequest<void>(`/customizations/categories/${slug}`, {
    method: "DELETE",
    token,
  });
}

export function fetchMenuCategories(token: string): Promise<AdminMenuCategoryRecord[]> {
  return apiRequest<AdminMenuCategoryRecord[]>("/menu/categories/manage/all", { token });
}

export function createMenuCategory(
  token: string,
  payload: CreateMenuCategoryPayload
): Promise<AdminMenuCategoryRecord> {
  return apiRequest<AdminMenuCategoryRecord>("/menu/categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateMenuCategory(
  token: string,
  slug: string,
  payload: UpdateMenuCategoryPayload
): Promise<AdminMenuCategoryRecord> {
  return apiRequest<AdminMenuCategoryRecord>(`/menu/categories/${slug}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteMenuCategory(token: string, slug: string): Promise<void> {
  return apiRequest<void>(`/menu/categories/${slug}`, {
    method: "DELETE",
    token,
  });
}

export function fetchAdminCrusts(token: string): Promise<AdminCrustOption[]> {
  return apiRequest<AdminCrustOption[]>("/customizations/crusts/manage/all", { token });
}

export function createCrustOption(
  token: string,
  payload: CreateCrustOptionPayload
): Promise<AdminCrustOption> {
  return apiRequest<AdminCrustOption>("/customizations/crusts", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateCrustOption(
  token: string,
  id: string,
  payload: UpdateCrustOptionPayload
): Promise<AdminCrustOption> {
  return apiRequest<AdminCrustOption>(`/customizations/crusts/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteCrustOption(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/crusts/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchAdminIngredients(token: string): Promise<IngredientCategoryGroup[]> {
  return apiRequest<IngredientCategoryGroup[]>("/customizations/ingredients/manage/all", {
    token,
  });
}

export function createIngredient(
  token: string,
  payload: CreateIngredientPayload
): Promise<AdminIngredient> {
  return apiRequest<AdminIngredient>("/customizations/ingredients", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateIngredient(
  token: string,
  id: string,
  payload: UpdateIngredientPayload
): Promise<AdminIngredient> {
  return apiRequest<AdminIngredient>(`/customizations/ingredients/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteIngredient(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/customizations/ingredients/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchIngredientCategories(token: string): Promise<AdminIngredientCategory[]> {
  return apiRequest<AdminIngredientCategory[]>(
    "/customizations/ingredient-categories/manage/all",
    { token }
  );
}

export function createIngredientCategory(
  token: string,
  payload: CreateIngredientCategoryPayload
): Promise<AdminIngredientCategory> {
  return apiRequest<AdminIngredientCategory>("/customizations/ingredient-categories", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateIngredientCategory(
  token: string,
  slug: string,
  payload: UpdateIngredientCategoryPayload
): Promise<AdminIngredientCategory> {
  return apiRequest<AdminIngredientCategory>(
    `/customizations/ingredient-categories/${slug}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }
  );
}

export function deleteIngredientCategory(token: string, slug: string): Promise<void> {
  return apiRequest<void>(`/customizations/ingredient-categories/${slug}`, {
    method: "DELETE",
    token,
  });
}

export function fetchStoreSettings(token: string): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings", { token });
}

export function updateStoreSettings(
  token: string,
  payload: UpdateStoreSettingsPayload
): Promise<StoreSettings> {
  return apiRequest<StoreSettings>("/settings", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchAdminDeals(token: string): Promise<Deal[]> {
  return apiRequest<Deal[]>("/deals/manage/all", { token });
}

export function createDeal(token: string, payload: CreateDealPayload): Promise<Deal> {
  return apiRequest<Deal>("/deals", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateDeal(token: string, id: string, payload: UpdateDealPayload): Promise<Deal> {
  return apiRequest<Deal>(`/deals/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteDeal(token: string, id: string): Promise<void> {
  return apiRequest<void>(`/deals/${id}`, {
    method: "DELETE",
    token,
  });
}
