import type { Metadata } from "next";
import { LocationsPage } from "@/components/features/locations/locations-page";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import SeoMetaClient from "@/components/SeoMetaClient";
import { buildLocationsFromSettings, locationsFallback } from "@/data/locations";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import { suburbFromAddress } from "@/lib/store-contact";
import { BENNY_BOYS_NAME, BENNY_BOYS_LOGO_LIGHT } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, "locations", host),
      fetchStoreSettings(brandSlug),
    ]);
    const suburb = suburbFromAddress(settings.address) ?? "Wantirna South";
    const ogImage =
      seo.meta.ogImageUrl ||
      settings.heroImageUrl ||
      settings.logoUrl ||
      BENNY_BOYS_LOGO_LIGHT;
    return buildSeoMetadata(
      {
        ...seo,
        meta: {
          ...seo.meta,
          ogImageUrl: seo.meta.ogImageUrl || ogImage,
        },
      },
      {
        title: `Pizza Locations ${suburb} | ${settings.storeName}`,
        description: `Visit ${settings.storeName} in ${suburb}. Address, trading hours, and directions for pickup — or order delivery online.`,
      },
      origin,
      { canonicalPath: "/locations" },
    );
  } catch {
    return {
      title: `Pizza Locations Wantirna South | ${BENNY_BOYS_NAME}`,
      description: `Find ${BENNY_BOYS_NAME} in Wantirna South — address, hours, and directions.`,
    };
  }
}

export default async function Page(): Promise<React.ReactElement> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);

  let storeName = BENNY_BOYS_NAME;
  let address: string | null = null;
  let contactPhone: string | null = null;
  let openingHours: unknown = null;
  let logoUrl: string | null = null;
  let heroImageUrl: string | null = null;
  let locations = locationsFallback;

  try {
    const settings = await fetchStoreSettings(brandSlug);
    storeName = settings.storeName || storeName;
    address = settings.address ?? null;
    contactPhone = settings.contactPhone ?? null;
    openingHours = settings.openingHours ?? null;
    logoUrl = settings.logoUrl ?? null;
    heroImageUrl = settings.heroImageUrl ?? null;
    locations = buildLocationsFromSettings({
      storeName,
      address,
      phone: contactPhone,
      openingHours,
    });
  } catch {
    // Static fallback when API is briefly unreachable.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Locations | ${storeName}`} pageKey="locations" />
      <LocalBusinessJsonLd
        address={address}
        image={heroImageUrl || logoUrl || `${origin}${BENNY_BOYS_LOGO_LIGHT}`}
        menuUrl={`${origin}/menu`}
        name={storeName}
        openingHours={openingHours}
        telephone={contactPhone}
        url={origin}
      />
      <LocationsPage locations={locations} storeName={storeName} />
    </>
  );
}
