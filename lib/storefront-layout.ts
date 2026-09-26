export type StorefrontLayoutId = "classic" | "menu_first" | "magazine";

export const STOREFRONT_LAYOUTS: Array<{
  id: StorefrontLayoutId;
  label: string;
  blurb: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    blurb: "Full-bleed hero, then category tabs and menu grid.",
  },
  {
    id: "menu_first",
    label: "Menu-first",
    blurb: "Slim status bar and sticky categories — order in one scroll.",
  },
  {
    id: "magazine",
    label: "Magazine",
    blurb: "Deals and featured picks first, then a compact menu list.",
  },
];

export function parseStorefrontLayout(raw: unknown): StorefrontLayoutId {
  const value = String(raw ?? "classic")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (value === "menu_first") return "menu_first";
  if (value === "magazine") return "magazine";
  return "classic";
}
