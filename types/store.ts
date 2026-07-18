export interface StoreSettings {
  id: string;
  storeName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string | null;
  deliveryFee: string | number;
  minOrderAmount: string | number;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  openingHours?: Record<string, unknown> | null;
  updatedAt: string;
}

export interface AdminCrustOption {
  id: string;
  slug: string;
  label: string;
  priceDelta: string | number;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateCrustOptionPayload {
  slug: string;
  label: string;
  priceDelta: number;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCrustOptionPayload = Partial<CreateCrustOptionPayload>;

export interface UpdateStoreSettingsPayload {
  storeName?: string;
  tagline?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string | null;
  deliveryFee?: number;
  minOrderAmount?: number;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}
