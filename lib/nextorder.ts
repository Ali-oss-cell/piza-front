/** Native in-app menu path (cart + checkout). */
export const MENU_HREF = "/menu";

/** Legacy path — redirects to NextOrder only if explicitly enabled. */
export const ORDER_ONLINE_HREF = "/order-online";

// Local declaration so this file typechecks without node_modules/@types/node.
// Next.js still inlines NEXT_PUBLIC_* from the static process.env access below.
declare const process: {
  env: {
    NEXT_PUBLIC_NEXTORDER_URL?: string;
  };
};

/**
 * External NextOrder URL when online ordering is delegated.
 * Opt-in only: set NEXT_PUBLIC_NEXTORDER_URL on the web build.
 * Empty / unset = use native Marina menu + cart.
 */
export function getNextOrderUrl(): string {
  return process.env.NEXT_PUBLIC_NEXTORDER_URL?.trim() || "";
}

/** @deprecated Use getNextOrderUrl */
export function getNextOrderEmbedUrl(): string {
  return getNextOrderUrl();
}

export function isNextOrderOrderingEnabled(): boolean {
  return getNextOrderUrl().length > 0;
}

/** Primary “order / browse menu” href for CTAs and nav. */
export function getOrderingHref(): string {
  return isNextOrderOrderingEnabled() ? ORDER_ONLINE_HREF : MENU_HREF;
}

export function isOrderOnlinePath(pathname: string): boolean {
  return pathname === ORDER_ONLINE_HREF || pathname.startsWith(`${ORDER_ONLINE_HREF}/`);
}

export function isMenuOrderingPath(pathname: string): boolean {
  return (
    isOrderOnlinePath(pathname) ||
    pathname === MENU_HREF ||
    pathname.startsWith(`${MENU_HREF}/`)
  );
}
