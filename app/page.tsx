import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { fetchMenuCategories, fetchMenuItems } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.ReactElement> {
  try {
    const [apiItems, apiCategories] = await Promise.all([
      fetchMenuItems(),
      fetchMenuCategories(),
    ]);
    const menuItems = apiItems.map(mapApiMenuItem);
    const categories = mapApiMenuCategories(apiCategories);

    return (
      <>
        <SiteBrandInit brandSlug={DEFAULT_BRAND_SLUG} />
        <HomePage categories={categories} menuItems={menuItems} />
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
