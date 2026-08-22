"use client";

import { useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { HeroSection } from "@/components/features/hero-section";
import { MenuGrid } from "@/components/features/menu-grid";
import { useCart } from "@/lib/cart-context";
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
}: HomePageProps): React.ReactElement {
  const { addToCart, setCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "traditional-pizza");

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      <HeroSection
        backgroundDarkColor={backgroundDarkColor}
        backgroundLightColor={backgroundLightColor}
        brandName={brandName}
        brandSlug={brandSlug}
        heroImageDarkUrl={heroImageDarkUrl}
        heroImageUrl={heroImageUrl}
        onOpenCart={() => setCartOpen(true)}
        primaryColor={primaryColor}
        tagline={tagline}
      />
      <CategoryTabs
        activeCategory={activeCategory}
        categories={categories}
        onSelectCategory={setActiveCategory}
      />
      <MenuGrid activeCategory={activeCategory} items={menuItems} onAddToCart={addToCart} />
    </main>
  );
}
