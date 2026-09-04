import type { Metadata } from "next";
import { TrackOrderPageContent } from "@/components/features/track-order/track-order-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "track-order",
    title: "Track Order",
    description: "Track your {storeName} order or get help from the Wantirna South team.",
  });
}

export default function TrackOrderPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Track Order | ${BENNY_BOYS_NAME}`} pageKey="track-order" />
      <TrackOrderPageContent />
    </>
  );
}
