import type { ProductConfiguration, ProductSizeOption, PriceBreakdown } from "@/types/product-detail";
import type { CrustOption, ToppingCategory } from "@/types/product-detail";
import type { MenuItem, PizzaSize, SizePricing } from "@/types/menu";

export function buildSizeOptions(sizePricing: SizePricing): ProductSizeOption[] {
  return [
    {
      id: "S",
      label: "Small",
      price: sizePricing.small,
      deltaFromSmall: 0,
    },
    {
      id: "L",
      label: "Large",
      price: sizePricing.large,
      deltaFromSmall: sizePricing.large - sizePricing.small,
    },
    {
      id: "F",
      label: "Family",
      price: sizePricing.family,
      deltaFromSmall: sizePricing.family - sizePricing.small,
    },
  ];
}

export function getBasePriceForSize(item: MenuItem, size: PizzaSize): number {
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

export function calculatePriceBreakdown(
  item: MenuItem,
  configuration: ProductConfiguration,
  catalogs: {
    crustOptions: CrustOption[];
    toppingCategories: ToppingCategory[];
  }
): PriceBreakdown {
  const basePrice = getBasePriceForSize(item, configuration.size);
  const crust = catalogs.crustOptions.find((option) => option.id === configuration.crustId);
  const crustDelta = crust?.priceDelta ?? 0;

  const allToppings = catalogs.toppingCategories.flatMap((category) => category.toppings);
  const toppingsTotal = configuration.toppingIds.reduce((sum, toppingId) => {
    const topping = allToppings.find((option) => option.id === toppingId);
    return sum + (topping?.priceDelta ?? 0);
  }, 0);

  const unitPrice = basePrice + crustDelta + toppingsTotal;
  const totalPrice = unitPrice * configuration.quantity;

  return {
    basePrice,
    crustDelta,
    toppingsTotal,
    unitPrice,
    totalPrice,
  };
}

export function formatCurrency(price: number): string {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}
