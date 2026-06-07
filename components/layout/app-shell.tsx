"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/features/cart-drawer";
import { MenuSheet } from "@/components/features/menu-sheet";
import { SiteHeader } from "@/components/features/site-header";
import { useCart } from "@/lib/cart-context";

function isStandaloneRoute(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/admin");
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

  useEffect(() => {
    const onScroll = (): void => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader
        cartCount={cartCount}
        isCartReady={isCartReady}
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
