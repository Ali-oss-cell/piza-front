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
import type { Brand, CreatedStore, CreateStorePayload } from "@/types/brand";
import type {
  PaymentSettings,
  StoreDomain,
  UpdatePaymentSettingsPayload,
} from "@/types/payments";
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

export function createStore(token: string, payload: CreateStorePayload): Promise<CreatedStore> {
  return apiRequest<CreatedStore>("/brands", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function uploadLogo(
  token: string,
  file: File
): Promise<{ url: string; filename: string }> {
  const body = new FormData();
  body.append("file", file);

  // Same-origin proxy → API stores the file on the server (not a pasted URL).
  let response: Response;
  try {
    response = await fetch("/api/uploads/logo", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });
  } catch {
    throw new Error(
      "Could not upload logo (network error). Check that the website and API are running.",
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message ?? response.statusText;
    throw new Error(message || "Logo upload failed");
  }

  return response.json() as Promise<{ url: string; filename: string }>;
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

export function fetchPaymentSettings(
  token: string,
  brandSlug?: string
): Promise<PaymentSettings> {
  return apiRequest<PaymentSettings>("/payment-settings", {
    token,
    brandSlug: withBrand(brandSlug),
  });
}

export function updatePaymentSettings(
  token: string,
  payload: UpdatePaymentSettingsPayload,
  brandSlug?: string
): Promise<PaymentSettings> {
  return apiRequest<PaymentSettings>("/payment-settings", {
    method: "PUT",
    token,
    brandSlug: withBrand(brandSlug),
    body: JSON.stringify(payload),
  });
}

export function fetchStoreDomains(token: string, brandSlug: string): Promise<StoreDomain[]> {
  return apiRequest<StoreDomain[]>(`/brands/${encodeURIComponent(brandSlug)}/domains`, {
    token,
  });
}

export function updateStoreStatus(
  token: string,
  brandSlug: string,
  isActive: boolean
): Promise<Brand> {
  return apiRequest<Brand>(`/brands/${encodeURIComponent(brandSlug)}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ isActive }),
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

export function pushDealToStores(
  token: string,
  dealId: string,
  targetBrandSlugs: string[],
): Promise<{ pushed: string[]; failed: Array<{ slug: string; reason: string }> }> {
  return apiRequest(`/hq/deals/${dealId}/push`, {
    method: "POST",
    token,
    body: JSON.stringify({ targetBrandSlugs }),
  });
}

export function fetchHqOverview(
  token: string,
  params?: { from?: string; to?: string },
): Promise<import("@/types/hq").HqOverview> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const suffix = query.toString() ? `?${query}` : "";
  return apiRequest(`/hq/overview${suffix}`, { token });
}

export function fetchHqSalesReport(
  token: string,
  params?: { from?: string; to?: string; brand?: string },
): Promise<import("@/types/hq").HqSalesReport> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.brand) query.set("brand", params.brand);
  const suffix = query.toString() ? `?${query}` : "";
  return apiRequest(`/hq/reports/sales${suffix}`, { token });
}

export function hqSalesCsvUrl(params?: { from?: string; to?: string; brand?: string }): string {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.brand) query.set("brand", params.brand);
  const suffix = query.toString() ? `?${query}` : "";
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"}/hq/reports/sales.csv${suffix}`;
}

export function fetchOnboarding(
  token: string,
  brandSlug: string,
): Promise<import("@/types/hq").HqReadiness> {
  return apiRequest(`/hq/onboarding/${encodeURIComponent(brandSlug)}`, { token });
}

export function fetchHqDomains(token: string): Promise<import("@/types/hq").HqDomain[]> {
  return apiRequest("/hq/domains", { token });
}

export function createHqDomain(
  token: string,
  payload: {
    storeSlug: string;
    host?: string;
    pathPrefix?: string;
    isPrimary?: boolean;
  },
): Promise<import("@/types/hq").HqDomain> {
  return apiRequest("/hq/domains", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateHqDomain(
  token: string,
  id: string,
  payload: {
    host?: string | null;
    pathPrefix?: string | null;
    isPrimary?: boolean;
    isActive?: boolean;
  },
): Promise<import("@/types/hq").HqDomain> {
  return apiRequest(`/hq/domains/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchMenuTemplates(
  token: string,
): Promise<import("@/types/hq").HqMenuTemplate[]> {
  return apiRequest("/hq/menu-templates", { token });
}

export function createMenuTemplate(
  token: string,
  payload: {
    name: string;
    description?: string;
    sourceBrandSlug: string;
    lockItems?: boolean;
  },
): Promise<import("@/types/hq").HqMenuTemplate> {
  return apiRequest("/hq/menu-templates", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function applyMenuTemplate(
  token: string,
  id: string,
  targetBrandSlugs: string[],
  lockItems?: boolean,
): Promise<{ applied: string[]; failed: Array<{ slug: string; reason: string }> }> {
  return apiRequest(`/hq/menu-templates/${id}/apply`, {
    method: "POST",
    token,
    body: JSON.stringify({ targetBrandSlugs, lockItems }),
  });
}

export function transferMenu(
  token: string,
  payload: {
    sourceBrandSlug: string;
    targetBrandSlugs: string[];
    itemSlugs: string[];
    lockItems?: boolean;
    saveAsName?: string;
    saveAsDescription?: string;
  },
): Promise<{
  itemCount: number;
  applied: string[];
  failed: Array<{ slug: string; reason: string }>;
  templateId: string | null;
}> {
  return apiRequest("/hq/menu-transfer", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function searchHqCustomers(
  token: string,
  q: string,
  brand?: string,
): Promise<import("@/types/hq").HqCustomer[]> {
  const query = new URLSearchParams({ q });
  if (brand) query.set("brand", brand);
  return apiRequest(`/hq/customers?${query}`, { token });
}

export function fetchCustomerOrders(token: string, key: string): Promise<AdminOrder[]> {
  return apiRequest(`/hq/customers/${encodeURIComponent(key)}/orders`, { token });
}

export function fetchHqStoreHealth(
  token: string,
): Promise<import("@/types/hq").HqStoreHealth> {
  return apiRequest("/hq/health", { token });
}

export function fetchHqMemberships(
  token: string,
  brand?: string,
): Promise<import("@/types/hq").TeamMembership[]> {
  const query = brand ? `?brand=${encodeURIComponent(brand)}` : "";
  return apiRequest(`/hq/memberships${query}`, { token });
}

export function inviteHqMember(
  token: string,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    brandSlugs: string[];
    temporaryPassword?: string;
  },
): Promise<{
  invited: import("@/types/hq").TeamMembership[];
  failed: Array<{ slug: string; reason: string }>;
  temporaryPassword?: string;
}> {
  return apiRequest("/hq/memberships/invite", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateHqMembership(
  token: string,
  id: string,
  payload: { role?: string; isActive?: boolean; locationId?: string | null },
): Promise<import("@/types/hq").TeamMembership> {
  return apiRequest(`/hq/memberships/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchHqActivity(
  token: string,
  params?: { store?: string; limit?: number },
): Promise<import("@/types/hq").HqAuditEvent[]> {
  const query = new URLSearchParams();
  if (params?.store) query.set("store", params.store);
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query}` : "";
  return apiRequest(`/hq/activity${suffix}`, { token });
}

export function fetchTeam(
  token: string,
  brandSlug: string,
): Promise<import("@/types/hq").TeamMembership[]> {
  return apiRequest(`/team?brand=${encodeURIComponent(brandSlug)}`, { token });
}

export function inviteTeamMember(
  token: string,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    brandSlug: string;
    temporaryPassword?: string;
    locationId?: string;
  },
): Promise<{
  membership: import("@/types/hq").TeamMembership;
  temporaryPassword?: string;
}> {
  return apiRequest("/team/invite", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateTeamMember(
  token: string,
  id: string,
  payload: { role?: string; isActive?: boolean; locationId?: string | null },
): Promise<import("@/types/hq").TeamMembership> {
  return apiRequest(`/team/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function fetchAdminLocations(
  token: string,
  brandSlug: string,
): Promise<import("@/types/hq").AdminLocation[]> {
  return apiRequest(`/locations?brand=${encodeURIComponent(brandSlug)}`, { token });
}

export function createAdminLocation(
  token: string,
  payload: {
    brandSlug: string;
    name: string;
    suburb?: string;
    address?: string;
    phone?: string;
    email?: string;
    deliveryFee?: number;
    minOrderAmount?: number;
    isDefault?: boolean;
  },
): Promise<import("@/types/hq").AdminLocation> {
  return apiRequest("/locations", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateAdminLocation(
  token: string,
  id: string,
  payload: Partial<{
    name: string;
    suburb: string;
    address: string;
    phone: string;
    email: string;
    deliveryFee: number;
    minOrderAmount: number;
    isActive: boolean;
    isDefault: boolean;
    openingHours: unknown;
  }>,
): Promise<import("@/types/hq").AdminLocation> {
  return apiRequest(`/locations/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

