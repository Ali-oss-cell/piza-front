import type { Metadata } from "next";
import { FaqPageContent } from "@/components/features/faq/faq-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "faq",
    title: "FAQ",
    description: "Ordering, delivery, payments, and dietary questions — FAQ for {storeName}.",
  });
}

export default function FaqPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`FAQ | ${BENNY_BOYS_NAME}`} pageKey="faq" />
      <FaqPageContent />
    </>
  );
}
