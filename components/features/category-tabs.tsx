import type { MenuCategory } from "@/types/menu";
import type { CategoryTab } from "@/lib/menu-mappers";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: MenuCategory;
  categories: CategoryTab[];
  onSelectCategory: (category: MenuCategory) => void;
}

export function CategoryTabs({
  activeCategory,
  categories,
  onSelectCategory,
}: CategoryTabsProps): React.ReactElement {
  return (
    <section className="sticky top-[72px] z-40 border-b border-zinc-200/70 bg-white/85 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/5 dark:bg-black/85">
      <div className="mx-auto max-w-container-max overflow-x-auto px-margin-mobile py-4 no-scrollbar md:px-margin-desktop">
        <div className="flex items-center gap-12 whitespace-nowrap">
          {categories.map((category) => (
            <button
              className={cn(
                "font-label-md uppercase tracking-widest transition-colors duration-150 ease-out",
                activeCategory === category.value
                  ? "font-bold text-[#d81b60]"
                  : "font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              )}
              key={category.value}
              onClick={() => onSelectCategory(category.value)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
