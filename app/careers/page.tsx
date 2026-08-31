import type { Metadata } from "next";
import { CareersPageContent } from "@/components/features/careers/careers-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
} from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "careers",
    title: "Careers",
    description: "Join the team at {storeName} — kitchen, delivery, and counter roles.",
  });
}

export default async function CareersPage(): Promise<React.ReactElement> {
  const brandSlug = await getContentPageBrandSlug();

  return (
    <>
      <SeoMetaClient fallbackTitle={`Careers | ${BENNY_BOYS_NAME}`} pageKey="careers" />
      <CareersPageContent brandSlug={brandSlug} />
    </>
  );
}
