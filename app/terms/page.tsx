import type { Metadata } from "next";
import { LegalPageContent } from "@/components/features/legal/legal-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { termsSections } from "@/data/legal";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "terms",
    title: "Terms of Service",
    description: "Terms of service for ordering from {storeName}.",
  });
}

export default function TermsPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Terms | ${BENNY_BOYS_NAME}`} pageKey="terms" />
      <LegalPageContent
        hero={{
          eyebrow: "Legal",
          title: "Terms of Service",
          subtitle: "Terms that apply when you order from our website or store.",
        }}
        sections={termsSections}
      />
    </>
  );
}
