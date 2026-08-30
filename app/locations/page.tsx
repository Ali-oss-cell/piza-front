import type { Metadata } from "next";
import { LocationsPage } from "@/components/features/locations/locations-page";
import SeoMetaClient from "@/components/SeoMetaClient";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, "locations", host),
      fetchStoreSettings(brandSlug),
    ]);
    return buildSeoMetadata(
      seo,
      {
        title: `Locations | ${settings.storeName}`,
        description: `Find ${settings.storeName} locations and opening hours`,
      },
      siteOriginFromHost(host),
    );
  } catch {
    return {
      title: `Locations | ${BENNY_BOYS_NAME}`,
      description: `Find ${BENNY_BOYS_NAME} in Wantirna South`,
    };
  }
}

export default async function Page(): Promise<React.ReactElement> {
  const { brandSlug } = await resolveBrandSlugForRequest();
  let storeName = BENNY_BOYS_NAME;

  try {
    const settings = await fetchStoreSettings(brandSlug);
    storeName = settings.storeName || storeName;
  } catch {
    // Static locations page still renders without API.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Locations | ${storeName}`} pageKey="locations" />
      <LocationsPage />
    </>
  );
}
