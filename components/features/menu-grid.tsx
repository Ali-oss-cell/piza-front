"use client";

import { Pizza, Sparkles } from "lucide-react";
import { MenuCard } from "@/components/features/menu-card";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { EmptyState } from "@/components/ui/empty-state";
import type { AddToCartPayload, MenuCategory, MenuItem } from "@/types/menu";

interface MenuGridProps {
  activeCategory: MenuCategory;
  brandSlug?: string;
  items: MenuItem[];
  onAddToCart: (payload: AddToCartPayload) => void;
}

export function MenuGrid({
  activeCategory,
  brandSlug,
  items,
  onAddToCart,
}: MenuGridProps): React.ReactElement {
  const filteredItems = items.filter((item) => item.category === activeCategory);
  const isDeals = activeCategory === "deals";

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-14">
      {filteredItems.length === 0 ? (
        <EmptyState
          actionHref="/deals"
          actionLabel={isDeals ? "Build a combo" : "View deals"}
          description={
            isDeals
              ? "Meal combos live on the Deals page — pick your items at a fixed price."
              : "Try another category or check today’s specials."
          }
          icon={
            isDeals ? <Sparkles className="h-7 w-7" /> : <Pizza className="h-7 w-7" />
          }
          title={isDeals ? "Combos moved to Deals" : "Nothing in this category yet"}
        />
      ) : (
        <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuCard brandSlug={brandSlug} item={item} key={item.id} onAddToCart={onAddToCart} />
          ))}
        </StaggerGrid>
      )}
    </section>
  );
}
