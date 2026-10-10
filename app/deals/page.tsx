import { DealsPageContent } from "@/components/features/deals/deals-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";
import { fetchComboDeals, fetchDeals, fetchMenuItems } from "@/lib/menu-api";
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
  let comboDeals: Awaited<ReturnType<typeof fetchComboDeals>> = [];
  let menuItems: ReturnType<typeof mapApiMenuItem>[] = [];

  try {
    const [promos, combos, apiMenu] = await Promise.all([
      fetchDeals(brandSlug).catch(() => []),
      fetchComboDeals(brandSlug).catch(() => []),
      fetchMenuItems(brandSlug).catch(() => []),
    ]);
    promoDeals = promos;
    comboDeals = combos;
    menuItems = apiMenu.filter((item) => item.isActive).map(mapApiMenuItem);
  } catch {
    // Render empty deals when API is briefly unreachable.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Deals | ${storeName}`} pageKey="deals" />
      <DealsPageContent
        comboDeals={comboDeals}
        menuItems={menuItems}
        promoDeals={promoDeals}
      />
    </>
  );
}
