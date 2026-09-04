import { BENNY_BOYS_NEXTORDER_URL } from "@/types/brand";

/** Internal path that redirects to NextOrder (bookmarks / old links). */
export const ORDER_ONLINE_HREF = "/order-online";

export function getNextOrderUrl(): string {
  const configured = process.env.NEXT_PUBLIC_NEXTORDER_URL?.trim();
  return configured || BENNY_BOYS_NEXTORDER_URL;
}

/** @deprecated Use getNextOrderUrl */
export function getNextOrderEmbedUrl(): string {
  return getNextOrderUrl();
}

export function isNextOrderOrderingEnabled(): boolean {
  return getNextOrderUrl().length > 0;
}

export function isOrderOnlinePath(pathname: string): boolean {
  return pathname === ORDER_ONLINE_HREF || pathname.startsWith(`${ORDER_ONLINE_HREF}/`);
}

export function isMenuOrderingPath(pathname: string): boolean {
  return (
    isOrderOnlinePath(pathname) ||
    pathname === "/menu" ||
    pathname.startsWith("/menu/")
  );
}
