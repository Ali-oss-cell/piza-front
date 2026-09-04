"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/features/cart-drawer";
import { MenuSheet } from "@/components/features/menu-sheet";
import { SiteFooter } from "@/components/features/site-footer";
import { SiteHeader } from "@/components/features/site-header";
import { StoreThemeProvider } from "@/components/layout/store-theme-provider";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import { useCart } from "@/lib/cart-context";
import { fetchStoreSettings } from "@/lib/menu-api";
import {
  DEFAULT_BG_DARK,
  DEFAULT_BG_LIGHT,
  PLATFORM_ACCENT,
} from "@/lib/store-theme";
import {
  BENNY_BOYS_ADDRESS,
  BENNY_BOYS_LOGO_DARK,
  BENNY_BOYS_LOGO_LIGHT,
  BENNY_BOYS_NAME,
  BENNY_BOYS_TAGLINE,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";

function isStandaloneRoute(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seo-login") ||
    pathname.startsWith("/seo-dashboard")
  );
}

function homeHrefForSlug(slug: string): string {
  if (slug === DEFAULT_BRAND_SLUG) {
    return "/";
  }
  return `/${slug}`;
}

/** Bundled Benny Boy's logos for marinapizzas.com.au storefront. */
const BENNY_LOGO_LIGHT = BENNY_BOYS_LOGO_LIGHT;
const BENNY_LOGO_DARK = BENNY_BOYS_LOGO_DARK;
const DEFAULT_PRIMARY = PLATFORM_ACCENT;
const DEFAULT_SECONDARY = "#111827";
const DEFAULT_BG_LIGHT_COLOR = DEFAULT_BG_LIGHT;
const DEFAULT_BG_DARK_COLOR = DEFAULT_BG_DARK;

function defaultLogosForSlug(slug: string): {
  logoUrl: string | null;
  logoDarkUrl: string | null;
} {
  if (slug === DEFAULT_BRAND_SLUG) {
    return { logoUrl: BENNY_LOGO_LIGHT, logoDarkUrl: BENNY_LOGO_DARK };
  }
  return { logoUrl: null, logoDarkUrl: null };
}

export interface InitialSiteBranding {
  brandSlug: string;
  brandName: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  tagline?: string | null;
  address?: string | null;
  openingHours?: unknown;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
  darkModeEnabled?: boolean;
}

export function AppShell({
  children,
  initialBranding,
}: {
  children: React.ReactNode;
  initialBranding?: InitialSiteBranding;
}): React.ReactElement {
  const pathname = usePathname();
  const {
    items,
    deliveryMode,
    deliveryFee,
    cartCount,
    isCartReady,
    isCartOpen,
    setCartOpen,
    setDeliveryMode,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [brandSlug, setBrandSlug] = useState(
    initialBranding?.brandSlug ?? DEFAULT_BRAND_SLUG,
  );
  const [brandName, setBrandName] = useState(
    initialBranding?.brandName ?? BENNY_BOYS_NAME,
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialBranding?.logoUrl ??
      defaultLogosForSlug(initialBranding?.brandSlug ?? DEFAULT_BRAND_SLUG).logoUrl,
  );
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(
    initialBranding?.logoDarkUrl ??
      defaultLogosForSlug(initialBranding?.brandSlug ?? DEFAULT_BRAND_SLUG).logoDarkUrl,
  );
  const [tagline, setTagline] = useState<string | null>(
    initialBranding?.tagline ?? null,
  );
  const [address, setAddress] = useState<string | null>(
    initialBranding?.address ?? null,
  );
  const [openingHours, setOpeningHours] = useState<unknown>(
    initialBranding?.openingHours ?? null,
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialBranding?.primaryColor?.trim() || DEFAULT_PRIMARY,
  );
  const [secondaryColor, setSecondaryColor] = useState(
    initialBranding?.secondaryColor?.trim() || DEFAULT_SECONDARY,
  );
  const [backgroundLightColor, setBackgroundLightColor] = useState(
    initialBranding?.backgroundLightColor?.trim() || DEFAULT_BG_LIGHT_COLOR,
  );
  const [backgroundDarkColor, setBackgroundDarkColor] = useState(
    initialBranding?.backgroundDarkColor?.trim() || DEFAULT_BG_DARK_COLOR,
  );
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    initialBranding?.darkModeEnabled !== false,
  );

  useEffect(() => {
    const onScroll = (): void => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncSlug = (): void => {
      setBrandSlug(getSiteBrandSlug());
    };

    syncSlug();
    window.addEventListener("marina-site-brand-change", syncSlug);
    window.addEventListener("storage", syncSlug);
    return () => {
      window.removeEventListener("marina-site-brand-change", syncSlug);
      window.removeEventListener("storage", syncSlug);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchStoreSettings(brandSlug)
      .then((settings) => {
        if (cancelled) {
          return;
        }
        const fallbacks = defaultLogosForSlug(brandSlug);
        setBrandName(settings.storeName || "Store");
        setLogoUrl(settings.logoUrl || fallbacks.logoUrl);
        setLogoDarkUrl(settings.logoDarkUrl || fallbacks.logoDarkUrl);
        setTagline(settings.tagline ?? null);
        setAddress(settings.address ?? null);
        setOpeningHours(settings.openingHours ?? null);
        setPrimaryColor(settings.primaryColor?.trim() || DEFAULT_PRIMARY);
        setSecondaryColor(settings.secondaryColor?.trim() || DEFAULT_SECONDARY);
        setBackgroundLightColor(
          settings.backgroundLightColor?.trim() || DEFAULT_BG_LIGHT_COLOR,
        );
        setBackgroundDarkColor(
          settings.backgroundDarkColor?.trim() || DEFAULT_BG_DARK_COLOR,
        );
        setDarkModeEnabled(settings.darkModeEnabled !== false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        const fallbacks = defaultLogosForSlug(brandSlug);
        setBrandName(
          brandSlug === DEFAULT_BRAND_SLUG ? BENNY_BOYS_NAME : brandSlug,
        );
        setTagline(BENNY_BOYS_TAGLINE);
        setAddress(BENNY_BOYS_ADDRESS);
        setLogoUrl(fallbacks.logoUrl);
        setLogoDarkUrl(fallbacks.logoDarkUrl);
        setOpeningHours(null);
        setPrimaryColor(DEFAULT_PRIMARY);
        setSecondaryColor(DEFAULT_SECONDARY);
        setBackgroundLightColor(DEFAULT_BG_LIGHT_COLOR);
        setBackgroundDarkColor(DEFAULT_BG_DARK_COLOR);
        setDarkModeEnabled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [brandSlug, initialBranding?.brandSlug]);

  const standalone = isStandaloneRoute(pathname);

  if (standalone) {
    return (
      <>
        <StoreThemeProvider config={{}} usePlatformTheme />
        {children}
      </>
    );
  }

  return (
    <>
      <StoreThemeProvider
        config={{
          accent: primaryColor,
          backgroundLight: backgroundLightColor,
          backgroundDark: backgroundDarkColor,
          darkModeEnabled,
        }}
      />
      <SiteHeader
        brandName={brandName}
        cartCount={cartCount}
        homeHref={homeHrefForSlug(brandSlug)}
        isCartReady={isCartReady}
        logoDarkUrl={logoDarkUrl}
        logoUrl={logoUrl}
        onOpenCart={() => setCartOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        scrolled={isScrolled}
        showThemeToggle={darkModeEnabled}
      />
      {children}
      <SiteFooter
        address={address}
        brandName={brandName}
        deliveryFee={String(deliveryFee)}
        logoDarkUrl={logoDarkUrl}
        logoUrl={logoUrl}
        openingHours={openingHours}
        tagline={tagline}
      />
      <MenuSheet onOpenChange={setMenuOpen} open={isMenuOpen} />
      <CartDrawer
        deliveryFeeAmount={deliveryFee}
        deliveryMode={deliveryMode}
        items={items}
        onDecrement={decrementItem}
        onDeliveryModeChange={setDeliveryMode}
        onIncrement={incrementItem}
        onOpenChange={setCartOpen}
        onRemove={removeItem}
        open={isCartOpen}
      />
    </>
  );
}
