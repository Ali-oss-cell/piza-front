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
}
