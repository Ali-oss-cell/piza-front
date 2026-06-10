"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { MenuItemBadges } from "@/components/features/menu-item-badges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuItem, PizzaSize } from "@/types/menu";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (payload: AddToCartPayload) => void;
}

const SIZE_OPTIONS: PizzaSize[] = ["S", "L", "F"];

const cardShellClassName =
  "group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-md transition-all duration-150 ease-out hover:scale-[1.02] hover:border-[#d81b60]/30 hover:shadow-2xl hover:shadow-[#d81b60]/10 dark:border-zinc-800/60 dark:bg-zinc-900/40 dark:hover:shadow-[#d81b60]/5 md:min-h-[360px] md:flex-row md:items-stretch";

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

function CardHoverAccent(): React.ReactElement {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#d81b60] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200/60 bg-white/80 text-zinc-950 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white">
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </>
  );
}

function ImagePanel({
  item,
  detailHref,
  isInteractive,
}: {
  item: MenuItem;
  detailHref: string;
  isInteractive: boolean;
}): React.ReactElement {
  const panelClassName =
    "relative min-h-[260px] w-full shrink-0 overflow-hidden md:min-h-full md:w-[44%]";

  const panelContent = (
    <>
      <Image
        alt={item.imageAlt}
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        fill
        sizes="(max-width: 768px) 100vw, 44vw"
        src={item.imageUrl}
      />
      <span
        aria-hidden
        className="absolute inset-0 block bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-zinc-950/20"
      />
      {isInteractive ? (
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200/60 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-950 backdrop-blur-md transition-colors duration-150 ease-out group-hover:border-[#d81b60]/40 dark:border-white/10 dark:bg-zinc-950/80 dark:text-white dark:group-hover:bg-zinc-950/90">
          Customize
          <ArrowUpRight className="h-3 w-3" />
        </span>
      ) : null}
    </>
  );

  if (isInteractive) {
    return (
      <Link
        aria-label={`View ${item.name} details`}
        className={panelClassName}
        href={detailHref}
      >
        {panelContent}
      </Link>
    );
  }

  return <div className={panelClassName}>{panelContent}</div>;
}

function ActionFooter({
  customizeHref,
  hasSizePricing,
  justAdded,
  selectedSize,
  selectedPrice,
  itemPrice,
  onSelectSize,
  onAddToCart,
}: {
  customizeHref?: string;
  hasSizePricing: boolean;
  justAdded: boolean;
  selectedSize: PizzaSize;
  selectedPrice: number;
  itemPrice: number;
  onSelectSize: (size: PizzaSize) => void;
  onAddToCart: () => void;
}): React.ReactElement {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-200/70 px-6 py-5 transition-colors duration-150 ease-out dark:border-zinc-800/60 md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {hasSizePricing ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {SIZE_OPTIONS.map((size) => (
              <button
                className={cn(
                  "min-w-[2.25rem] rounded-lg px-3 py-2 text-xs font-bold tracking-wide transition-colors",
                  selectedSize === size
                    ? "bg-[#d81b60] text-white shadow-md shadow-[#d81b60]/20"
                    : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
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
        <span className="whitespace-nowrap text-xl font-bold text-[#d81b60]">
          {formatPrice(hasSizePricing ? selectedPrice : itemPrice)}
        </span>
      </div>
      {customizeHref ? (
        <Button
          asChild
          className="h-11 shrink-0 rounded-xl bg-[#d81b60] px-4 hover:scale-105 hover:bg-[#c2185b] active:scale-95"
        >
          <Link href={customizeHref}>Customize</Link>
        </Button>
      ) : (
        <Button
          className={cn(
            "h-11 w-11 shrink-0 rounded-xl p-0 transition-all duration-300",
            justAdded
              ? "bg-emerald-600 hover:bg-emerald-600"
              : "bg-[#d81b60] hover:scale-105 hover:bg-[#c2185b] active:scale-95"
          )}
          onClick={onAddToCart}
          size="icon"
          type="button"
        >
          {justAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </Button>
      )}
    </div>
  );
}

export function MenuCard({ item, onAddToCart }: MenuCardProps): React.ReactElement {
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("S");
  const [justAdded, setJustAdded] = useState(false);
  const addResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSizePricing = Boolean(item.sizePricing);
  const hasIngredients =
    (item.ingredients?.length ?? 0) > 0 ||
    item.description.split(",").map((part) => part.trim()).filter(Boolean).length > 0;
  const selectedPrice = hasSizePricing ? getPriceForSize(item, selectedSize) : item.price;
  const detailHref = `/menu/${item.id}`;

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

  const contentHeader = (
    <>
      <span className="mb-3 flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors duration-150 ease-out dark:text-zinc-500">
          #{item.number}
        </span>
        <MenuItemBadges badges={item.badges} className="shrink-0" />
      </span>
      <h3 className="text-xl font-bold text-zinc-950 transition-colors duration-150 ease-out group-hover:text-[#d81b60] dark:text-white dark:group-hover:text-[#f8f8f8]">
        {item.name}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
        {item.description}
      </p>
      {item.priceNote ? (
        <p className="mt-2 text-xs font-medium text-zinc-500">{item.priceNote}</p>
      ) : null}
    </>
  );

  return (
    <article className={cardShellClassName}>
      <CardHoverAccent />

      <ImagePanel detailHref={detailHref} isInteractive item={item} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          className="flex flex-1 flex-col px-6 pb-4 pt-6 transition-colors md:px-7 md:pt-7"
          href={detailHref}
        >
          {contentHeader}
        </Link>

        <ActionFooter
          customizeHref={hasIngredients ? detailHref : undefined}
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
