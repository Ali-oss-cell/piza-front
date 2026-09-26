import { HomePage } from "@/components/features/home-page";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { fetchHomeMenuData } from "@/lib/home-menu-data";
import {
  BENNY_BOYS_NAME,
  BENNY_BOYS_PRIMARY_COLOR,
  BENNY_BOYS_TAGLINE,
} from "@/types/brand";

export const dynamic = "force-dynamic";

export default async function Home(): Promise<React.ReactElement> {
  const data = await fetchHomeMenuData();

  if (data.menuItems.length === 0 && data.categories.length === 0) {
    return (
      <>
        <SiteBrandInit
          brandSlug={data.brandSlug}
          locationId={data.locationId}
        />
        <HomePage
          brandName={BENNY_BOYS_NAME}
          brandSlug={data.brandSlug}
          categories={[]}
          menuItems={[]}
          primaryColor={BENNY_BOYS_PRIMARY_COLOR}
          storefrontLayout={data.storefrontLayout}
          tagline={BENNY_BOYS_TAGLINE}
        />
      </>
    );
  }

  return (
    <>
      <SiteBrandInit brandSlug={data.brandSlug} locationId={data.locationId} />
      <HomePage
        address={data.address}
        backgroundDarkColor={data.backgroundDarkColor}
        backgroundLightColor={data.backgroundLightColor}
        brandName={data.brandName}
        brandSlug={data.brandSlug}
        categories={data.categories}
        deliveryFee={data.deliveryFee}
        heroImageDarkUrl={data.heroImageDarkUrl}
        heroImageUrl={data.heroImageUrl}
        logoDarkUrl={data.logoDarkUrl}
        logoUrl={data.logoUrl}
        menuItems={data.menuItems}
        openingHours={data.openingHours}
        primaryColor={data.primaryColor}
        storefrontLayout={data.storefrontLayout}
        tagline={data.tagline}
      />
    </>
  );
}
