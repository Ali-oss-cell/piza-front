"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuItem, PizzaSize } from "@/types/menu";
import type { CategoryTab } from "@/lib/menu-mappers";

function itemHref(item: MenuItem): string {
  return isNextOrderOrderingEnabled() ? ORDER_ONLINE_HREF : `/menu/${item.id}`;
}

function quickAddPrice(item: MenuItem): { price: number; size?: PizzaSize } {
  if (item.sizePricing) {
    return { price: item.sizePricing.small, size: "S" };
  }
  return { price: item.price };
}

function needsCustomize(item: MenuItem): boolean {
  return (
    Boolean(item.sizePricing) ||
    item.category.endsWith("-pizzas") ||
    item.category === "deals" ||
    (item.ingredients?.length ?? 0) > 0
  );
}

function DealStripCard({ item }: { item: MenuItem }): React.ReactElement {
  const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  return (
    <Link
      className="group relative w-56 shrink-0 overflow-hidden rounded-xl border border-zinc-200/70 bg-white dark:border-white/10 dark:bg-zinc-900/50 sm:w-64"
      href={itemHref(item)}
    >
      <div className="relative aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-800">
        <Image alt={item.imageAlt} className="object-cover transition-transform duration-300 group-hover:scale-105" fill sizes="256px" src={src} />
      </div>
      <div className="p-3">
        <p className="line-clamp-1 text-sm font-bold text-zinc-950 dark:text-white">{item.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-[color:var(--brand-accent,#d81b60)]">
          {formatCurrency(item.price)}
        </p>
      </div>
    </Link>
  );
}

function FeaturedCard({
  item,
  brandSlug,
}: {
  item: MenuItem;
  brandSlug?: string;
}): React.ReactElement {
  const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const desc = getMenuDisplayDescription(item, brandSlug);
  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white dark:border-white/10 dark:bg-zinc-900/40 sm:flex-row"
      href={itemHref(item)}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-100 dark:bg-zinc-800 sm:aspect-auto sm:h-auto sm:w-44 md:w-52">
        <Image alt={item.imageAlt} className="object-cover transition-transform duration-300 group-hover:scale-105" fill sizes="(max-width: 640px) 100vw, 208px" src={src} />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:p-5">
        <h3 className="text-lg font-bold text-zinc-950 group-hover:text-[color:var(--brand-accent,#d81b60)] dark:text-white">
          {item.name}
        </h3>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
        <p className="text-base font-bold text-[color:var(--brand-accent,#d81b60)]">
          {formatCurrency(item.sizePricing?.small ?? item.price)}
        </p>
      </div>
    </Link>
  );
}

function MenuListRow({
  item,
  brandSlug,
  onAddToCart,
}: {
  item: MenuItem;
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
}): React.ReactElement {
  const desc = getMenuDisplayDescription(item, brandSlug);
  const customize = needsCustomize(item);

  return (
    <li className="flex items-start justify-between gap-3 border-b border-zinc-100 py-3 last:border-0 dark:border-white/5">
      <div className="min-w-0 flex-1">
        <Link className="font-semibold text-zinc-950 hover:text-[color:var(--brand-accent,#d81b60)] dark:text-white" href={itemHref(item)}>
          {item.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {formatCurrency(item.sizePricing?.small ?? item.price)}
        </span>
        {customize ? (
          <Button asChild className="h-8 w-8 rounded-lg bg-[color:var(--brand-accent,#d81b60)] p-0 hover:brightness-110" size="icon">
            <Link aria-label={`Customize ${item.name}`} href={itemHref(item)}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            aria-label={`Add ${item.name}`}
            className="h-8 w-8 rounded-lg bg-[color:var(--brand-accent,#d81b60)] p-0 hover:brightness-110"
            onClick={() => {
              const { price, size } = quickAddPrice(item);
              onAddToCart({ item, price, size });
            }}
            size="icon"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
}

function CategoryAccordion({
  categories,
  items,
  brandSlug,
  onAddToCart,
  defaultOpen,
}: {
  categories: CategoryTab[];
  items: MenuItem[];
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
  defaultOpen?: string;
}): React.ReactElement {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? categories[0]?.value ?? null);

  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const catItems = items
          .filter((item) => item.category === cat.value)
          .sort((a, b) => a.number - b.number);
        if (catItems.length === 0) return null;
        const isOpen = open === cat.value;
        return (
          <div
            className="overflow-hidden rounded-xl border border-zinc-200/70 dark:border-white/10"
            key={cat.value}
          >
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 bg-zinc-50/80 px-4 py-3 text-left dark:bg-zinc-900/60"
              onClick={() => setOpen(isOpen ? null : cat.value)}
              type="button"
            >
              <span className="font-label-md text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                {cat.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen ? (
              <ul className="bg-white px-4 dark:bg-zinc-950/40">
                {catItems.map((item) => (
                  <MenuListRow
                    brandSlug={brandSlug}
                    item={item}
                    key={item.id}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function MagazineStorefront({
  menuItems,
  categories,
  brandName,
  brandSlug,
  tagline,
  heroImageUrl,
  address,
  variant = "home",
}: StorefrontProps): React.ReactElement {
  const { addToCart } = useCart();
  const useNextOrder = isNextOrderOrderingEnabled();

  const deals = useMemo(
    () =>
      menuItems
        .filter((item) => item.category === "deals")
        .sort((a, b) => a.number - b.number),
    [menuItems]
  );

  const featured = useMemo(
    () =>
      menuItems
        .filter((item) => item.category !== "deals")
        .sort((a, b) => a.number - b.number)
        .slice(0, 3),
    [menuItems]
  );

  const topDeal = deals[0];
  const heroSrc =
    resolveMediaUrl(heroImageUrl) ??
    heroImageUrl ??
    (topDeal ? resolveMediaUrl(topDeal.imageUrl) ?? topDeal.imageUrl : null);

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      {variant === "home" ? (
        <section className="relative overflow-hidden border-b border-zinc-200/70 dark:border-white/10">
          <div className="absolute inset-0 bg-zinc-900">
            {heroSrc ? (
              <Image
                alt=""
                className="object-cover opacity-55"
                fill
                priority
                sizes="100vw"
                src={heroSrc}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/40" />
          </div>
          <div className="relative mx-auto flex max-w-container-max flex-col gap-4 px-margin-mobile py-12 md:px-margin-desktop md:py-16">
            <p className="font-label-md text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {brandName}
            </p>
            <h1 className="max-w-xl font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {tagline?.trim() || "Deals worth scrolling for"}
            </h1>
            <p className="max-w-md text-sm text-white/75">
              {topDeal
                ? `This week: ${topDeal.name} from ${formatCurrency(topDeal.price)}.`
                : "Browse specials and the full menu below."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-xl bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
              >
                <Link href={deals.length ? "/deals" : "#magazine-menu"}>
                  {deals.length ? "View deals" : "Browse menu"}
                </Link>
              </Button>
              {!useNextOrder ? (
                <Button
                  asChild
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                  variant="outline"
                >
                  <Link href="#magazine-menu">Full menu</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
                  variant="outline"
                >
                  <Link href={ORDER_ONLINE_HREF}>Order online</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {deals.length > 0 ? (
        <section className="border-b border-zinc-200/70 py-8 dark:border-white/10">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white">
                Deals
              </h2>
              <Link
                className="text-sm font-medium text-[color:var(--brand-accent,#d81b60)] hover:underline"
                href="/deals"
              >
                See all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {deals.map((item) => (
                <DealStripCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {featured.length > 0 && variant === "home" ? (
        <section className="border-b border-zinc-200/70 py-10 dark:border-white/10">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="mb-5 font-display text-xl font-bold text-zinc-950 dark:text-white">
              Featured picks
            </h2>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              {featured.map((item) => (
                <FeaturedCard brandSlug={brandSlug} item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!useNextOrder ? (
        <section
          className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-12"
          id="magazine-menu"
        >
          <h2 className="mb-5 font-display text-xl font-bold text-zinc-950 dark:text-white">
            Menu
          </h2>
          <CategoryAccordion
            brandSlug={brandSlug}
            categories={categories}
            defaultOpen={categories[0]?.value}
            items={menuItems}
            onAddToCart={addToCart}
          />
        </section>
      ) : null}

      {(tagline || address) && variant === "home" ? (
        <section className="border-t border-zinc-200/70 bg-zinc-50/80 py-10 dark:border-white/10 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
              About {brandName}
            </h2>
            {tagline ? (
              <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{tagline}</p>
            ) : null}
            {address ? (
              <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">{address}</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
