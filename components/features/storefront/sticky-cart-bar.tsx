"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface StickyCartBarProps {
  className?: string;
}

export function StickyCartBar({ className }: StickyCartBarProps): React.ReactElement | null {
  const { items, cartCount, isCartReady, setCartOpen } = useCart();

  if (!isCartReady || cartCount <= 0) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[55] border-t border-zinc-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-lg dark:border-white/10 dark:bg-zinc-950/95 md:hidden",
        "pb-[max(0.625rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <button
        className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl bg-[color:var(--brand-accent,#d81b60)] px-4 text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-[0.99]"
        onClick={() => setCartOpen(true)}
        type="button"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-5 w-5" />
          View Cart ({cartCount})
        </span>
        <span className="text-base font-bold">{formatCurrency(subtotal)}</span>
      </button>
    </div>
  );
}
