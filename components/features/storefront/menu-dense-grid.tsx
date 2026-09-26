"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuCategory, MenuItem, PizzaSize } from "@/types/menu";

interface MenuDenseGridProps {
  activeCategory: MenuCategory;
  brandSlug?: string;
  items: MenuItem[];
  onAddToCart: (payload: AddToCartPayload) => void;
}

function DenseCard({
  item,
  brandSlug,
  onAddToCart,
}: {
  item: MenuItem;
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
}): React.ReactElement {
  const [justAdded, setJustAdded] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageSrc = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const detailHref = isNextOrderOrderingEnabled() ? ORDER_ONLINE_HREF : `/menu/${item.id}`;
  const desc = getMenuDisplayDescription(item, brandSlug);
  const needsCustomize =
    Boolean(item.sizePricing) ||
    item.category.endsWith("-pizzas") ||
    item.category === "deals" ||
    (item.ingredients?.length ?? 0) > 0;

  const handleAdd = (): void => {
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
    <article className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white dark:border-white/10 dark:bg-zinc-900/40">
      <Link className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800" href={detailHref}>
        <Image
          alt={item.imageAlt}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          src={imageSrc}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link className="min-w-0" href={detailHref}>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-zinc-950 dark:text-white">
              {item.name}
            </h3>
          </Link>
          <span className="shrink-0 text-sm font-bold text-[color:var(--brand-accent,#d81b60)]">
            {formatCurrency(item.sizePricing?.small ?? item.price)}
          </span>
        </div>
        <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
        <div className="mt-auto pt-1">
          {needsCustomize ? (
            <Button
              asChild
              className="h-8 w-full rounded-lg bg-[color:var(--brand-accent,#d81b60)] text-xs hover:brightness-110"
            >
              <Link href={detailHref}>Add</Link>
            </Button>
          ) : (
            <Button
              className={cn(
                "h-8 w-full rounded-lg text-xs",
                justAdded
                  ? "bg-emerald-600 hover:bg-emerald-600"
                  : "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
              )}
              onClick={handleAdd}
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
}: MenuDenseGridProps): React.ReactElement {
  const filtered = items.filter((item) => item.category === activeCategory);

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-6 md:px-margin-desktop md:py-8">
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No items in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {filtered.map((item) => (
            <DenseCard
              brandSlug={brandSlug}
              item={item}
              key={item.id}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}
