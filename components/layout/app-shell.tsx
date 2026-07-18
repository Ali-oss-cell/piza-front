"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/features/cart-drawer";
import { MenuSheet } from "@/components/features/menu-sheet";
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

export function AppShell({ children }: { children: React.ReactNode }): React.ReactElement {
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
  const [brandSlug, setBrandSlug] = useState(DEFAULT_BRAND_SLUG);
  const [brandName, setBrandName] = useState("Leovorno");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);

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
        setBrandName(settings.storeName || "Store");
        setLogoUrl(settings.logoUrl ?? null);
        setLogoDarkUrl(settings.logoDarkUrl ?? null);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setBrandName(brandSlug === DEFAULT_BRAND_SLUG ? "Leovorno" : brandSlug);
        setLogoUrl(null);
        setLogoDarkUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [brandSlug]);

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
