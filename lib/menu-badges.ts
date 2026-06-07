import type { LucideIcon } from "lucide-react";
import { Flame, Leaf, Sparkles } from "lucide-react";

export type MenuItemBadge = "SIGNATURE" | "SPICY" | "VEGAN";

export interface MenuBadgeDefinition {
  id: MenuItemBadge;
  label: string;
  description: string;
  icon: LucideIcon;
  className: string;
}

export const MENU_ITEM_BADGES: MenuBadgeDefinition[] = [
  {
    id: "SIGNATURE",
    label: "Signature",
    description: "House specialty or chef's pick",
    icon: Sparkles,
    className:
      "border-[#d81b60]/30 bg-[#d81b60]/15 text-[#d81b60] dark:border-[#d81b60]/40 dark:bg-[#d81b60]/20",
  },
  {
    id: "SPICY",
    label: "Hot",
    description: "Spicy or chilli-forward pizza",
    icon: Flame,
    className:
      "border-orange-500/30 bg-orange-500/15 text-orange-600 dark:border-orange-400/40 dark:bg-orange-500/20 dark:text-orange-300",
  },
  {
    id: "VEGAN",
    label: "Vegan",
    description: "Plant-based item",
    icon: Leaf,
    className:
      "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
];

const badgeMap = new Map(MENU_ITEM_BADGES.map((badge) => [badge.id, badge]));

export function getMenuBadgeDefinition(id: MenuItemBadge): MenuBadgeDefinition {
  return badgeMap.get(id)!;
}

export function sortMenuBadges(badges: MenuItemBadge[]): MenuItemBadge[] {
  const order = MENU_ITEM_BADGES.map((badge) => badge.id);
  return [...badges].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
