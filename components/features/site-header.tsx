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
import { cn } from "@/lib/utils";
import { headerShell } from "@/lib/theme-classes";

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
}

export function SiteHeader({
  cartCount,
  isCartReady,
  onOpenMenu,
  onOpenCart,
  scrolled,
  brandName = "Leovorno",
  logoUrl,
  logoDarkUrl,
  homeHref = "/",
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

  return (
    <header
      className={cn(
        "fixed left-0 top-0 z-50 flex w-full items-center justify-between px-margin-mobile md:px-margin-desktop",
        headerShell,
        scrolled ? "py-3" : "py-4"
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
            <span className="font-display text-headline-md font-bold uppercase tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
              {brandName}
            </span>
          )}
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <Link
              className={getDesktopNavLinkClass(isNavLinkActive(pathname, item.href))}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button
          aria-label="Open cart"
          className={cn(
            "relative text-zinc-950 transition-colors duration-150 ease-out hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10",
            cartBump && "animate-cartBump"
          )}
          onClick={onOpenCart}
          size="icon"
          variant="ghost"
        >
          <ShoppingCart className="h-5 w-5" />
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d81b60] text-[10px] font-bold text-white transition-opacity duration-300",
              cartBump && "animate-cartBump",
              isCartReady ? "opacity-100" : "opacity-0"
            )}
          >
            {displayCount}
          </span>
        </Button>
        <Button
          className="text-zinc-950 transition-colors duration-150 ease-out hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10"
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
