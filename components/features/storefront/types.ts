import type { CategoryTab } from "@/lib/menu-mappers";
import type { StorefrontLayoutId } from "@/lib/storefront-layout";
import type { MenuItem } from "@/types/menu";

export interface StorefrontProps {
  menuItems: MenuItem[];
  categories: CategoryTab[];
  brandName?: string;
  brandSlug?: string;
  tagline?: string;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  primaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  address?: string | null;
  deliveryFee?: string | number | null;
  openingHours?: unknown;
  variant?: "home" | "menu";
}

export interface HomePageProps extends StorefrontProps {
  storefrontLayout?: StorefrontLayoutId | string | null;
}
