import { DealsPageContent } from "@/components/features/deals/deals-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";
import { fetchDeals, fetchMenuItems } from "@/lib/menu-api";
import { mapApiMenuItem } from "@/lib/menu-mappers";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generateContentPageMetadata({
    pageKey: "deals",
    title: "Deals",
    pageLabel: "Pizza Deals",
    description:
      "Current pizza deals and specials from {storeName} in {suburb}. Save on pickup and delivery — order online.",
  });
}

export default async function DealsPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  let promoDeals: Awaited<ReturnType<typeof fetchDeals>> = [];
  let menuDeals: ReturnType<typeof mapApiMenuItem>[] = [];

  try {
    const [promos, menuItems] = await Promise.all([
      fetchDeals(brandSlug).catch(() => []),
      fetchMenuItems(brandSlug).catch(() => []),
    ]);
    promoDeals = promos;
    menuDeals = menuItems
      .filter((item) => item.isActive && item.categorySlug === "deals")
      .map(mapApiMenuItem)
      .sort((a, b) => a.number - b.number || a.name.localeCompare(b.name));
  } catch {
    // Render empty deals when API is briefly unreachable.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Deals | ${storeName}`} pageKey="deals" />
      <DealsPageContent menuDeals={menuDeals} promoDeals={promoDeals} />
    </>
  );
}
