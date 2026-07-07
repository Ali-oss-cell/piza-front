import { BUNNY_BOYS_SLUG } from "@/types/brand";
import { fetchMenuCategories, fetchMenuItems } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";

export const dynamic = "force-dynamic";

export default async function BunnyBoysHome(): Promise<React.ReactElement> {
  const [apiItems, apiCategories] = await Promise.all([
    fetchMenuItems(BUNNY_BOYS_SLUG),
    fetchMenuCategories(BUNNY_BOYS_SLUG),
  ]);
  const menuItems = apiItems.map(mapApiMenuItem);
  const categories = mapApiMenuCategories(apiCategories);

  return (
    <HomePage
      brandName="Bunny Boys"
      brandSlug={BUNNY_BOYS_SLUG}
      categories={categories}
      menuItems={menuItems}
      tagline="Burgers, wings & good times"
    />
  );
}
