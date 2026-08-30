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
import { BENNY_BOYS_NAME, BENNY_BOYS_TAGLINE } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, "about", host),
      fetchStoreSettings(brandSlug),
    ]);
    return buildSeoMetadata(
      seo,
      {
        title: `About | ${settings.storeName}`,
        description: settings.tagline ?? `About ${settings.storeName}`,
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
  let tagline = BENNY_BOYS_TAGLINE;
  let address: string | null = null;
  let contactPhone: string | null = null;

  try {
    const settings = await fetchStoreSettings(brandSlug);
    storeName = settings.storeName || storeName;
    tagline = settings.tagline ?? tagline;
    address = settings.address ?? null;
    contactPhone = settings.contactPhone ?? null;
  } catch {
    // Render static about content when API is briefly unreachable.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`About | ${storeName}`} pageKey="about" />
      <LocalBusinessJsonLd
        address={address}
        name={storeName}
        telephone={contactPhone}
        url={origin}
      />
      <AboutPage />
    </>
  );
}
