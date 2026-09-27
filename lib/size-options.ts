export interface SizeOptionValue {
  enabled: boolean;
  price: number;
}

export interface SizeOptions {
  small: SizeOptionValue;
  large: SizeOptionValue;
  family: SizeOptionValue;
}

export function createDefaultSizeOptions(
  small = 20,
  large = 24,
  family = 28
): SizeOptions {
  return {
    small: { enabled: true, price: small },
    large: { enabled: true, price: large },
    family: { enabled: true, price: family },
  };
}

export function sizeOptionsFromLegacyPricing(pricing?: {
  small?: number;
  large?: number;
  family?: number;
} | null): SizeOptions {
  return createDefaultSizeOptions(
    Number(pricing?.small ?? 20),
    Number(pricing?.large ?? 24),
    Number(pricing?.family ?? 28)
  );
}

export function sizeOptionsFromApi(
  value: SizeOptions | Record<string, SizeOptionValue> | null | undefined
): SizeOptions {
  if (!value) {
    return createDefaultSizeOptions();
  }

  const raw = value as Record<string, SizeOptionValue | undefined>;
  const small = raw.small ?? raw.SMALL;
  const large = raw.large ?? raw.LARGE;
  const family = raw.family ?? raw.FAMILY;

  return {
    small: {
      enabled: small?.enabled ?? true,
      price: Number(small?.price ?? 0),
    },
    large: {
      enabled: large?.enabled ?? true,
      price: Number(large?.price ?? 0),
    },
    family: {
      enabled: family?.enabled ?? true,
      price: Number(family?.price ?? 0),
    },
  };
}

export function deriveBasePrice(sizeOptions: SizeOptions): number {
  const enabled = [sizeOptions.small, sizeOptions.large, sizeOptions.family].filter(
    (option) => option.enabled
  );

  return enabled[0]?.price ?? sizeOptions.large.price;
}

export function parseIngredientInput(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function formatIngredients(ingredients: string[]): string {
  return ingredients.join(", ");
}

export const SIZE_OPTION_FIELDS = [
  { key: "small" as const, label: "Small (S)" },
  { key: "large" as const, label: "Large (L)" },
  { key: "family" as const, label: "Family (F)" },
];
