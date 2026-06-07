import { DealsPageContent } from "@/components/features/deals/deals-page-content";
import { fetchDeals } from "@/lib/menu-api";

export const dynamic = "force-dynamic";

export default async function DealsPage(): Promise<React.ReactElement> {
  const deals = await fetchDeals();

  return <DealsPageContent deals={deals} />;
}
