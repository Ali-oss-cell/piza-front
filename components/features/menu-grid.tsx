import { MenuCard } from "@/components/features/menu-card";
import type { AddToCartPayload, MenuCategory, MenuItem } from "@/types/menu";

interface MenuGridProps {
  activeCategory: MenuCategory;
  items: MenuItem[];
  onAddToCart: (payload: AddToCartPayload) => void;
}

export function MenuGrid({
  activeCategory,
  items,
  onAddToCart,
}: MenuGridProps): React.ReactElement {
  const filteredItems = items.filter((item) => item.category === activeCategory);

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-24 md:px-margin-desktop">
      {filteredItems.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          No items in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {filteredItems.map((item) => (
            <MenuCard item={item} key={item.id} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </section>
  );
}
