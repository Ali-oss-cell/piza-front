import type { Metadata } from "next";
import { ReviewsPageContent } from "@/components/features/reviews/reviews-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "reviews",
    title: "Reviews",
    pageLabel: "Pizza Reviews",
    description:
      "Customer reviews for {storeName} in {suburb} — what locals say about our pizza, delivery, and catering.",
  });
}

export default function ReviewsPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Reviews | ${BENNY_BOYS_NAME}`} pageKey="reviews" />
      <ReviewsPageContent />
    </>
  );
}
