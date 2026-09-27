import {
  sizeOptionsFromApi,
  sizeOptionsFromLegacyPricing,
  type SizeOptions,
} from "@/lib/size-options";
import type { AdminMenuItem, ToppingCategoryGroup } from "@/types/admin";
import type { ApiMenuCategory } from "@/lib/menu-api";
import type { AdminCrustOption } from "@/types/store";
import type { CrustOption, ToppingCategory } from "@/types/product-detail";
import type { MenuItem, SizePricing } from "@/types/menu";

export interface CategoryTab {
  value: string;
  label: string;
}

function toLegacySizePricing(sizeOptions: SizeOptions): SizePricing {
  return {
    small: sizeOptions.small.price,
    large: sizeOptions.large.price,
    family: sizeOptions.family.price,
  };
}

function isBrokenSizePricing(pricing: SizePricing | undefined): boolean {
  if (!pricing) {
    return true;
  }
  return pricing.small <= 0 && pricing.large <= 0 && pricing.family <= 0;
}

function resolveSizePricing(item: AdminMenuItem): SizePricing | undefined {
  const fromOptions = item.sizeOptions
    ? sizeOptionsFromApi(item.sizeOptions as SizeOptions)
    : null;

  const optionsPricing =
    fromOptions &&
    (fromOptions.small.enabled || fromOptions.large.enabled || fromOptions.family.enabled)
      ? toLegacySizePricing(fromOptions)
      : undefined;

  const legacyPricing = item.sizePricing
    ? {
        small: Number(item.sizePricing.small ?? 0),
        large: Number(item.sizePricing.large ?? 0),
        family: Number(item.sizePricing.family ?? 0),
      }
    : undefined;

  // Prefer sizeOptions when sizePricing is missing or all zeros (bad import).
  let resolved =
    optionsPricing && !isBrokenSizePricing(optionsPricing)
      ? optionsPricing
      : legacyPricing && !isBrokenSizePricing(legacyPricing)
        ? legacyPricing
        : optionsPricing ?? legacyPricing;

  if (!resolved) {
    return undefined;
  }

  // Last resort: fill zeros from the item base price so cards never show $0.
  const fallback = Number(item.price) > 0 ? Number(item.price) : 0;
  if (fallback > 0 && isBrokenSizePricing(resolved)) {
    return { small: fallback, large: fallback, family: fallback };
  }

  return {
    small: resolved.small > 0 ? resolved.small : fallback,
    large: resolved.large > 0 ? resolved.large : fallback,
    family: resolved.family > 0 ? resolved.family : fallback,
  };
}

export function mapApiMenuItem(item: AdminMenuItem): MenuItem {
  const sizePricing = resolveSizePricing(item);

  return {
    id: item.slug,
    apiId: item.id,
    slug: item.slug,
    number: item.number,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    category: item.categorySlug,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    badges: item.badges,
    sizePricing,
    priceNote: item.priceNote ?? undefined,
    ingredients: item.ingredients ?? [],
    allowedToppingIds: item.allowedToppingIds ?? [],
  };
}

export function mapApiMenuCategories(categories: ApiMenuCategory[]): CategoryTab[] {
  return categories
    .filter((category) => category.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map((category) => ({
      value: category.slug,
      label: category.label,
    }));
}

export function mapApiToppings(groups: ToppingCategoryGroup[]): ToppingCategory[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    toppings: group.toppings
      .filter((topping) => topping.isActive)
      .map((topping) => ({
        id: topping.slug,
        label: topping.label,
        priceDelta: Number(topping.priceDelta),
      })),
  }));
}

export function filterToppingsForItem(
  groups: ToppingCategoryGroup[],
  allowedToppingIds: string[]
): ToppingCategory[] {
  const mapped = mapApiToppings(groups);

  if (allowedToppingIds.length === 0) {
    return mapped;
  }

  return mapped
    .map((group) => ({
      ...group,
      toppings: group.toppings.filter((topping) => allowedToppingIds.includes(topping.id)),
    }))
    .filter((group) => group.toppings.length > 0);
}

export function mapApiCrusts(crusts: AdminCrustOption[]): CrustOption[] {
  return crusts
    .filter((crust) => crust.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    .map((crust) => ({
      id: crust.slug,
      label: crust.label,
      priceDelta: Number(crust.priceDelta),
    }));
}
