"use client";

import { ClassicStorefront } from "@/components/features/storefront/classic-storefront";
import { MagazineStorefront } from "@/components/features/storefront/magazine-storefront";
import { MenuFirstStorefront } from "@/components/features/storefront/menu-first-storefront";
import { PortfolioStorefront } from "@/components/features/storefront/portfolio-storefront";
import type { HomePageProps } from "@/components/features/storefront/types";
import { parseStorefrontLayout } from "@/lib/storefront-layout";

export type { HomePageProps };

export function HomePage(props: HomePageProps): React.ReactElement {
  const layout = parseStorefrontLayout(props.storefrontLayout);

  if (layout === "menu_first") {
    return <MenuFirstStorefront {...props} />;
  }
  if (layout === "magazine") {
    return <MagazineStorefront {...props} />;
  }
  if (layout === "portfolio") {
    return <PortfolioStorefront {...props} />;
  }
  return <ClassicStorefront {...props} />;
}
