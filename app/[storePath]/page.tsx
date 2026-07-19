import { notFound } from "next/navigation";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { HomePage } from "@/components/features/home-page";
import {
  fetchMenuCategories,
  fetchMenuItems,
  resolveStoreByPath,
} from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";

/** Paths that already have dedicated App Router pages and must not be treated as stores. */
const RESERVED_STORE_PATHS = new Set([
  "admin",
  "about",
  "api",
  "cart",
  "checkout",
  "customize",
  "deals",
  "login",
  "locations",
  "menu",
  "track-order",
  "favicon.ico",
]);

interface StorefrontPageProps {
  params: Promise<{ storePath: string }>;
}

export const dynamic = "force-dynamic";

export default async function DynamicStorefrontPage({
  params,
}: StorefrontPageProps): Promise<React.ReactElement> {
  const { storePath } = await params;
  const normalized = storePath.trim().toLowerCase();

  if (!normalized || RESERVED_STORE_PATHS.has(normalized) || normalized.includes(".")) {
    notFound();
  }

  try {
    const store = await resolveStoreByPath(normalized);
    const [apiItems, apiCategories] = await Promise.all([
      fetchMenuItems(store.slug),
      fetchMenuCategories(store.slug),
    ]);

    return (
      <>
        <SiteBrandInit brandSlug={store.slug} />
        <HomePage
          brandName={store.name}
          brandSlug={store.slug}
          categories={mapApiMenuCategories(apiCategories)}
          heroImageUrl={store.heroImageUrl}
          menuItems={apiItems.map(mapApiMenuItem)}
          primaryColor={store.primaryColor}
          secondaryColor={store.secondaryColor}
          tagline={store.tagline ?? undefined}
        />
      </>
    );
  } catch {
    notFound();
  }
}
