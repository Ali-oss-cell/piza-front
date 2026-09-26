import type { Metadata } from "next";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import {
  formatLocalPageDescription,
  formatLocalPageTitle,
  suburbFromAddress,
} from "@/lib/store-contact";
import { BENNY_BOYS_NAME } from "@/types/brand";

interface ContentPageMetaOptions {
  pageKey: string;
  /** Short page name used in fallbacks (e.g. "Menu"). */
  title: string;
  /**
   * Local-SEO title stem before suburb, e.g. "Pizza Delivery", "Menu", "Catering".
   * Defaults to `title`.
   */
  pageLabel?: string;
  /** Supports {storeName} and {suburb} placeholders. */
  description: string;
  /** Prefer hero/logo for og:image when SEO CMS has none. */
  preferOgFromSettings?: boolean;
}

export async function generateContentPageMetadata(
  options: ContentPageMetaOptions
): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, options.pageKey, host),
      fetchStoreSettings(brandSlug),
    ]);
    const suburb = suburbFromAddress(settings.address);
    const pageLabel = options.pageLabel ?? options.title;
    const fallbackTitle = formatLocalPageTitle(pageLabel, settings.storeName, suburb);
    const fallbackDescription = formatLocalPageDescription(
      options.description,
      settings.storeName,
      suburb
    );
    const ogImage =
      seo.meta.ogImageUrl ||
      (options.preferOgFromSettings
        ? settings.heroImageUrl || settings.logoUrl || undefined
        : undefined);

    return buildSeoMetadata(
      {
        ...seo,
        meta: {
          ...seo.meta,
          ogImageUrl: ogImage ?? seo.meta.ogImageUrl,
        },
      },
      {
        title: fallbackTitle,
        description: fallbackDescription,
      },
      origin
    );
  } catch {
    return {
      title: `${options.title} | ${BENNY_BOYS_NAME}`,
      description: options.description
        .replace(/\{storeName\}/g, BENNY_BOYS_NAME)
        .replace(/\{suburb\}/g, "Wantirna South"),
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

export async function getContentPageContact(): Promise<{
  brandSlug: string;
  storeName: string;
  address: string | null;
  contactPhone: string | null;
  openingHours: unknown;
  suburb: string | null;
  heroImageUrl: string | null;
  logoUrl: string | null;
}> {
  const { brandSlug } = await resolveBrandSlugForRequest();
  try {
    const settings = await fetchStoreSettings(brandSlug);
    return {
      brandSlug,
      storeName: settings.storeName || BENNY_BOYS_NAME,
      address: settings.address ?? null,
      contactPhone: settings.contactPhone ?? null,
      openingHours: settings.openingHours ?? null,
      suburb: suburbFromAddress(settings.address),
      heroImageUrl: settings.heroImageUrl ?? null,
      logoUrl: settings.logoUrl ?? null,
    };
  } catch {
    return {
      brandSlug,
      storeName: BENNY_BOYS_NAME,
      address: null,
      contactPhone: null,
      openingHours: null,
      suburb: "Wantirna South",
      heroImageUrl: null,
      logoUrl: null,
    };
  }
}
