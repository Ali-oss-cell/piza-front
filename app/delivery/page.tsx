import type { Metadata } from "next";
import { DeliveryPageContent } from "@/components/features/delivery/delivery-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "delivery",
    title: "Delivery",
    pageLabel: "Pizza Delivery",
    description:
      "Pizza delivery and pickup from {storeName} in {suburb} — zones, fees, and how to order online.",
  });
}

export default function DeliveryPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Delivery | ${BENNY_BOYS_NAME}`} pageKey="delivery" />
      <DeliveryPageContent />
    </>
  );
}
