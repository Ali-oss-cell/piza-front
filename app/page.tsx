import { fetchMenuCategories, fetchMenuItems } from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";
import { HomePage } from "@/components/features/home-page";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.ReactElement> {
  const [apiItems, apiCategories] = await Promise.all([fetchMenuItems(), fetchMenuCategories()]);
  const menuItems = apiItems.map(mapApiMenuItem);
  const categories = mapApiMenuCategories(apiCategories);

  return <HomePage categories={categories} menuItems={menuItems} />;
}
