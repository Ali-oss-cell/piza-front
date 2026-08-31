import type { Metadata } from "next";
import { AllergensPageContent } from "@/components/features/allergens/allergens-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "allergens",
    title: "Allergens",
    description: "Allergen and dietary information for {storeName}.",
  });
}

export default function AllergensPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Allergens | ${BENNY_BOYS_NAME}`} pageKey="allergens" />
      <AllergensPageContent />
    </>
  );
}
