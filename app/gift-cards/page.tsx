import type { Metadata } from "next";
import { MarketingPageContentView } from "@/components/features/marketing/marketing-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { marketingPages } from "@/data/marketing";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "gift-cards",
    title: "Gift Cards",
    description: "Gift cards from {storeName} — the perfect present for pizza lovers.",
  });
}

export default function GiftCardsPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Gift Cards | ${BENNY_BOYS_NAME}`} pageKey="gift-cards" />
      <MarketingPageContentView content={marketingPages["gift-cards"]} />
    </>
  );
}
