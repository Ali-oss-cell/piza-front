import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { fetchMenuCategories, fetchMenuItems, fetchStoreSettings } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.ReactElement> {
  try {
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(),
      fetchMenuCategories(),
      fetchStoreSettings(DEFAULT_BRAND_SLUG),
    ]);
    const menuItems = apiItems.map(mapApiMenuItem);
    const categories = mapApiMenuCategories(apiCategories);

    return (
      <>
        <SiteBrandInit brandSlug={DEFAULT_BRAND_SLUG} />
        <HomePage
          brandName={settings.storeName}
          brandSlug={DEFAULT_BRAND_SLUG}
          categories={categories}
          heroImageUrl={settings.heroImageUrl}
          menuItems={menuItems}
          primaryColor={settings.primaryColor}
          secondaryColor={settings.secondaryColor}
          tagline={settings.tagline ?? undefined}
        />
      </>
    );
  } catch {
    return (
      <>
        <SiteBrandInit brandSlug={DEFAULT_BRAND_SLUG} />
        <HomePage categories={[]} menuItems={[]} />
      </>
    );
  }
}
