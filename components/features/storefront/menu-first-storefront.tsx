"use client";

import { useMemo, useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { CtaBand } from "@/components/features/content/cta-band";
import { ItemDetailSheet } from "@/components/features/storefront/item-detail-sheet";
import { MenuDenseGrid } from "@/components/features/storefront/menu-dense-grid";
import { StickyCartBar } from "@/components/features/storefront/sticky-cart-bar";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { useCart } from "@/lib/cart-context";
import { formatOpeningHoursLines } from "@/lib/opening-hours";
import { formatCurrency } from "@/lib/pricing";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

function statusLabel(input: {
  openingHours?: unknown;
  deliveryFee?: string | number | null;
  tagline?: string;
}): string {
  const hours = formatOpeningHoursLines(input.openingHours);
  if (hours[0]) return hours[0];
  if (input.deliveryFee != null && input.deliveryFee !== "") {
    const fee = Number(input.deliveryFee);
    if (Number.isFinite(fee)) {
      return fee <= 0 ? "Free delivery" : `Delivery ${formatCurrency(fee)}`;
    }
  }
  return input.tagline?.trim() || "Order for pickup or delivery";
}

export function MenuFirstStorefront(props: StorefrontProps): React.ReactElement {
  const { menuItems, categories, brandName, brandSlug } = props;
  const { addToCart, cartCount } = useCart();
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.value ?? "deals"
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const useNextOrder = isNextOrderOrderingEnabled();
  const status = useMemo(
    () =>
      statusLabel({
        openingHours: props.openingHours,
        deliveryFee: props.deliveryFee,
        tagline: props.tagline,
      }),
    [props.openingHours, props.deliveryFee, props.tagline]
  );

  const openItem = (item: MenuItem): void => {
    setSelectedItem(item);
    setSheetOpen(true);
  };

  return (
    <main className="pt-16 transition-colors duration-150 ease-out md:pt-[4.5rem]">
      <div className="h-12 border-b border-zinc-200/70 bg-zinc-50/90 px-margin-mobile dark:border-white/10 dark:bg-zinc-950/80 md:h-14 md:px-margin-desktop">
        <div className="mx-auto flex h-full max-w-container-max items-center justify-between gap-3">
          <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300 md:text-sm">
            <span className="font-semibold text-zinc-900 dark:text-white">
              {brandName ?? "Menu"}
            </span>
            <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
            {status}
          </p>
        </div>
      </div>

      {useNextOrder ? (
        <CtaBand
          className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-12"
          description="Browse the full menu and order pickup or delivery."
          primaryHref={ORDER_ONLINE_HREF}
          primaryLabel="Order online"
          title="Ready to order?"
        />
      ) : (
        <>
          <div className="lg:hidden">
            <CategoryTabs
              activeCategory={activeCategory}
              categories={categories}
              compact
              onSelectCategory={setActiveCategory}
              variant="pills"
            />
          </div>

          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto py-6 lg:block">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Categories
                </p>
                <nav className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const isActive = activeCategory === category.value;
                    return (
                      <button
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-[color:var(--brand-accent,#d81b60)] text-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        )}
                        key={category.value}
                        onClick={() => setActiveCategory(category.value)}
                        type="button"
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div>
                <h2 className="hidden pt-6 text-xl font-bold text-zinc-950 dark:text-white lg:block md:text-2xl">
                  {categories.find((c) => c.value === activeCategory)?.label ?? "Menu"}
                </h2>
                <MenuDenseGrid
                  activeCategory={activeCategory}
                  brandSlug={brandSlug}
                  items={menuItems}
                  onAddToCart={addToCart}
                  onOpenItem={openItem}
                  paddedForCartBar={cartCount > 0}
                />
              </div>
            </div>
          </div>

          <StickyCartBar />
          <ItemDetailSheet
            brandSlug={brandSlug}
            item={selectedItem}
            onOpenChange={setSheetOpen}
            open={sheetOpen}
          />
        </>
      )}
    </main>
  );
}
