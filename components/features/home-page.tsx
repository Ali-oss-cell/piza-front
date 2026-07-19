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
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function HomePage({
  menuItems,
  categories,
  brandName,
  tagline,
  heroImageUrl,
  primaryColor,
  secondaryColor,
}: HomePageProps): React.ReactElement {
  const { addToCart, setCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "traditional-pizza");

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      <HeroSection
        brandName={brandName}
        heroImageUrl={heroImageUrl}
        onOpenCart={() => setCartOpen(true)}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
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
