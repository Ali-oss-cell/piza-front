export const DEFAULT_BRAND_SLUG = "leovorno";
export const BUNNY_BOYS_SLUG = "bunny-boys";
export const ADMIN_BRAND_STORAGE_KEY = "marina-admin-brand";
export const SITE_BRAND_STORAGE_KEY = "marina-site-brand";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  isActive: boolean;
  status?: "DRAFT" | "LIVE";
  pathPrefix?: string | null;
  host?: string | null;
}

export interface CreateStoreLocationPayload {
  name: string;
  suburb?: string;
  address?: string;
  phone?: string;
  email?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
}

export interface CreateStorePayload {
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  primaryColor?: string;
  pathPrefix?: string;
  host?: string;
  createStarterCategories?: boolean;
  location: CreateStoreLocationPayload;
}

export interface CreatedStore extends Brand {
  locations?: Array<{ id: string; slug: string; name: string }>;
  domains?: Array<{ id: string; host?: string | null; pathPrefix?: string | null }>;
  menuCategories?: Array<{ id: string; slug: string; label: string }>;
}
