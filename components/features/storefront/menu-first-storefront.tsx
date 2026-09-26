"use client";

import { useMemo, useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { MenuDenseGrid } from "@/components/features/storefront/menu-dense-grid";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { useCart } from "@/lib/cart-context";
import { formatOpeningHoursLines } from "@/lib/opening-hours";
import { formatCurrency } from "@/lib/pricing";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { CtaBand } from "@/components/features/content/cta-band";

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
  const {
    menuItems,
    categories,
    brandName,
    brandSlug,
  } = props;
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "deals");
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

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      <div className="border-b border-zinc-200/70 bg-zinc-50/90 px-margin-mobile py-2.5 dark:border-white/10 dark:bg-zinc-950/80 md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max items-center justify-between gap-3">
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
          <CategoryTabs
            activeCategory={activeCategory}
            categories={categories}
            onSelectCategory={setActiveCategory}
            variant="pills"
          />
          <MenuDenseGrid
            activeCategory={activeCategory}
            brandSlug={brandSlug}
            items={menuItems}
            onAddToCart={addToCart}
          />
        </>
      )}
    </main>
  );
}
