"use client";

import { formatCurrency } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface DetailCtaProps {
  totalPrice: number;
  onAddToOrder: () => void;
  className?: string;
}

export function DetailCta({
  totalPrice,
  onAddToOrder,
  className = "",
}: DetailCtaProps): React.ReactElement {
  return (
    <button
      className={cn(
        "w-full min-h-12 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-6 py-4 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent,#d81b60)] focus-visible:ring-offset-2",
        className
      )}
      onClick={onAddToOrder}
      type="button"
    >
      Add to cart — {formatCurrency(totalPrice)}
    </button>
  );
}
