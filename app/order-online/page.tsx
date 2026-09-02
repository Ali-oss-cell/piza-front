import type { Metadata } from "next";
import { NextOrderEmbed } from "@/components/features/nextorder/nextorder-embed";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageStoreName,
} from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "order-online",
    title: "Order Online",
    description:
      "Order pickup or delivery from {storeName} — pizza, pasta, deals, and sides.",
  });
}

export default async function OrderOnlinePage(): Promise<React.ReactElement> {
  let storeName = BENNY_BOYS_NAME;
  try {
    storeName = await getContentPageStoreName();
  } catch {
    // use fallback name
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Order Online | ${storeName}`} pageKey="order-online" />
      <NextOrderEmbed />
    </>
  );
}
