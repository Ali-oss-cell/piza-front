"use client";

import { formatCurrency } from "@/lib/pricing";

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
      className={`w-full rounded-xl bg-[#d81b60] px-6 py-4 text-base font-semibold text-white transition-all hover:scale-[1.01] hover:bg-[#c2185b] active:scale-[0.99] ${className}`}
      onClick={onAddToOrder}
      type="button"
    >
      Add to Order — {formatCurrency(totalPrice)}
    </button>
  );
}
