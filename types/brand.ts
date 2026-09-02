export const DEFAULT_BRAND_SLUG = "benny-boys";
export const BENNY_BOYS_SLUG = "benny-boys";

export const BENNY_BOYS_NAME = "Benny Boy's";
export const BENNY_BOYS_TAGLINE = "Bold flavours · Fresh bites";
export const BENNY_BOYS_HERO_LINE_1 = "BOLD FLAVOURS";
export const BENNY_BOYS_HERO_LINE_2 = "FRESH BITES";
export const BENNY_BOYS_ADDRESS =
  "100 Coleman Rd, Wantirna South VIC 3152, Australia";
export const BENNY_BOYS_LOGO_LIGHT = "/benny-boys-logo-light.svg";
export const BENNY_BOYS_LOGO_DARK = "/benny-boys-logo-dark.svg";
export const BENNY_BOYS_PRIMARY_COLOR = "#E85D04";
export const BENNY_BOYS_NEXTORDER_URL =
  "https://benny-boys-pizza-wantirna-south.nextorder.com/";

/** @deprecated Use BENNY_BOYS_SLUG */
export const BUNNY_BOYS_SLUG = BENNY_BOYS_SLUG;

export const ADMIN_BRAND_STORAGE_KEY = "marina-admin-brand";
export const SITE_BRAND_STORAGE_KEY = "marina-site-brand";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  darkModeEnabled?: boolean;
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
  logoDarkUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundLightColor?: string;
  backgroundDarkColor?: string;
  heroImageUrl?: string;
  heroImageDarkUrl?: string;
  darkModeEnabled?: boolean;
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
