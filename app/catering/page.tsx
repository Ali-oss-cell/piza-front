import type { Metadata } from "next";
import { CateringPageContent } from "@/components/features/catering/catering-page-content";
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
      fetchSeoForPage(brandSlug, "catering", host),
      fetchStoreSettings(brandSlug),
    ]);
    return buildSeoMetadata(
      seo,
      {
        title: `Catering | ${settings.storeName}`,
        description: `Corporate lunches, parties & events — catering from ${settings.storeName}. Feeds 10–500 people.`,
      },
      siteOriginFromHost(host),
    );
  } catch {
    return {
      title: `Catering | ${BENNY_BOYS_NAME}`,
      description: `Catering for corporate lunches, parties and events — ${BENNY_BOYS_NAME}, Wantirna South.`,
    };
  }
}

export default async function CateringPage(): Promise<React.ReactElement> {
  const { brandSlug } = await resolveBrandSlugForRequest();

  let storeName = BENNY_BOYS_NAME;

  try {
    const settings = await fetchStoreSettings(brandSlug);
    storeName = settings.storeName || storeName;
  } catch {
    // Static catering page still renders without API.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Catering | ${storeName}`} pageKey="catering" />
      <CateringPageContent brandSlug={brandSlug} storeName={storeName} />
    </>
  );
}
