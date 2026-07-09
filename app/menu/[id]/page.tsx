import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/features/product-detail/product-detail-page";
import {
  fetchCrusts,
  fetchMenuCategories,
  fetchMenuItemById,
  fetchMenuItemBySlug,
  fetchToppings,
} from "@/lib/menu-api";
import { hasExtras, hasSizePricing } from "@/lib/menu-categories";
import {
  filterToppingsForItem,
  mapApiCrusts,
  mapApiMenuItem,
} from "@/lib/menu-mappers";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  try {
    let apiItem;

    try {
      apiItem = await fetchMenuItemById(id);
    } catch {
      apiItem = await fetchMenuItemBySlug(id);
    }

    const brandSlug = apiItem.brandSlug;

    const [toppingGroups, apiCrusts, categories] = await Promise.all([
      fetchToppings(brandSlug),
      fetchCrusts(brandSlug),
      fetchMenuCategories(brandSlug),
    ]);

    const item = mapApiMenuItem(apiItem);
    const showSizeOptions = hasSizePricing(item.category, categories);
    const showExtras = hasExtras(item.category, categories);

    const toppingCategories = showExtras
      ? filterToppingsForItem(toppingGroups, apiItem.allowedToppingIds ?? [])
      : [];
    const crustOptions = showSizeOptions ? mapApiCrusts(apiCrusts) : [];

    return (
      <ProductDetailPage
        crustOptions={crustOptions}
        extrasLabel={showSizeOptions ? "Extra Toppings" : "Add Extras"}
        item={item}
        toppingCategories={toppingCategories}
      />
    );
  } catch {
    notFound();
  }
}
