import type { Metadata } from "next";
import { BlogSection } from "@/components/blog/BlogSection";
import SeoMetaClient from "@/components/SeoMetaClient";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const seo = await fetchSeoForPage(brandSlug, "blog", host);
  const settings = await fetchStoreSettings(brandSlug);
  return buildSeoMetadata(
    seo,
    {
      title: `Blog | ${settings.storeName}`,
      description: `News and updates from ${settings.storeName}`,
    },
    siteOriginFromHost(host),
    { googleSiteVerification: settings.googleSiteVerification },
  );
}

export default async function BlogPage(): Promise<React.ReactElement> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const settings = await fetchStoreSettings(brandSlug);

  return (
    <>
      <SeoMetaClient fallbackTitle={`Blog | ${settings.storeName}`} pageKey="blog" />
      <BlogSection brandSlug={brandSlug} host={host} />
    </>
  );
}
