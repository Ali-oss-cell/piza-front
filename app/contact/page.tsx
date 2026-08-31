import type { Metadata } from "next";
import { ContactPageContent } from "@/components/features/contact/contact-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "contact",
    title: "Contact",
    description: "Contact {storeName} — questions, feedback, catering, and order help.",
  });
}

export default async function ContactPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  return (
    <>
      <SeoMetaClient fallbackTitle={`Contact | ${storeName}`} pageKey="contact" />
      <ContactPageContent brandSlug={brandSlug} storeName={storeName} />
    </>
  );
}
