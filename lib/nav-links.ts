import { cn } from "@/lib/utils";
import { isMenuOrderingPath, ORDER_ONLINE_HREF } from "@/lib/nextorder";

export interface NavItem {
  label: string;
  href: string;
}

export const DESKTOP_NAV_ITEMS: NavItem[] = [
  { label: "Menu", href: ORDER_ONLINE_HREF },
  { label: "Deals", href: "/deals" },
  { label: "Catering", href: "/catering" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Menu", href: ORDER_ONLINE_HREF },
  { label: "Deals", href: "/deals" },
  { label: "Catering", href: "/catering" },
  { label: "Locations", href: "/locations" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "Track Order", href: "/track-order" },
];

export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === ORDER_ONLINE_HREF) {
    return isMenuOrderingPath(pathname);
  }

  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDesktopNavLinkClass(isActive: boolean): string {
  return cn(
    "transition-colors duration-150 ease-out",
    isActive
      ? "border-b-2 border-[color:var(--brand-accent,#d81b60)] py-1 font-bold text-[color:var(--brand-accent,#d81b60)]"
      : "font-medium text-zinc-500 hover:text-[color:var(--brand-accent,#d81b60)] dark:text-zinc-400 dark:hover:text-[color:var(--brand-accent,#d81b60)]"
  );
}

export function getMobileNavLinkClass(isActive: boolean): string {
  return cn(
    "block text-headline-md transition-colors duration-150 ease-out",
    isActive
      ? "font-bold text-[color:var(--brand-accent,#d81b60)]"
      : "font-medium text-zinc-500 hover:text-[color:var(--brand-accent,#d81b60)] dark:text-zinc-400 dark:hover:text-[color:var(--brand-accent,#d81b60)]"
  );
}
