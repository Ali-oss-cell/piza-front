import type { Metadata } from "next";
import { MarketingPageContentView } from "@/components/features/marketing/marketing-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { marketingPages } from "@/data/marketing";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "nutrition",
    title: "Nutrition",
    description: "Nutrition and portion information for {storeName}.",
  });
}

export default function NutritionPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Nutrition | ${BENNY_BOYS_NAME}`} pageKey="nutrition" />
      <MarketingPageContentView content={marketingPages.nutrition} />
    </>
  );
}
