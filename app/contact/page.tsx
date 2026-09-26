import type { Metadata } from "next";
import { ContactPageContent } from "@/components/features/contact/contact-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import { fetchStoreSettings } from "@/lib/menu-api";
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
    pageLabel: "Contact Pizza",
    description:
      "Contact {storeName} in {suburb}. Call, visit, or send a message about orders, catering, and more.",
  });
}

export default async function ContactPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
  ]);

  let address: string | null = null;
  let contactPhone: string | null = null;
  try {
    const settings = await fetchStoreSettings(brandSlug);
    address = settings.address ?? null;
    contactPhone = settings.contactPhone ?? null;
  } catch {
    // Page still renders without live phone/address.
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Contact | ${storeName}`} pageKey="contact" />
      <ContactPageContent
        address={address}
        brandSlug={brandSlug}
        contactPhone={contactPhone}
        storeName={storeName}
      />
    </>
  );
}
