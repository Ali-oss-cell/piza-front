import { BENNY_BOYS_NEXTORDER_URL } from "@/types/brand";

export const ORDER_ONLINE_HREF = "/order-online";

export function getNextOrderEmbedUrl(): string {
  const configured = process.env.NEXT_PUBLIC_NEXTORDER_URL?.trim();
  return configured || BENNY_BOYS_NEXTORDER_URL;
}

export function isNextOrderOrderingEnabled(): boolean {
  return getNextOrderEmbedUrl().length > 0;
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
