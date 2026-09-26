import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailPage } from "@/components/features/product-detail/product-detail-page";
import { MenuItemJsonLd } from "@/components/seo/JsonLd";
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
import { resolveBrandSlugForRequest, siteOriginFromHost } from "@/lib/seo-server";
import { resolveMediaUrl } from "@/lib/media-url";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    let apiItem;
    try {
      apiItem = await fetchMenuItemById(id);
    } catch {
      apiItem = await fetchMenuItemBySlug(id);
    }

    const imageUrl = apiItem.imageUrl ? resolveMediaUrl(apiItem.imageUrl) : null;

    return {
      title: apiItem.name,
      description: apiItem.description ?? apiItem.imageAlt ?? apiItem.name,
      openGraph: {
        title: apiItem.name,
        description: apiItem.description ?? undefined,
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
    };
  } catch {
    return { title: "Menu item" };
  }
}

export default async function ProductPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);

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
      <>
        <MenuItemJsonLd
          description={item.description}
          image={item.imageUrl ? resolveMediaUrl(item.imageUrl) : null}
          name={item.name}
          price={item.price}
          url={`${origin}/menu/${id}`}
        />
        <ProductDetailPage
          crustOptions={crustOptions}
          extrasLabel={showSizeOptions ? "Extra Toppings" : "Add Extras"}
          item={item}
          toppingCategories={toppingCategories}
        />
      </>
    );
  } catch {
    notFound();
  }
}
