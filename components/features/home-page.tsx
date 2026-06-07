"use client";

import { useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { HeroSection } from "@/components/features/hero-section";
import { MenuGrid } from "@/components/features/menu-grid";
import { SiteFooter } from "@/components/features/site-footer";
import { useCart } from "@/lib/cart-context";
import type { CategoryTab } from "@/lib/menu-mappers";
import type { MenuItem } from "@/types/menu";

interface HomePageProps {
  menuItems: MenuItem[];
  categories: CategoryTab[];
}

export function HomePage({ menuItems, categories }: HomePageProps): React.ReactElement {
  const { addToCart, setCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "traditional-pizza");

  return (
    <>
      <main className="pt-20 transition-colors duration-150 ease-out">
        <HeroSection onOpenCart={() => setCartOpen(true)} />
        <CategoryTabs
          activeCategory={activeCategory}
          categories={categories}
          onSelectCategory={setActiveCategory}
        />
        <MenuGrid activeCategory={activeCategory} items={menuItems} onAddToCart={addToCart} />
      </main>
      <SiteFooter />
    </>
  );
}
