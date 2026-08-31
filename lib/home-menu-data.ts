import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { fetchMenuCategories, fetchMenuItems, fetchStoreSettings, resolveStoreByHost } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { getRequestHost, isPrimaryWebHost } from "@/lib/request-host";
import {
  BENNY_BOYS_NAME,
  BENNY_BOYS_PRIMARY_COLOR,
  BENNY_BOYS_TAGLINE,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";
import type { CategoryTab } from "@/lib/menu-mappers";
import type { MenuItem } from "@/types/menu";

export interface HomeMenuData {
  brandSlug: string;
  menuItems: MenuItem[];
  categories: CategoryTab[];
  brandName: string;
  tagline?: string;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  primaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
}

async function resolveHomeBrandSlug(): Promise<string> {
  const host = await getRequestHost();
  if (!host || isPrimaryWebHost(host)) {
    return DEFAULT_BRAND_SLUG;
  }
  try {
    const store = await resolveStoreByHost(host);
    return store.slug;
  } catch {
    return DEFAULT_BRAND_SLUG;
  }
}

export async function fetchHomeMenuData(): Promise<HomeMenuData> {
  const brandSlug = await resolveHomeBrandSlug();

  try {
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(brandSlug),
      fetchMenuCategories(brandSlug),
      fetchStoreSettings(brandSlug),
    ]);

    return {
      brandSlug,
      menuItems: apiItems.map(mapApiMenuItem),
      categories: mapApiMenuCategories(apiCategories),
      brandName: settings.storeName,
      tagline: settings.tagline ?? undefined,
      heroImageUrl: settings.heroImageUrl,
      heroImageDarkUrl: settings.heroImageDarkUrl,
      primaryColor: settings.primaryColor,
      backgroundLightColor: settings.backgroundLightColor,
      backgroundDarkColor: settings.backgroundDarkColor,
    };
  } catch {
    return {
      brandSlug,
      menuItems: [],
      categories: [],
      brandName: BENNY_BOYS_NAME,
      tagline: BENNY_BOYS_TAGLINE,
      primaryColor: BENNY_BOYS_PRIMARY_COLOR,
    };
  }
}

export { resolveHomeBrandSlug };
