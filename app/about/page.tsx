import type { Metadata } from "next";
import { AboutPage } from "@/components/features/about/about-page";
import SeoMetaClient from "@/components/SeoMetaClient";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import { suburbFromAddress } from "@/lib/store-contact";
import { BENNY_BOYS_NAME, BENNY_BOYS_TAGLINE, BENNY_BOYS_LOGO_LIGHT } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, "about", host),
      fetchStoreSettings(brandSlug),
    ]);
    const suburb = suburbFromAddress(settings.address) ?? "Wantirna South";
    return buildSeoMetadata(
      seo,
      {
        title: `About ${settings.storeName} | Pizza ${suburb}`,
        description:
          settings.tagline ??
          `Meet ${settings.storeName} in ${suburb} — local pizza made for pickup and delivery.`,
      },
      siteOriginFromHost(host),
    );
  } catch {
    return {
      title: `About | ${BENNY_BOYS_NAME}`,
      description: BENNY_BOYS_TAGLINE,
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

  try {
    const settings = await fetchStoreSettings(brandSlug);
    storeName = settings.storeName || storeName;
    address = settings.address ?? null;
    contactPhone = settings.contactPhone ?? null;
    openingHours = settings.openingHours ?? null;
    logoUrl = settings.logoUrl ?? null;
    heroImageUrl = settings.heroImageUrl ?? null;
  } catch {
    // Render static about content when API is briefly unreachable.
  }

  const image =
    heroImageUrl ||
    logoUrl ||
    `${origin}${BENNY_BOYS_LOGO_LIGHT}`;

  return (
    <>
      <SeoMetaClient fallbackTitle={`About | ${storeName}`} pageKey="about" />
      <LocalBusinessJsonLd
        address={address}
        image={image.startsWith("http") ? image : `${origin}${image}`}
        menuUrl={`${origin}/menu`}
        name={storeName}
        openingHours={openingHours}
        telephone={contactPhone}
        url={origin}
      />
      <AboutPage />
    </>
  );
}
