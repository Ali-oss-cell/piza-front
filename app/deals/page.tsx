import { DealsPageContent } from "@/components/features/deals/deals-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";
import { fetchDeals } from "@/lib/menu-api";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generateContentPageMetadata({
    pageKey: "deals",
    title: "Deals",
    description: "Special offers from {storeName}",
  });
}

export default async function DealsPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  let deals: Awaited<ReturnType<typeof fetchDeals>> = [];
  try {
    deals = await fetchDeals(brandSlug);
  } catch {
    // Render empty deals when API is briefly unreachable.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Deals | ${storeName}`} pageKey="deals" />
      <DealsPageContent deals={deals} />
    </>
  );
}
