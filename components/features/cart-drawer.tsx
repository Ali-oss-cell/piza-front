"use client";

import Link from "next/link";
import { CartItemRow } from "@/components/features/cart-item-row";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  brandPink,
  panelBg,
  panelFooter,
  primaryText,
  secondaryText,
  themeTransition,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { CartItem, DeliveryMode } from "@/types/menu";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  deliveryMode: DeliveryMode;
  deliveryFeeAmount: number;
  onDeliveryModeChange: (mode: DeliveryMode) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

function deliveryModeButtonClass(isActive: boolean): string {
  return cn(
    "flex-1 rounded py-3 text-label-md transition-all duration-150 ease-out",
    isActive
      ? "bg-[#d81b60] text-white shadow-md shadow-[#d81b60]/20"
      : cn(secondaryText, "hover:text-zinc-950 dark:hover:text-zinc-50")
  );
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  deliveryMode,
  deliveryFeeAmount,
  onDeliveryModeChange,
  onIncrement,
  onDecrement,
  onRemove,
}: CartDrawerProps): React.ReactElement {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMode === "delivery" ? deliveryFeeAmount : 0;
  const total = subtotal + deliveryFee;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="flex flex-col bg-white p-0 dark:bg-zinc-950">
        <div className="p-8">
          <h2 className={cn("font-display text-headline-md", primaryText)}>Your Cart</h2>
          <span className={cn("mt-1 inline-block text-label-sm uppercase tracking-widest", brandPink)}>
            {items.length} Items Selected
          </span>
        </div>
        <div className="mb-8 px-8">
          <div
            className={cn(
              "flex rounded-lg border border-zinc-200/60 p-1 dark:border-white/10",
              panelBg
            )}
          >
            <button
              className={deliveryModeButtonClass(deliveryMode === "delivery")}
              onClick={() => onDeliveryModeChange("delivery")}
              type="button"
            >
              Delivery
            </button>
            <button
              className={deliveryModeButtonClass(deliveryMode === "pickup")}
              onClick={() => onDeliveryModeChange("pickup")}
              type="button"
            >
              Pickup
            </button>
          </div>
        </div>
        <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-8">
          {items.map((item) => (
            <div key={item.id}>
              <CartItemRow
                item={item}
                onDecrement={onDecrement}
                onIncrement={onIncrement}
                onRemove={onRemove}
              />
              <Separator className="mt-6" />
            </div>
          ))}
        </div>
        <div className={cn("border-t border-zinc-200/60 p-8 dark:border-white/10", panelFooter)}>
          <div className="mb-8 space-y-3">
            <div className={cn("flex justify-between", secondaryText)}>
              <span>Subtotal</span>
              <span className={primaryText}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={cn("flex justify-between", secondaryText)}>
              <span>Delivery Fee</span>
              <span className={primaryText}>${deliveryFee.toFixed(2)}</span>
            </div>
            <div
              className={cn(
                "flex justify-between border-t border-zinc-200/60 pt-3 font-display text-headline-md dark:border-white/10",
                primaryText,
                themeTransition
              )}
            >
              <span>Total</span>
              <span className={brandPink}>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button asChild className="w-full py-5 uppercase tracking-widest">
            <Link href="/checkout" onClick={() => onOpenChange(false)}>
              Proceed to Checkout
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
