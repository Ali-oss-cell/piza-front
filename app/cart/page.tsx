"use client";

import { useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useCart } from "@/lib/cart-context";

export default function CartPage(): React.ReactElement {
  const { setCartOpen, cartCount, isCartReady } = useCart();

  useEffect(() => {
    if (isCartReady && cartCount > 0) {
      setCartOpen(true);
    }
  }, [setCartOpen, cartCount, isCartReady]);

  return (
    <main className="min-h-[70vh] bg-white px-margin-mobile py-16 transition-colors duration-150 ease-out dark:bg-black md:px-margin-desktop md:py-24">
      <div className="mx-auto max-w-lg">
        <EmptyState
          actionHref="/menu"
          actionLabel="Browse menu"
          description={
            cartCount > 0
              ? "Your cart drawer is open — continue checkout from there, or add more from the menu."
              : "Add something delicious from the menu and your order will show up here."
          }
          icon={<ShoppingBag className="h-7 w-7" />}
          title={cartCount > 0 ? "Cart is ready" : "Your cart is empty"}
        />
      </div>
    </main>
  );
}
