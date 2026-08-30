import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { fetchMenuCategories, fetchMenuItems, fetchStoreSettings, resolveStoreByHost } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";
import {
  getRequestHost,
  isPrimaryWebHost,
} from "@/lib/request-host";
import {
  BENNY_BOYS_NAME,
  BENNY_BOYS_PRIMARY_COLOR,
  BENNY_BOYS_TAGLINE,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";

export const dynamic = "force-dynamic";

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

export default async function Home(): Promise<React.ReactElement> {
  const brandSlug = await resolveHomeBrandSlug();

  try {
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(brandSlug),
      fetchMenuCategories(brandSlug),
      fetchStoreSettings(brandSlug),
    ]);
    const menuItems = apiItems.map(mapApiMenuItem);
    const categories = mapApiMenuCategories(apiCategories);

    return (
      <>
        <SiteBrandInit brandSlug={brandSlug} />
        <HomePage
          brandName={settings.storeName}
          brandSlug={brandSlug}
          categories={categories}
          heroImageUrl={settings.heroImageUrl}
          heroImageDarkUrl={settings.heroImageDarkUrl}
          menuItems={menuItems}
          primaryColor={settings.primaryColor}
          backgroundLightColor={settings.backgroundLightColor}
          backgroundDarkColor={settings.backgroundDarkColor}
          tagline={settings.tagline ?? undefined}
        />
      </>
    );
  } catch {
    return (
      <>
        <SiteBrandInit brandSlug={brandSlug} />
        <HomePage
          brandName={BENNY_BOYS_NAME}
          brandSlug={brandSlug}
          categories={[]}
          menuItems={[]}
          primaryColor={BENNY_BOYS_PRIMARY_COLOR}
          tagline={BENNY_BOYS_TAGLINE}
        />
      </>
    );
  }
}
