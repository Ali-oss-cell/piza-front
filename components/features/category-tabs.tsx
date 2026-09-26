"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuCategory } from "@/types/menu";
import type { CategoryTab } from "@/lib/menu-mappers";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: MenuCategory;
  categories: CategoryTab[];
  onSelectCategory: (category: MenuCategory) => void;
  /** `pills` = rounded chips for menu-first layout */
  variant?: "underline" | "pills";
}

export function CategoryTabs({
  activeCategory,
  categories,
  onSelectCategory,
  variant = "underline",
}: CategoryTabsProps): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const isPills = variant === "pills";

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div aria-hidden className="h-px" ref={sentinelRef} />
      <section
        className={cn(
          "sticky top-20 z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur-lg transition-shadow duration-200 dark:border-white/10 dark:bg-black/90",
          isStuck && "shadow-md shadow-zinc-900/5 dark:shadow-black/40"
        )}
      >
        <div className="mx-auto max-w-container-max overflow-x-auto px-margin-mobile py-3 no-scrollbar md:px-margin-desktop md:py-4">
          <div
            className={cn(
              "flex items-center whitespace-nowrap",
              isPills ? "gap-2" : "gap-6 md:gap-10"
            )}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.value;
              if (isPills) {
                return (
                  <button
                    className={cn(
                      "rounded-full px-3.5 py-1.5 font-label-md text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ease-out",
                      isActive
                        ? "bg-[color:var(--brand-accent,#d81b60)] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    )}
                    key={category.value}
                    onClick={() => onSelectCategory(category.value)}
                    type="button"
                  >
                    {category.label}
                  </button>
                );
              }
              return (
                <button
                  className={cn(
                    "relative pb-2 font-label-md uppercase tracking-widest transition-colors duration-150 ease-out",
                    isActive
                      ? "font-bold text-[color:var(--brand-accent,#d81b60)]"
                      : "font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  )}
                  key={category.value}
                  onClick={() => onSelectCategory(category.value)}
                  type="button"
                >
                  {category.label}
                  {isActive ? (
                    <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-[color:var(--brand-accent,#d81b60)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
