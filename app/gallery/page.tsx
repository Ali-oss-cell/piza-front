import type { Metadata } from "next";
import { GalleryPageContent } from "@/components/features/gallery/gallery-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "gallery",
    title: "Gallery",
    description: "Photos of pizza, pasta, and events from {storeName}.",
  });
}

export default function GalleryPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Gallery | ${BENNY_BOYS_NAME}`} pageKey="gallery" />
      <GalleryPageContent />
    </>
  );
}
