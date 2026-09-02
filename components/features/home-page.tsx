"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { CtaBand } from "@/components/features/content/cta-band";
import { HeroSection } from "@/components/features/hero-section";
import { MenuGrid } from "@/components/features/menu-grid";
import { useCart } from "@/lib/cart-context";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import type { CategoryTab } from "@/lib/menu-mappers";
import type { MenuItem } from "@/types/menu";

interface HomePageProps {
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
  darkModeEnabled?: boolean;
  variant?: "home" | "menu";
}

export function HomePage({
  menuItems,
  categories,
  brandName,
  brandSlug,
  tagline,
  heroImageUrl,
  heroImageDarkUrl,
  primaryColor,
  backgroundLightColor,
  backgroundDarkColor,
  variant = "home",
}: HomePageProps): React.ReactElement {
  const { addToCart, setCartOpen } = useCart();
  const menuSectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "deals");
  const useNextOrder = isNextOrderOrderingEnabled();

  const featuredDeals = useMemo(
    () =>
      menuItems
        .filter((item) => item.category === "deals")
        .sort((a, b) => a.number - b.number),
    [menuItems]
  );

  const scrollToMenu = useCallback(() => {
    menuSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleViewDeal = useCallback(
    (deal: MenuItem) => {
      setActiveCategory(deal.category);
      requestAnimationFrame(() => scrollToMenu());
    },
    [scrollToMenu]
  );

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      <HeroSection
        backgroundDarkColor={backgroundDarkColor}
        backgroundLightColor={backgroundLightColor}
        brandName={brandName}
        brandSlug={brandSlug}
        featuredDeals={featuredDeals}
        heroImageDarkUrl={heroImageDarkUrl}
        heroImageUrl={heroImageUrl}
        onOpenCart={() => setCartOpen(true)}
        onViewDeal={handleViewDeal}
        primaryColor={primaryColor}
        tagline={tagline}
        variant={variant}
      />
      {useNextOrder ? (
        <CtaBand
          className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12"
          description="Pizza, pasta, deals, and sides — order pickup or delivery through our online menu."
          primaryHref={ORDER_ONLINE_HREF}
          primaryLabel="Browse Full Menu"
          secondaryHref="/deals"
          secondaryLabel="View Specials"
          title="Ready to order?"
        />
      ) : (
        <div ref={menuSectionRef}>
          <CategoryTabs
            activeCategory={activeCategory}
            categories={categories}
            onSelectCategory={setActiveCategory}
          />
          <MenuGrid
            activeCategory={activeCategory}
            brandSlug={brandSlug}
            items={menuItems}
            onAddToCart={addToCart}
          />
        </div>
      )}
    </main>
  );
}
