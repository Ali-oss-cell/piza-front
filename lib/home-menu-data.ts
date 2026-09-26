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
  locationId: string | null;
  menuItems: MenuItem[];
  categories: CategoryTab[];
  brandName: string;
  tagline?: string;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  primaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
  storefrontLayout?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  address?: string | null;
  deliveryFee?: string | number;
  openingHours?: unknown;
}

async function resolveHomeBrand(): Promise<{
  brandSlug: string;
  locationId: string | null;
}> {
  const host = await getRequestHost();
  if (!host || isPrimaryWebHost(host)) {
    return { brandSlug: DEFAULT_BRAND_SLUG, locationId: null };
  }
  try {
    const store = await resolveStoreByHost(host);
    return {
      brandSlug: store.slug,
      locationId: store.locationId ?? null,
    };
  } catch {
    return { brandSlug: DEFAULT_BRAND_SLUG, locationId: null };
  }
}

export async function fetchHomeMenuData(): Promise<HomeMenuData> {
  const { brandSlug, locationId } = await resolveHomeBrand();

  try {
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(brandSlug),
      fetchMenuCategories(brandSlug),
      fetchStoreSettings(brandSlug, locationId),
    ]);

    return {
      brandSlug,
      locationId,
      menuItems: apiItems.map(mapApiMenuItem),
      categories: mapApiMenuCategories(apiCategories),
      brandName: settings.storeName,
      tagline: settings.tagline ?? undefined,
      heroImageUrl: settings.heroImageUrl,
      heroImageDarkUrl: settings.heroImageDarkUrl,
      primaryColor: settings.primaryColor,
      backgroundLightColor: settings.backgroundLightColor,
      backgroundDarkColor: settings.backgroundDarkColor,
      storefrontLayout: settings.storefrontLayout ?? "classic",
      logoUrl: settings.logoUrl,
      logoDarkUrl: settings.logoDarkUrl,
      address: settings.address,
      deliveryFee: settings.deliveryFee,
      openingHours: settings.openingHours,
    };
  } catch {
    return {
      brandSlug,
      locationId,
      menuItems: [],
      categories: [],
      brandName: BENNY_BOYS_NAME,
      tagline: BENNY_BOYS_TAGLINE,
      primaryColor: BENNY_BOYS_PRIMARY_COLOR,
      storefrontLayout: "classic",
    };
  }
}

export { resolveHomeBrand };
