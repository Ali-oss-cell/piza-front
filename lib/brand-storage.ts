import {
  ADMIN_BRAND_STORAGE_KEY,
  DEFAULT_BRAND_SLUG,
  SITE_BRAND_STORAGE_KEY,
} from "@/types/brand";

export function getAdminBrandSlug(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ADMIN_BRAND_STORAGE_KEY);
}

export function setAdminBrandSlug(slug: string): void {
  window.localStorage.setItem(ADMIN_BRAND_STORAGE_KEY, slug);
  window.dispatchEvent(new Event("marina-admin-brand-change"));
}

export function clearAdminBrandSlug(): void {
  window.localStorage.removeItem(ADMIN_BRAND_STORAGE_KEY);
  window.dispatchEvent(new Event("marina-admin-brand-change"));
}

export function getSiteBrandSlug(): string {
  if (typeof window === "undefined") {
    return DEFAULT_BRAND_SLUG;
  }

  return window.localStorage.getItem(SITE_BRAND_STORAGE_KEY) ?? DEFAULT_BRAND_SLUG;
}

export function setSiteBrandSlug(slug: string): void {
  window.localStorage.setItem(SITE_BRAND_STORAGE_KEY, slug);
  window.dispatchEvent(new Event("marina-site-brand-change"));
}
