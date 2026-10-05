"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MenuCategory } from "@/types/menu";
import type { CategoryTab } from "@/lib/menu-mappers";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  activeCategory: MenuCategory;
  categories: CategoryTab[];
  onSelectCategory: (category: MenuCategory) => void;
  /** `pills` = rounded chips for menu-first layout */
  variant?: "underline" | "pills";
  /** Tighter sticky bar heights (menu-first) */
  compact?: boolean;
}

export function CategoryTabs({
  activeCategory,
  categories,
  onSelectCategory,
  variant = "underline",
  compact = false,
}: CategoryTabsProps): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isPills = variant === "pills";

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(maxScroll > 2 && el.scrollLeft < maxScroll - 2);
  }, []);

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

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }

    const measure = () => updateScrollState();
    measure();
    // Re-measure after layout/fonts settle (overflow often wrong on first paint)
    const raf = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    const t1 = window.setTimeout(measure, 100);
    const t2 = window.setTimeout(measure, 400);

    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [categories, updateScrollState]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const active = el.querySelector<HTMLElement>(`[data-category="${activeCategory}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeCategory]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const amount = Math.max(160, Math.round(el.clientWidth * 0.65));
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <>
      <div aria-hidden className="h-px" ref={sentinelRef} />
      <section
        className={cn(
          "sticky z-50 border-b border-zinc-200/70 bg-white/90 backdrop-blur-lg transition-shadow duration-200 dark:border-white/10 dark:bg-black/90",
          compact ? "top-16 h-12 md:top-[4.5rem] md:h-14" : "top-20",
          isStuck && "shadow-md shadow-zinc-900/5 dark:shadow-black/40"
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-container-max items-center px-margin-mobile md:px-margin-desktop",
            compact ? "h-full" : ""
          )}
        >
          {canScrollLeft ? (
            <button
              aria-label="Scroll categories left"
              className={cn(
                "absolute left-1 z-10 flex shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-800 shadow-md transition hover:bg-zinc-100 dark:border-white/25 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 md:left-2",
                compact ? "size-7" : "size-8"
              )}
              onClick={() => scrollByPage(-1)}
              type="button"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
          ) : null}

          <div
            className={cn(
              "flex flex-1 items-center overflow-x-auto no-scrollbar",
              compact ? "h-full py-0" : "py-3 md:py-4",
              canScrollLeft && "pl-9 md:pl-10",
              canScrollRight && "pr-9 md:pr-10"
            )}
            ref={scrollerRef}
          >
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
                      data-category={category.value}
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
                    data-category={category.value}
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

          {canScrollRight ? (
            <button
              aria-label="Scroll categories right"
              className={cn(
                "absolute right-1 z-10 flex shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-800 shadow-md transition hover:bg-zinc-100 dark:border-white/25 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 md:right-2",
                compact ? "size-7" : "size-8"
              )}
              onClick={() => scrollByPage(1)}
              type="button"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
