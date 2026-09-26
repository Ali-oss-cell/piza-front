import { notFound } from "next/navigation";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { HomePage } from "@/components/features/home-page";
import {
  fetchMenuCategories,
  fetchMenuItems,
  fetchStoreSettings,
  resolveStoreByPath,
} from "@/lib/menu-api";
import { mapApiMenuCategories, mapApiMenuItem } from "@/lib/menu-mappers";

/** Paths that already have dedicated App Router pages and must not be treated as stores. */
const RESERVED_STORE_PATHS = new Set([
  "admin",
  "about",
  "allergens",
  "api",
  "blog",
  "careers",
  "cart",
  "catering",
  "checkout",
  "contact",
  "customize",
  "deals",
  "delivery",
  "faq",
  "functions",
  "gallery",
  "gift-cards",
  "help",
  "login",
  "locations",
  "loyalty",
  "menu",
  "nutrition",
  "order-online",
  "privacy",
  "reviews",
  "search",
  "seo-dashboard",
  "seo-login",
  "terms",
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
    const [apiItems, apiCategories, settings] = await Promise.all([
      fetchMenuItems(store.slug),
      fetchMenuCategories(store.slug),
      fetchStoreSettings(store.slug, store.locationId).catch(() => null),
    ]);

    return (
      <>
        <SiteBrandInit
          brandSlug={store.slug}
          locationId={store.locationId ?? null}
        />
        <HomePage
          address={settings?.address ?? null}
          backgroundDarkColor={
            settings?.backgroundDarkColor ?? store.backgroundDarkColor
          }
          backgroundLightColor={
            settings?.backgroundLightColor ?? store.backgroundLightColor
          }
          brandName={settings?.storeName ?? store.name}
          brandSlug={store.slug}
          categories={mapApiMenuCategories(apiCategories)}
          deliveryFee={settings?.deliveryFee}
          heroImageDarkUrl={settings?.heroImageDarkUrl ?? store.heroImageDarkUrl}
          heroImageUrl={settings?.heroImageUrl ?? store.heroImageUrl}
          logoDarkUrl={settings?.logoDarkUrl ?? store.logoDarkUrl}
          logoUrl={settings?.logoUrl ?? store.logoUrl}
          menuItems={apiItems.map(mapApiMenuItem)}
          openingHours={settings?.openingHours}
          primaryColor={settings?.primaryColor ?? store.primaryColor}
          storefrontLayout={settings?.storefrontLayout ?? "classic"}
          tagline={settings?.tagline ?? store.tagline ?? undefined}
        />
      </>
    );
  } catch {
    notFound();
  }
}
