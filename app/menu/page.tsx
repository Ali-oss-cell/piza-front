import type { Metadata } from "next";
import { HomePage } from "@/components/features/home-page";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import SeoMetaClient from "@/components/SeoMetaClient";
import { generateContentPageMetadata } from "@/lib/content-page-server";
import { fetchHomeMenuData } from "@/lib/home-menu-data";
import {
  BENNY_BOYS_NAME,
  BENNY_BOYS_PRIMARY_COLOR,
  BENNY_BOYS_TAGLINE,
} from "@/types/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "menu",
    title: "Menu",
    description: "Full menu from {storeName} — pizza, pasta, sides, and deals. Order pickup or delivery.",
  });
}

export default async function MenuPage(): Promise<React.ReactElement> {
  const data = await fetchHomeMenuData();

  if (data.menuItems.length === 0) {
    return (
      <>
        <SeoMetaClient fallbackTitle={`Menu | ${BENNY_BOYS_NAME}`} pageKey="menu" />
        <SiteBrandInit brandSlug={data.brandSlug} />
        <HomePage
          brandName={BENNY_BOYS_NAME}
          brandSlug={data.brandSlug}
          categories={[]}
          menuItems={[]}
          primaryColor={BENNY_BOYS_PRIMARY_COLOR}
          tagline={BENNY_BOYS_TAGLINE}
          variant="menu"
        />
      </>
    );
  }

  return (
    <>
      <SeoMetaClient fallbackTitle={`Menu | ${data.brandName}`} pageKey="menu" />
      <SiteBrandInit brandSlug={data.brandSlug} />
      <HomePage
        backgroundDarkColor={data.backgroundDarkColor}
        backgroundLightColor={data.backgroundLightColor}
        brandName={data.brandName}
        brandSlug={data.brandSlug}
        categories={data.categories}
        heroImageDarkUrl={data.heroImageDarkUrl}
        heroImageUrl={data.heroImageUrl}
        menuItems={data.menuItems}
        primaryColor={data.primaryColor}
        tagline={data.tagline}
        variant="menu"
      />
    </>
  );
}
