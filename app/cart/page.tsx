"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export default function CartPage(): React.ReactElement {
  const { setCartOpen } = useCart();

  useEffect(() => {
    setCartOpen(true);
  }, [setCartOpen]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white transition-colors duration-150 ease-out dark:bg-black">
      <div className="fixed inset-0 opacity-40 grayscale">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-headline-xl text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
              Artisanal Dining, Redefined.
            </h1>
            <p className="mt-3 text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              Cart-focused route migrated from the Stitch side panel view.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">Back to Menu</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
