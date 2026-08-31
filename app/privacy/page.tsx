import type { Metadata } from "next";
import { LegalPageContent } from "@/components/features/legal/legal-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { privacySections } from "@/data/legal";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "privacy",
    title: "Privacy Policy",
    description: "Privacy policy for {storeName} online ordering and website.",
  });
}

export default function PrivacyPage(): React.ReactElement {
  return (
    <>
      <SeoMetaClient fallbackTitle={`Privacy | ${BENNY_BOYS_NAME}`} pageKey="privacy" />
      <LegalPageContent
        hero={{
          eyebrow: "Legal",
          title: "Privacy Policy",
          subtitle: "How we collect, use, and protect your personal information.",
        }}
        sections={privacySections}
      />
    </>
  );
}
