"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, ShoppingBag } from "lucide-react";
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

function useInViewOnce(threshold = 0.15): {
  ref: React.RefObject<HTMLElement | null>;
  visible: boolean;
} {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, threshold]);

  return { ref, visible };
}

function DealStripCard({ item }: { item: MenuItem }): React.ReactElement {
  const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const { ref, visible } = useInViewOnce();

  return (
    <div
      className={cn(
        "shrink-0 transition duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <Link
        className="group relative block w-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900/50 sm:w-[320px]"
        href={itemHref(item)}
      >
        <div className="relative h-[200px] w-full bg-zinc-100 dark:bg-zinc-800 sm:h-[260px]">
          <Image
            alt={item.imageAlt}
            className="object-cover brightness-[1.02] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
            fill
            sizes="320px"
            src={src}
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-zinc-950/35 via-transparent to-transparent"
          />
        </div>
        <div className="p-4">
          <p className="line-clamp-2 text-base font-bold text-zinc-950 dark:text-white">
            {item.name}
          </p>
          <p className="mt-1 text-base font-semibold text-[color:var(--brand-accent,#d81b60)]">
            {formatCurrency(item.price)}
          </p>
        </div>
      </Link>
    </div>
  );
}

function FeaturedLarge({
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900/40"
      href={itemHref(item)}
    >
      <div className="relative h-60 w-full bg-zinc-100 dark:bg-zinc-800 md:h-[400px]">
        <Image
          alt={item.imageAlt}
          className="object-cover brightness-[1.02] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          src={src}
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
        <h3 className="font-display text-xl font-bold text-zinc-950 group-hover:text-[color:var(--brand-accent,#d81b60)] dark:text-white md:text-2xl">
          {item.name}
        </h3>
        <p className="line-clamp-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[17px] md:leading-[1.6]">
          {desc}
        </p>
        <p className="mt-auto text-lg font-bold text-[color:var(--brand-accent,#d81b60)]">
          {formatCurrency(item.sizePricing?.small ?? item.price)}
        </p>
      </div>
    </Link>
  );
}

function FeaturedSmall({
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
      className="group flex overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900/40"
      href={itemHref(item)}
    >
      <div className="relative h-28 w-28 shrink-0 bg-zinc-100 dark:bg-zinc-800 sm:h-32 sm:w-36">
        <Image
          alt={item.imageAlt}
          className="object-cover brightness-[1.02] contrast-[1.05]"
          fill
          sizes="144px"
          src={src}
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 p-3 sm:p-4">
        <h3 className="text-base font-bold text-zinc-950 group-hover:text-[color:var(--brand-accent,#d81b60)] dark:text-white">
          {item.name}
        </h3>
        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
        <p className="text-sm font-bold text-[color:var(--brand-accent,#d81b60)]">
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
    <li className="flex min-h-16 items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-0 dark:border-white/5 md:min-h-[72px]">
      <div className="min-w-0 flex-1">
        <Link
          className="font-semibold text-zinc-950 hover:text-[color:var(--brand-accent,#d81b60)] dark:text-white"
          href={itemHref(item)}
        >
          {item.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 md:text-base">
          {formatCurrency(item.sizePricing?.small ?? item.price)}
        </span>
        {customize ? (
          <Button
            asChild
            className="h-8 w-8 rounded-full bg-[color:var(--brand-accent,#d81b60)] p-0 hover:brightness-110"
            size="icon"
          >
            <Link aria-label={`Customize ${item.name}`} href={itemHref(item)}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            aria-label={`Add ${item.name}`}
            className="h-8 w-8 rounded-full bg-[color:var(--brand-accent,#d81b60)] p-0 hover:brightness-110"
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
    <div className="space-y-3">
      {categories.map((cat) => {
        const catItems = items
          .filter((item) => item.category === cat.value)
          .sort((a, b) => a.number - b.number);
        if (catItems.length === 0) return null;
        const isOpen = open === cat.value;
        return (
          <div
            className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900/40"
            key={cat.value}
          >
            <button
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 bg-zinc-50/80 px-5 py-4 text-left dark:bg-zinc-900/60"
              onClick={() => setOpen(isOpen ? null : cat.value)}
              type="button"
            >
              <span className="font-display text-lg font-bold text-zinc-900 dark:text-white md:text-xl">
                {cat.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen ? (
              <ul className="bg-white px-5 dark:bg-zinc-950/40">
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

function OrderNowFab(): React.ReactElement | null {
  const { cartCount, setCartOpen } = useCart();
  const useNextOrder = isNextOrderOrderingEnabled();

  if (useNextOrder) {
    return (
      <Link
        className="fixed bottom-5 right-4 z-[55] inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:brightness-110 md:bottom-8 md:right-8"
        href={ORDER_ONLINE_HREF}
      >
        <ShoppingBag className="h-4 w-4" />
        Order Now
      </Link>
    );
  }

  return (
    <button
      className="fixed bottom-5 right-4 z-[55] inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:brightness-110 md:hidden"
      onClick={() => {
        if (cartCount > 0) {
          setCartOpen(true);
        } else {
          window.location.href = "/menu";
        }
      }}
      type="button"
    >
      <ShoppingBag className="h-4 w-4" />
      Order Now
    </button>
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
  const isHome = variant === "home";

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
  const largeFeature = featured[0];
  const smallFeatures = featured.slice(1, 3);

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      {isHome ? (
        <section className="relative min-h-[60vh] overflow-hidden border-b border-zinc-200/70 dark:border-white/10 md:min-h-[70vh]">
          <div className="absolute inset-0 bg-zinc-900">
            {heroSrc ? (
              <Image
                alt=""
                className="object-cover opacity-50 brightness-[1.02] contrast-[1.05]"
                fill
                priority
                sizes="100vw"
                src={heroSrc}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/92 via-zinc-950/70 to-zinc-950/35" />
          </div>
          <div className="relative mx-auto flex min-h-[60vh] max-w-container-max flex-col justify-end gap-5 px-margin-mobile pb-12 pt-24 md:min-h-[70vh] md:px-margin-desktop md:pb-20 md:pt-28">
            <p className="font-label-md text-xs font-semibold uppercase tracking-[0.22em] text-white/70 animate-in fade-in duration-700">
              {brandName}
            </p>
            <h1 className="max-w-2xl font-display text-[32px] font-bold leading-[1.1] tracking-tight text-white animate-in fade-in slide-in-from-bottom-2 duration-700 md:text-[52px] lg:text-[56px]">
              {tagline?.trim() || "Deals worth scrolling for"}
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-white/75 md:text-[17px] md:leading-[1.6]">
              {topDeal
                ? `This week: ${topDeal.name} from ${formatCurrency(topDeal.price)}.`
                : "Browse specials, featured picks, and the full menu."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="h-auto rounded-full bg-[color:var(--brand-accent,#d81b60)] px-8 py-4 text-sm font-semibold hover:brightness-110"
              >
                <Link href={deals.length ? "/deals" : "/menu"}>
                  {deals.length ? "View deals" : "View full menu"}
                </Link>
              </Button>
              {!useNextOrder ? (
                <Button
                  asChild
                  className="h-auto rounded-full border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20"
                  variant="outline"
                >
                  <Link href="/menu">View full menu</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="h-auto rounded-full border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20"
                  variant="outline"
                >
                  <Link href={ORDER_ONLINE_HREF}>Order online</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {isHome && deals.length > 0 ? (
        <section className="border-b border-zinc-200/70 py-12 dark:border-white/10 md:py-24">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="mb-6 flex items-end justify-between gap-3 md:mb-8">
              <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
                Deals
              </h2>
              <Link
                className="text-sm font-medium text-[color:var(--brand-accent,#d81b60)] hover:underline"
                href="/deals"
              >
                See all
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar md:gap-5">
              {deals.map((item) => (
                <DealStripCard item={item} key={item.id} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {isHome && featured.length > 0 ? (
        <section className="border-b border-zinc-200/70 py-12 dark:border-white/10 md:py-24">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="mb-6 font-display text-xl font-bold text-zinc-950 dark:text-white md:mb-8 md:text-2xl">
              Featured picks
            </h2>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-5">
              {largeFeature ? (
                <FeaturedLarge brandSlug={brandSlug} item={largeFeature} />
              ) : null}
              <div className="flex flex-col gap-4">
                {smallFeatures.map((item) => (
                  <FeaturedSmall brandSlug={brandSlug} item={item} key={item.id} />
                ))}
              </div>
            </div>
            <div className="mt-8 flex justify-center md:mt-10">
              <Button
                asChild
                className="h-auto rounded-full bg-[color:var(--brand-accent,#d81b60)] px-8 py-4 text-sm font-semibold hover:brightness-110"
              >
                <Link href="/menu">View full menu →</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {!isHome && !useNextOrder ? (
        <section className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-24">
          <h1 className="mb-2 font-display text-3xl font-bold text-zinc-950 dark:text-white md:text-4xl">
            Menu
          </h1>
          <p className="mb-8 max-w-xl text-[15px] text-zinc-600 dark:text-zinc-400 md:mb-10 md:text-[17px] md:leading-[1.6]">
            Browse by category. Add simple items here, or open a dish for full
            customize options.
          </p>
          <CategoryAccordion
            brandSlug={brandSlug}
            categories={categories}
            defaultOpen={categories[0]?.value}
            items={menuItems}
            onAddToCart={addToCart}
          />
        </section>
      ) : null}

      {isHome && (tagline || address) ? (
        <section className="border-t border-zinc-200/70 bg-zinc-50/80 py-12 dark:border-white/10 dark:bg-zinc-950/50 md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
              About {brandName}
            </h2>
            {tagline ? (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[17px] md:leading-[1.6]">
                {tagline}
              </p>
            ) : null}
            {address ? (
              <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 md:text-base">
                {address}
              </p>
            ) : null}
            <Link
              className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand-accent,#d81b60)] hover:underline"
              href="/about"
            >
              Our story →
            </Link>
          </div>
        </section>
      ) : null}

      {isHome || !useNextOrder ? <OrderNowFab /> : null}
    </main>
  );
}
