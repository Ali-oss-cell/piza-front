import type { Metadata } from "next";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import { BENNY_BOYS_NAME } from "@/types/brand";

interface ContentPageMetaOptions {
  pageKey: string;
  title: string;
  description: string;
}

export async function generateContentPageMetadata(
  options: ContentPageMetaOptions
): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, options.pageKey, host),
      fetchStoreSettings(brandSlug),
    ]);
    return buildSeoMetadata(
      seo,
      {
        title: `${options.title} | ${settings.storeName}`,
        description: options.description.replace("{storeName}", settings.storeName),
      },
      siteOriginFromHost(host)
    );
  } catch {
    return {
      title: `${options.title} | ${BENNY_BOYS_NAME}`,
      description: options.description.replace("{storeName}", BENNY_BOYS_NAME),
    };
  }
}

export async function getContentPageBrandSlug(): Promise<string> {
  const { brandSlug } = await resolveBrandSlugForRequest();
  return brandSlug;
}

export async function getContentPageStoreName(): Promise<string> {
  const { brandSlug } = await resolveBrandSlugForRequest();
  try {
    const settings = await fetchStoreSettings(brandSlug);
    return settings.storeName || BENNY_BOYS_NAME;
  } catch {
    return BENNY_BOYS_NAME;
  }
}
