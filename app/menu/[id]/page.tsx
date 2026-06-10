import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/features/product-detail/product-detail-page";
import { fetchCrusts, fetchMenuItemBySlug, fetchToppings } from "@/lib/menu-api";
import {
  filterToppingsForItem,
  mapApiCrusts,
  mapApiMenuItem,
  mapApiToppings,
} from "@/lib/menu-mappers";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { id: slug } = await params;

  try {
    const [apiItem, toppingGroups, apiCrusts] = await Promise.all([
      fetchMenuItemBySlug(slug),
      fetchToppings(),
      fetchCrusts(),
    ]);

    const item = mapApiMenuItem(apiItem);
    const hasSizeOptions = Boolean(item.sizePricing);

    const toppingCategories = hasSizeOptions
      ? filterToppingsForItem(toppingGroups, apiItem.allowedToppingIds ?? [])
      : [];
    const crustOptions = hasSizeOptions ? mapApiCrusts(apiCrusts) : [];

    return (
      <ProductDetailPage
        crustOptions={crustOptions}
        item={item}
        toppingCategories={toppingCategories}
      />
    );
  } catch {
    notFound();
  }
}
