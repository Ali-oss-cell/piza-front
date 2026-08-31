import type { Metadata } from "next";
import { MarketingPageContentView } from "@/components/features/marketing/marketing-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { marketingPages } from "@/data/marketing";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "functions",
    title: "Functions & Events",
    description: "Functions and event catering from {storeName}.",
  });
}

export default function FunctionsPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Functions | ${BENNY_BOYS_NAME}`} pageKey="functions" />
      <MarketingPageContentView content={marketingPages.functions} />
    </>
  );
}
