"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/features/cart-drawer";
import { MenuSheet } from "@/components/features/menu-sheet";
import { SiteFooter } from "@/components/features/site-footer";
import { SiteHeader } from "@/components/features/site-header";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import { useCart } from "@/lib/cart-context";
import { fetchStoreSettings } from "@/lib/menu-api";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

function isStandaloneRoute(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/admin");
}

function homeHrefForSlug(slug: string): string {
  if (slug === DEFAULT_BRAND_SLUG) {
    return "/";
  }
  return `/${slug}`;
}

/** Bundled Leovorno logos (marinapizzas.com.au → Leovorno for now). */
const LEOVORNO_LOGO_LIGHT = "/leovorno-logo-light.png";
const LEOVORNO_LOGO_DARK = "/leovorno-logo-dark.png";

function defaultLogosForSlug(slug: string): {
  logoUrl: string | null;
  logoDarkUrl: string | null;
} {
  if (slug === DEFAULT_BRAND_SLUG) {
    return { logoUrl: LEOVORNO_LOGO_LIGHT, logoDarkUrl: LEOVORNO_LOGO_DARK };
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
    initialBranding?.brandName ?? "Leovorno",
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
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        const fallbacks = defaultLogosForSlug(brandSlug);
        setBrandName(brandSlug === DEFAULT_BRAND_SLUG ? "Leovorno" : brandSlug);
        setLogoUrl(fallbacks.logoUrl);
        setLogoDarkUrl(fallbacks.logoDarkUrl);
        setOpeningHours(null);
      });

    return () => {
      cancelled = true;
    };
  }, [brandSlug, initialBranding?.brandSlug]);

  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
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
