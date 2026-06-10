"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { buildSizeOptions, calculatePriceBreakdown, formatCurrency } from "@/lib/pricing";
import { CustomizationPanel } from "@/components/features/product-detail/customization-panel";
import { CrustSelector } from "@/components/features/product-detail/crust-selector";
import { DetailCta } from "@/components/features/product-detail/detail-cta";
import { IngredientsSelector } from "@/components/features/product-detail/ingredients-selector";
import { ProductDetailHero } from "@/components/features/product-detail/product-detail-hero";
import { QuantitySelector } from "@/components/features/product-detail/quantity-selector";
import { SizeSelector } from "@/components/features/product-detail/size-selector";
import { ToppingsGrid } from "@/components/features/product-detail/toppings-grid";
import type { CrustOption, ProductConfiguration, ToppingCategory } from "@/types/product-detail";
import type { MenuItem, PizzaSize } from "@/types/menu";

interface ProductDetailPageProps {
  item: MenuItem;
  crustOptions: CrustOption[];
  toppingCategories: ToppingCategory[];
}

function resolveDefaultIngredients(item: MenuItem): string[] {
  if (item.ingredients && item.ingredients.length > 0) {
    return item.ingredients;
  }

  return item.description
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ProductDetailPage({
  item,
  crustOptions,
  toppingCategories,
}: ProductDetailPageProps): React.ReactElement {
  const { addToCart } = useCart();
  const hasSizeOptions = Boolean(item.sizePricing);
  const sizeOptions = useMemo(
    () => (item.sizePricing ? buildSizeOptions(item.sizePricing) : []),
    [item.sizePricing]
  );
  const ingredients = useMemo(() => resolveDefaultIngredients(item), [item]);

  const [configuration, setConfiguration] = useState<ProductConfiguration>({
    size: "S",
    crustId: crustOptions[0]?.id ?? "",
    toppingIds: [],
    removedIngredients: [],
    quantity: 1,
  });

  const priceBreakdown = useMemo(
    () =>
      calculatePriceBreakdown(item, configuration, {
        crustOptions,
        toppingCategories,
      }),
    [item, configuration, crustOptions, toppingCategories]
  );

  const selectedCrust = crustOptions.find((option) => option.id === configuration.crustId);
  const keptIngredients = ingredients.filter(
    (ingredient) => !configuration.removedIngredients.includes(ingredient)
  );

  const updateSize = (size: PizzaSize): void => {
    setConfiguration((current) => ({ ...current, size }));
  };

  const updateCrust = (crustId: string): void => {
    setConfiguration((current) => ({ ...current, crustId }));
  };

  const toggleTopping = (toppingId: string): void => {
    setConfiguration((current) => ({
      ...current,
      toppingIds: current.toppingIds.includes(toppingId)
        ? current.toppingIds.filter((id) => id !== toppingId)
        : [...current.toppingIds, toppingId],
    }));
  };

  const toggleIngredient = (ingredient: string): void => {
    setConfiguration((current) => ({
      ...current,
      removedIngredients: current.removedIngredients.includes(ingredient)
        ? current.removedIngredients.filter((entry) => entry !== ingredient)
        : [...current.removedIngredients, ingredient],
    }));
  };

  const handleAddToOrder = (): void => {
    const selectedToppingLabels = toppingCategories
      .flatMap((category) => category.toppings)
      .filter((topping) => configuration.toppingIds.includes(topping.id))
      .map((topping) => topping.label);

    addToCart({
      item,
      price: priceBreakdown.unitPrice,
      size: hasSizeOptions ? configuration.size : undefined,
      crust: selectedCrust?.label,
      toppings: selectedToppingLabels.length > 0 ? selectedToppingLabels : undefined,
      removedIngredients:
        configuration.removedIngredients.length > 0
          ? configuration.removedIngredients
          : undefined,
      quantity: configuration.quantity,
    });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-8 md:pb-16 lg:px-12">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors duration-150 ease-out hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductDetailHero item={item} />

          <div className="space-y-8">
            <header className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
                Customize your order
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
                {item.name}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
                {item.description}
              </p>
              <div className="rounded-xl border border-zinc-200/60 bg-white/70 px-5 py-4 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40">
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Current selection</p>
                <p className="mt-2 text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
                  {formatCurrency(priceBreakdown.unitPrice)}
                  <span className="ml-2 text-base font-medium text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
                    each
                  </span>
                </p>
              </div>
            </header>

            {ingredients.length > 0 ? (
              <CustomizationPanel
                subtitle="Tap any ingredient to remove it from your order"
                title="Ingredients"
              >
                <IngredientsSelector
                  ingredients={ingredients}
                  onToggle={toggleIngredient}
                  removedIngredients={configuration.removedIngredients}
                />
                {configuration.removedIngredients.length > 0 ? (
                  <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Your order:{" "}
                    <span className="font-medium text-zinc-950 dark:text-white">
                      {keptIngredients.length > 0 ? keptIngredients.join(", ") : "Base only"}
                    </span>
                    {configuration.removedIngredients.length > 0 ? (
                      <>
                        {" "}
                        · No{" "}
                        <span className="font-medium text-zinc-950 dark:text-white">
                          {configuration.removedIngredients.join(", ")}
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </CustomizationPanel>
            ) : null}

            {hasSizeOptions && sizeOptions.length > 0 ? (
              <CustomizationPanel subtitle="Choose your perfect base size" title="Size">
                <SizeSelector
                  onSelect={updateSize}
                  options={sizeOptions}
                  selectedSize={configuration.size}
                />
              </CustomizationPanel>
            ) : null}

            {crustOptions.length > 0 ? (
              <CustomizationPanel subtitle="Select your preferred bake style" title="Crust">
                <CrustSelector
                  onSelect={updateCrust}
                  options={crustOptions}
                  selectedCrustId={configuration.crustId}
                />
              </CustomizationPanel>
            ) : null}

            {toppingCategories.length > 0 ? (
              <CustomizationPanel subtitle="Build your flavor profile" title="Extra Toppings">
                <ToppingsGrid
                  categories={toppingCategories}
                  onToggle={toggleTopping}
                  selectedToppingIds={configuration.toppingIds}
                />
              </CustomizationPanel>
            ) : null}

            <CustomizationPanel subtitle="How many would you like?" title="Quantity">
              <QuantitySelector
                onDecrement={() =>
                  setConfiguration((current) => ({
                    ...current,
                    quantity: Math.max(1, current.quantity - 1),
                  }))
                }
                onIncrement={() =>
                  setConfiguration((current) => ({
                    ...current,
                    quantity: current.quantity + 1,
                  }))
                }
                quantity={configuration.quantity}
              />
            </CustomizationPanel>

            <div className="hidden rounded-xl border border-zinc-200/60 bg-white/70 p-6 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40 md:block">
              <div className="mb-4 space-y-2 text-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Base{hasSizeOptions ? ` (${configuration.size})` : ""}</span>
                  <span>{formatCurrency(priceBreakdown.basePrice)}</span>
                </div>
                {crustOptions.length > 0 ? (
                  <div className="flex justify-between">
                    <span>Crust</span>
                    <span>+{formatCurrency(priceBreakdown.crustDelta)}</span>
                  </div>
                ) : null}
                {toppingCategories.length > 0 ? (
                  <div className="flex justify-between">
                    <span>Extras</span>
                    <span>+{formatCurrency(priceBreakdown.toppingsTotal)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-zinc-200/60 pt-2 text-zinc-950 transition-colors duration-150 ease-out dark:border-white/10 dark:text-white">
                  <span>Total x{configuration.quantity}</span>
                  <span className="font-semibold">{formatCurrency(priceBreakdown.totalPrice)}</span>
                </div>
              </div>
              <DetailCta onAddToOrder={handleAddToOrder} totalPrice={priceBreakdown.totalPrice} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/60 bg-white/90 p-4 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-950/90 md:hidden">
        <DetailCta onAddToOrder={handleAddToOrder} totalPrice={priceBreakdown.totalPrice} />
      </div>
    </div>
  );
}
