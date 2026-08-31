"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { MenuItemBadges } from "@/components/features/menu-item-badges";
import { Button } from "@/components/ui/button";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuItem, PizzaSize } from "@/types/menu";

interface MenuCardProps {
  item: MenuItem;
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
}

const SIZE_OPTIONS: PizzaSize[] = ["S", "L", "F"];

const cardShellClassName =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition-all duration-150 ease-out hover:border-[color:var(--brand-accent,#d81b60)]/35 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:hover:shadow-black/20";

function formatPrice(price: number): string {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function getPriceForSize(item: MenuItem, size: PizzaSize): number {
  if (!item.sizePricing) {
    return item.price;
  }

  switch (size) {
    case "S":
      return item.sizePricing.small;
    case "L":
      return item.sizePricing.large;
    case "F":
      return item.sizePricing.family;
  }
}

function ImagePanel({
  item,
  detailHref,
}: {
  item: MenuItem;
  detailHref: string;
}): React.ReactElement {
  const imageSrc = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;

  return (
    <Link
      aria-label={`View ${item.name} details`}
      className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
      href={detailHref}
    >
      <Image
        alt={item.imageAlt}
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        src={imageSrc}
      />
      <span
        aria-hidden
        className="absolute inset-0 block bg-gradient-to-t from-zinc-950/25 via-transparent to-transparent"
      />
    </Link>
  );
}

function ActionFooter({
  customizeHref,
  displayDescription,
  hasSizePricing,
  justAdded,
  selectedSize,
  selectedPrice,
  itemPrice,
  onSelectSize,
  onAddToCart,
}: {
  customizeHref?: string;
  displayDescription: string;
  hasSizePricing: boolean;
  justAdded: boolean;
  selectedSize: PizzaSize;
  selectedPrice: number;
  itemPrice: number;
  onSelectSize: (size: PizzaSize) => void;
  onAddToCart: () => void;
}): React.ReactElement {
  return (
    <div className="mt-auto flex flex-col gap-4 border-t border-zinc-200/70 px-5 py-4 dark:border-zinc-800/60">
      <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {displayDescription}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          {hasSizePricing ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {SIZE_OPTIONS.map((size) => (
                <button
                  className={cn(
                    "min-w-[2.25rem] rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide transition-colors",
                    selectedSize === size
                      ? "bg-[color:var(--brand-accent,#d81b60)] text-white shadow-md shadow-[color:var(--brand-accent,#d81b60)]/20"
                      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  )}
                  key={size}
                  onClick={() => onSelectSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          ) : null}
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {formatPrice(hasSizePricing ? selectedPrice : itemPrice)}
          </span>
        </div>
        {customizeHref ? (
          <Button
            asChild
            className="h-11 shrink-0 rounded-xl bg-[color:var(--brand-accent,#d81b60)] px-5 hover:brightness-110"
          >
            <Link href={customizeHref}>Customize</Link>
          </Button>
        ) : (
          <Button
            className={cn(
              "h-11 w-11 shrink-0 rounded-xl p-0 transition-all duration-300",
              justAdded
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110 active:scale-95"
            )}
            onClick={onAddToCart}
            size="icon"
            type="button"
          >
            {justAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}

export function MenuCard({
  item,
  brandSlug,
  onAddToCart,
}: MenuCardProps): React.ReactElement {
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("S");
  const [justAdded, setJustAdded] = useState(false);
  const addResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSizePricing = Boolean(item.sizePricing);
  const showCustomize =
    hasSizePricing ||
    item.category.endsWith("-pizzas") ||
    item.category === "deals" ||
    (item.ingredients?.length ?? 0) > 0;
  const selectedPrice = hasSizePricing ? getPriceForSize(item, selectedSize) : item.price;
  const detailHref = `/menu/${item.id}`;
  const displayDescription = getMenuDisplayDescription(item, brandSlug);

  const handleAddToCart = (): void => {
    onAddToCart({
      item,
      price: selectedPrice,
      size: hasSizePricing ? selectedSize : undefined,
    });

    if (addResetTimeoutRef.current) {
      clearTimeout(addResetTimeoutRef.current);
    }

    setJustAdded(true);
    addResetTimeoutRef.current = setTimeout(() => {
      setJustAdded(false);
      addResetTimeoutRef.current = null;
    }, 1000);
  };

  useEffect(
    () => () => {
      if (addResetTimeoutRef.current) {
        clearTimeout(addResetTimeoutRef.current);
      }
    },
    []
  );

  return (
    <article className={cardShellClassName}>
      <ImagePanel detailHref={detailHref} item={item} />

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-1 pt-4">
        <Link className="group/title block transition-colors" href={detailHref}>
          <span className="mb-2 flex items-start justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              #{item.number}
            </span>
            <MenuItemBadges badges={item.badges} className="shrink-0" />
          </span>
          <h3 className="text-lg font-bold leading-snug text-zinc-950 transition-colors duration-150 group-hover/title:text-[color:var(--brand-accent,#d81b60)] dark:text-white">
            {item.name}
          </h3>
          {item.priceNote ? (
            <p className="mt-1 text-xs font-medium text-zinc-500">{item.priceNote}</p>
          ) : null}
        </Link>

        <ActionFooter
          customizeHref={showCustomize ? detailHref : undefined}
          displayDescription={displayDescription}
          hasSizePricing={hasSizePricing}
          itemPrice={item.price}
          justAdded={justAdded}
          onAddToCart={handleAddToCart}
          onSelectSize={setSelectedSize}
          selectedPrice={selectedPrice}
          selectedSize={selectedSize}
        />
      </div>
    </article>
  );
}
