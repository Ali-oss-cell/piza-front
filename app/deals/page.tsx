import type { Metadata } from "next";
import { DealsPageContent } from "@/components/features/deals/deals-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { fetchDeals, fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const seo = await fetchSeoForPage(brandSlug, "deals", host);
  const settings = await fetchStoreSettings(brandSlug);
  return buildSeoMetadata(
    seo,
    {
      title: `Deals | ${settings.storeName}`,
      description: `Special offers from ${settings.storeName}`,
    },
    siteOriginFromHost(host),
  );
}

export default async function DealsPage(): Promise<React.ReactElement> {
  const { brandSlug } = await resolveBrandSlugForRequest();
  const settings = await fetchStoreSettings(brandSlug);

  try {
    const deals = await fetchDeals(brandSlug);
    return (
      <>
        <SeoMetaClient fallbackTitle={`Deals | ${settings.storeName}`} pageKey="deals" />
        <DealsPageContent deals={deals} />
      </>
    );
  } catch {
    return (
      <>
        <SeoMetaClient fallbackTitle={`Deals | ${settings.storeName}`} pageKey="deals" />
        <DealsPageContent deals={[]} />
      </>
    );
  }
}
