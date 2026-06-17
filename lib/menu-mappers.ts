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

function resolveSizePricing(item: AdminMenuItem): SizePricing | undefined {
  if (item.sizePricing) {
    return {
      small: Number(item.sizePricing.small ?? item.price),
      large: Number(item.sizePricing.large ?? item.price),
      family: Number(item.sizePricing.family ?? item.price),
    };
  }

  if (item.sizeOptions) {
    const options = sizeOptionsFromApi(item.sizeOptions);
    const hasEnabled =
      options.small.enabled || options.large.enabled || options.family.enabled;

    if (hasEnabled) {
      return toLegacySizePricing(options);
    }
  }

  return undefined;
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
