"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { CrustSelector } from "@/components/features/product-detail/crust-selector";
import { IngredientsSelector } from "@/components/features/product-detail/ingredients-selector";
import { QuantitySelector } from "@/components/features/product-detail/quantity-selector";
import { SizeSelector } from "@/components/features/product-detail/size-selector";
import { ToppingsGrid } from "@/components/features/product-detail/toppings-grid";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { fetchCrusts, fetchToppings } from "@/lib/menu-api";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { filterToppingsForItem, mapApiCrusts } from "@/lib/menu-mappers";
import { resolveMediaUrl } from "@/lib/media-url";
import { buildSizeOptions, calculatePriceBreakdown, formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { MenuItem, PizzaSize } from "@/types/menu";
import type { CrustOption, ProductConfiguration, ToppingCategory } from "@/types/product-detail";

interface ItemDetailSheetProps {
  item: MenuItem | null;
  brandSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ItemDetailSheet({
  item,
  brandSlug,
  open,
  onOpenChange,
}: ItemDetailSheetProps): React.ReactElement {
  const { addToCart } = useCart();
  const [crustOptions, setCrustOptions] = useState<CrustOption[]>([]);
  const [toppingCategories, setToppingCategories] = useState<ToppingCategory[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasSizeOptions = Boolean(item?.sizePricing);
  const ingredients = useMemo(
    () => (item ? resolveDefaultIngredients(item) : []),
    [item]
  );

  const [configuration, setConfiguration] = useState<ProductConfiguration>({
    size: "S",
    crustId: "",
    toppingIds: [],
    removedIngredients: [],
    quantity: 1,
  });

  useEffect(() => {
    if (!open || !item) return;
    setImageLoaded(false);
    setConfiguration({
      size: "S",
      crustId: "",
      toppingIds: [],
      removedIngredients: [],
      quantity: 1,
    });

    let cancelled = false;
    setLoadingOptions(true);
    void Promise.all([fetchCrusts(brandSlug), fetchToppings(brandSlug)])
      .then(([apiCrusts, toppingGroups]) => {
        if (cancelled) return;
        const crusts = hasSizeOptions ? mapApiCrusts(apiCrusts) : [];
        const toppings = filterToppingsForItem(
          toppingGroups,
          item.allowedToppingIds ?? []
        );
        setCrustOptions(crusts);
        setToppingCategories(toppings);
        setConfiguration((current) => ({
          ...current,
          crustId: crusts[0]?.id ?? "",
        }));
      })
      .catch(() => {
        if (cancelled) return;
        setCrustOptions([]);
        setToppingCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, item, brandSlug, hasSizeOptions]);

  const sizeOptions = useMemo(
    () => (item?.sizePricing ? buildSizeOptions(item.sizePricing) : []),
    [item?.sizePricing]
  );

  const priceBreakdown = useMemo(() => {
    if (!item) {
      return { unitPrice: 0, totalPrice: 0 };
    }
    return calculatePriceBreakdown(item, configuration, {
      crustOptions,
      toppingCategories,
    });
  }, [item, configuration, crustOptions, toppingCategories]);

  if (!item) {
    return <></>;
  }

  const imageSrc = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const desc = getMenuDisplayDescription(item, brandSlug);
  const selectedCrust = crustOptions.find((option) => option.id === configuration.crustId);
  const showToppings = toppingCategories.length > 0;
  const showCrusts = crustOptions.length > 0;
  const showIngredients = ingredients.length > 0;

  const handleAdd = (): void => {
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
    onOpenChange(false);
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out dark:bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[80] flex flex-col overflow-hidden bg-white shadow-2xl outline-none dark:bg-zinc-950",
            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
            "md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95"
          )}
        >
          <Dialog.Title className="sr-only">{item.name}</Dialog.Title>
          <Dialog.Close className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/55">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <div className="relative aspect-[16/10] w-full shrink-0 bg-zinc-100 dark:bg-zinc-800 md:aspect-[5/3]">
            {!imageLoaded ? (
              <span aria-hidden className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
            ) : null}
            <Image
              alt={item.imageAlt}
              className={cn("object-cover", imageLoaded ? "opacity-100" : "opacity-0")}
              fill
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, 512px"
              src={imageSrc}
            />
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 md:px-5">
            <div>
              <h2 className="font-display text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
                {item.name}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[15px]">
                {desc}
              </p>
              <Link
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[color:var(--brand-accent,#d81b60)] hover:underline"
                href={`/menu/${item.id}`}
                onClick={() => onOpenChange(false)}
              >
                Open full page <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {hasSizeOptions && sizeOptions.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Size
                </p>
                <SizeSelector
                  onSelect={(size: PizzaSize) =>
                    setConfiguration((current) => ({ ...current, size }))
                  }
                  options={sizeOptions}
                  selectedSize={configuration.size}
                />
              </div>
            ) : null}

            {loadingOptions ? (
              <p className="text-sm text-zinc-500">Loading options…</p>
            ) : (
              <>
                {showCrusts ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Crust
                    </p>
                    <CrustSelector
                      onSelect={(crustId) =>
                        setConfiguration((current) => ({ ...current, crustId }))
                      }
                      options={crustOptions}
                      selectedCrustId={configuration.crustId}
                    />
                  </div>
                ) : null}
                {showIngredients ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Ingredients
                    </p>
                    <IngredientsSelector
                      ingredients={ingredients}
                      onToggle={(ingredient) =>
                        setConfiguration((current) => ({
                          ...current,
                          removedIngredients: current.removedIngredients.includes(ingredient)
                            ? current.removedIngredients.filter((entry) => entry !== ingredient)
                            : [...current.removedIngredients, ingredient],
                        }))
                      }
                      removedIngredients={configuration.removedIngredients}
                    />
                  </div>
                ) : null}
                {showToppings ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Extras
                    </p>
                    <ToppingsGrid
                      categories={toppingCategories}
                      onToggle={(toppingId) =>
                        setConfiguration((current) => ({
                          ...current,
                          toppingIds: current.toppingIds.includes(toppingId)
                            ? current.toppingIds.filter((id) => id !== toppingId)
                            : [...current.toppingIds, toppingId],
                        }))
                      }
                      selectedToppingIds={configuration.toppingIds}
                    />
                  </div>
                ) : null}
              </>
            )}

            <div className="flex items-center justify-between gap-3">
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
              <span className="text-lg font-bold text-zinc-950 dark:text-white">
                {formatCurrency(priceBreakdown.totalPrice)}
              </span>
            </div>
          </div>

          <div className="shrink-0 border-t border-zinc-200/70 p-4 dark:border-white/10">
            <Button
              className="h-12 w-full rounded-full bg-[color:var(--brand-accent,#d81b60)] px-8 text-sm font-semibold hover:brightness-110"
              onClick={handleAdd}
              type="button"
            >
              Add to cart · {formatCurrency(priceBreakdown.totalPrice)}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
