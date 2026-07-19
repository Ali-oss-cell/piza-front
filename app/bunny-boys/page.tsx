import { BUNNY_BOYS_SLUG } from "@/types/brand";
import { fetchMenuCategories, fetchMenuItems, fetchStoreSettings } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";

export const dynamic = "force-dynamic";

export default async function BunnyBoysHome(): Promise<React.ReactElement> {
  try {
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(BUNNY_BOYS_SLUG),
      fetchMenuCategories(BUNNY_BOYS_SLUG),
      fetchStoreSettings(BUNNY_BOYS_SLUG),
    ]);
    const menuItems = apiItems.map(mapApiMenuItem);
    const categories = mapApiMenuCategories(apiCategories);

    return (
      <HomePage
        brandName={settings.storeName || "Bunny Boys"}
        brandSlug={BUNNY_BOYS_SLUG}
        categories={categories}
        heroImageUrl={settings.heroImageUrl}
        menuItems={menuItems}
        primaryColor={settings.primaryColor}
        secondaryColor={settings.secondaryColor}
        tagline={settings.tagline ?? "Burgers, wings & good times"}
      />
    );
  } catch {
    return (
      <HomePage
        brandName="Bunny Boys"
        brandSlug={BUNNY_BOYS_SLUG}
        categories={[]}
        menuItems={[]}
        tagline="Burgers, wings & good times"
      />
    );
  }
}
