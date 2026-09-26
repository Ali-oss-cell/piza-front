import { Pizza } from "lucide-react";
import { MenuCard } from "@/components/features/menu-card";
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

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-16">
      {filteredItems.length === 0 ? (
        <EmptyState
          actionHref="/deals"
          actionLabel="View deals"
          description="Try another category or check today’s specials."
          icon={<Pizza className="h-7 w-7" />}
          title="Nothing in this category yet"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuCard brandSlug={brandSlug} item={item} key={item.id} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}
