import type { Metadata } from "next";
import { CareersPageContent } from "@/components/features/careers/careers-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "careers",
    title: "Careers",
    description: "Join the team at {storeName} — kitchen, delivery, and counter roles.",
  });
}

export default async function CareersPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  return (
    <>
      <SeoMetaClient fallbackTitle={`Careers | ${storeName}`} pageKey="careers" />
      <CareersPageContent brandSlug={brandSlug} />
    </>
  );
}
