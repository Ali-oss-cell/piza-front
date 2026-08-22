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

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const seo = await fetchSeoForPage(brandSlug, "about", host);
  const settings = await fetchStoreSettings(brandSlug);
  return buildSeoMetadata(
    seo,
    {
      title: `About | ${settings.storeName}`,
      description: settings.tagline ?? `About ${settings.storeName}`,
    },
    siteOriginFromHost(host),
  );
}

export default async function Page(): Promise<React.ReactElement> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const settings = await fetchStoreSettings(brandSlug);
  const origin = siteOriginFromHost(host);

  return (
    <>
      <SeoMetaClient fallbackTitle={`About | ${settings.storeName}`} pageKey="about" />
      <LocalBusinessJsonLd
        address={settings.address}
        name={settings.storeName}
        telephone={settings.contactPhone}
        url={origin}
      />
      <AboutPage />
    </>
  );
}
