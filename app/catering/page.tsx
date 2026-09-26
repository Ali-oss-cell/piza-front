import type { Metadata } from "next";
import { CateringPageContent } from "@/components/features/catering/catering-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "catering",
    title: "Catering",
    pageLabel: "Pizza Catering",
    description:
      "Pizza catering for corporate lunches, parties, and events from {storeName} in {suburb}. Feeds 10–500.",
  });
}

export default async function CateringPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  return (
    <>
      <SeoMetaClient fallbackTitle={`Catering | ${storeName}`} pageKey="catering" />
      <CateringPageContent brandSlug={brandSlug} storeName={storeName} />
    </>
  );
}
