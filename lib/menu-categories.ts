import type { AdminMenuCategoryRecord } from "@/types/admin";

export function hasSizePricing(
  categorySlug: string,
  categories: AdminMenuCategoryRecord[]
): boolean {
  return (
    categories.find((entry) => entry.slug === categorySlug)?.supportsSizeOptions ?? false
  );
}

export function slugifyMenuName(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatMenuCategory(category: string, categories?: AdminMenuCategoryRecord[]): string {
  const match = categories?.find((entry) => entry.slug === category);
  if (match) {
    return match.label;
  }

  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
