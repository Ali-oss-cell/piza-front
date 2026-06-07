import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { label: "Menu", href: "/" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Menu", href: "/" },
  { label: "Deals", href: "/deals" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
  { label: "Track Order", href: "/track-order" },
];

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/menu");
  }

  return pathname === href;
}

export function getDesktopNavLinkClass(isActive: boolean): string {
  return cn(
    "transition-colors duration-150 ease-out",
    isActive
      ? "border-b-2 border-[#d81b60] py-1 font-bold text-[#d81b60]"
      : "font-medium text-zinc-500 hover:text-[#d81b60] dark:text-zinc-400 dark:hover:text-[#d81b60]"
  );
}

export function getMobileNavLinkClass(isActive: boolean): string {
  return cn(
    "block text-headline-md transition-colors duration-150 ease-out",
    isActive
      ? "font-bold text-[#d81b60]"
      : "font-medium text-zinc-500 hover:text-[#d81b60] dark:text-zinc-400 dark:hover:text-[#d81b60]"
  );
}
