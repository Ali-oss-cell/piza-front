import type { Metadata } from "next";
import { MarketingPageContentView } from "@/components/features/marketing/marketing-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { marketingPages } from "@/data/marketing";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "loyalty",
    title: "Loyalty",
    description: "Loyalty rewards coming soon from {storeName}.",
  });
}

export default function LoyaltyPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Loyalty | ${BENNY_BOYS_NAME}`} pageKey="loyalty" />
      <MarketingPageContentView content={marketingPages.loyalty} />
    </>
  );
}
