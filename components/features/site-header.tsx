"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  DESKTOP_NAV_ITEMS,
  getDesktopNavLinkClass,
  isNavLinkActive,
} from "@/lib/nav-links";
import { BENNY_BOYS_NAME } from "@/types/brand";
import { headerShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => <div aria-hidden className="h-10 w-10 shrink-0 rounded-full" />,
  }
);

interface SiteHeaderProps {
  cartCount: number;
  isCartReady: boolean;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  scrolled: boolean;
  brandName?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  homeHref?: string;
  showThemeToggle?: boolean;
  /** Portfolio home: transparent until scroll */
  overlayMode?: boolean;
  /** Hide cart control (portfolio showcase home) */
  hideCart?: boolean;
}

export function SiteHeader({
  cartCount,
  isCartReady,
  onOpenMenu,
  onOpenCart,
  scrolled,
  brandName = BENNY_BOYS_NAME,
  logoUrl,
  logoDarkUrl,
  homeHref = "/",
  showThemeToggle = true,
  overlayMode = false,
  hideCart = false,
}: SiteHeaderProps): React.ReactElement {
  const pathname = usePathname();
  const [cartBump, setCartBump] = useState(false);
  const previousCountRef = useRef(cartCount);

  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    if (cartCount > previousCountRef.current) {
      setCartBump(true);
      const timeout = setTimeout(() => setCartBump(false), 200);
      previousCountRef.current = cartCount;
      return () => clearTimeout(timeout);
    }

    previousCountRef.current = cartCount;
  }, [cartCount, isCartReady]);

  const displayCount = isCartReady ? cartCount : 0;
  const hasLogo = Boolean(logoUrl || logoDarkUrl);
  const overlayTransparent = overlayMode && !scrolled;

  return (
    <header
      className={cn(
        "fixed left-0 top-0 z-50 flex w-full items-center justify-between px-margin-mobile md:px-margin-desktop",
        overlayTransparent
          ? "border-b border-transparent bg-transparent py-5 text-white backdrop-blur-0"
          : cn(headerShell, scrolled ? "py-3" : "py-4"),
        overlayMode && scrolled && "bg-zinc-950/90 text-white dark:bg-zinc-950/90"
      )}
    >
      <div className="flex items-center gap-8">
        <Link
          aria-label={brandName}
          className="flex items-center transition-opacity duration-150 ease-out hover:opacity-90"
          href={homeHref}
        >
          {hasLogo ? (
            <BrandLogo
              brandName={brandName}
              imageClassName={cn(
                "w-auto",
                scrolled ? "h-9 md:h-10" : "h-10 md:h-12"
              )}
              logoDarkUrl={logoDarkUrl}
              logoUrl={logoUrl}
            />
          ) : (
            <span
              className={cn(
                "font-display text-headline-md font-bold uppercase tracking-tight transition-colors duration-150 ease-out",
                overlayTransparent ? "text-white" : "text-zinc-950 dark:text-white"
              )}
            >
              {brandName}
            </span>
          )}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <Link
              className={cn(
                getDesktopNavLinkClass(isNavLinkActive(pathname, item.href)),
                overlayTransparent && "border-transparent text-white/80 hover:text-white"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {showThemeToggle && !overlayTransparent ? <ThemeToggle /> : null}
        {!hideCart ? (
          <Button
            aria-label="Open cart"
            className={cn(
              "relative transition-colors duration-150 ease-out",
              overlayTransparent
                ? "text-white hover:bg-white/10"
                : "text-zinc-950 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10",
              cartBump && "animate-cartBump"
            )}
            onClick={onOpenCart}
            size="icon"
            variant="ghost"
          >
            <ShoppingCart className="h-5 w-5" />
            <span
              className={cn(
                "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--brand-accent,#d81b60)] text-[10px] font-bold text-white transition-opacity duration-300",
                cartBump && "animate-cartBump",
                isCartReady ? "opacity-100" : "opacity-0"
              )}
            >
              {displayCount}
            </span>
          </Button>
        ) : null}
        <Button
          className={cn(
            "transition-colors duration-150 ease-out",
            overlayTransparent
              ? "text-white hover:bg-white/10"
              : "text-zinc-950 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10"
          )}
          onClick={onOpenMenu}
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
