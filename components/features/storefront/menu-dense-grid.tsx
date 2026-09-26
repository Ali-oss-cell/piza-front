"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuCategory, MenuItem, PizzaSize } from "@/types/menu";

interface MenuDenseGridProps {
  activeCategory: MenuCategory;
  brandSlug?: string;
  items: MenuItem[];
  onAddToCart: (payload: AddToCartPayload) => void;
  onOpenItem: (item: MenuItem) => void;
  /** Extra bottom padding when mobile cart bar is visible */
  paddedForCartBar?: boolean;
}

function DenseCard({
  item,
  brandSlug,
  onAddToCart,
  onOpenItem,
}: {
  item: MenuItem;
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
  onOpenItem: (item: MenuItem) => void;
}): React.ReactElement {
  const [justAdded, setJustAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageSrc = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const desc = getMenuDisplayDescription(item, brandSlug);
  const needsCustomize =
    Boolean(item.sizePricing) ||
    item.category.endsWith("-pizzas") ||
    item.category === "deals" ||
    (item.ingredients?.length ?? 0) > 0;

  const handleQuickAdd = (event: React.MouseEvent): void => {
    event.stopPropagation();
    const size: PizzaSize | undefined = item.sizePricing ? "S" : undefined;
    const price = item.sizePricing ? item.sizePricing.small : item.price;
    onAddToCart({ item, price, size });
    if (resetRef.current) clearTimeout(resetRef.current);
    setJustAdded(true);
    resetRef.current = setTimeout(() => {
      setJustAdded(false);
      resetRef.current = null;
    }, 900);
  };

  useEffect(
    () => () => {
      if (resetRef.current) clearTimeout(resetRef.current);
    },
    []
  );

  return (
    <article
      className={cn(
        "flex max-w-[220px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:bg-zinc-900/80 dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]",
        "w-full sm:max-w-none"
      )}
    >
      <button
        className="relative aspect-square w-full overflow-hidden bg-zinc-100 text-left dark:bg-zinc-800"
        onClick={() => onOpenItem(item)}
        type="button"
      >
        {!imageLoaded ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800"
          />
        ) : null}
        <Image
          alt={item.imageAlt}
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          fill
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={imageSrc}
        />
      </button>
      <div className="flex min-h-[88px] flex-1 flex-col gap-1.5 p-3 md:min-h-[100px]">
        <button className="w-full text-left" onClick={() => onOpenItem(item)} type="button">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-950 dark:text-white md:text-base">
              {item.name}
            </h3>
            <span className="shrink-0 text-[15px] font-bold text-[color:var(--brand-accent,#d81b60)] md:text-base">
              {formatCurrency(item.sizePricing?.small ?? item.price)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
        </button>
        <div className="mt-auto pt-1">
          {needsCustomize ? (
            <Button
              className="h-8 w-full rounded-xl bg-[color:var(--brand-accent,#d81b60)] text-xs hover:brightness-110"
              onClick={() => onOpenItem(item)}
              type="button"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          ) : (
            <Button
              className={cn(
                "h-8 w-full rounded-xl text-xs transition-all duration-200",
                justAdded
                  ? "scale-[1.02] bg-emerald-600 hover:bg-emerald-600"
                  : "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
              )}
              onClick={handleQuickAdd}
              type="button"
            >
              {justAdded ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function MenuDenseGrid({
  activeCategory,
  brandSlug,
  items,
  onAddToCart,
  onOpenItem,
  paddedForCartBar = false,
}: MenuDenseGridProps): React.ReactElement {
  const filtered = items.filter((item) => item.category === activeCategory);

  return (
    <section
      className={cn(
        "w-full py-4 md:py-6",
        paddedForCartBar && "pb-24 md:pb-6"
      )}
    >
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No items in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
          {filtered.map((item) => (
            <DenseCard
              brandSlug={brandSlug}
              item={item}
              key={item.id}
              onAddToCart={onAddToCart}
              onOpenItem={onOpenItem}
            />
          ))}
        </div>
      )}
    </section>
  );
}
