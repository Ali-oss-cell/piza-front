"use client";

import { Bike, Receipt, ShoppingBag } from "lucide-react";
import { useMinuteClock } from "@/hooks/use-minute-clock";
import { describeOpenStatus } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

interface StoreInfoChipsProps {
  openingHours?: unknown;
  deliveryFee?: string | number | null;
  minOrderAmount?: string | number | null;
  className?: string;
}

export function formatMoneyShort(value: string | number | null | undefined): string | null {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(amount)) {
    return null;
  }
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

const chipClassName =
  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md " +
  "border-zinc-200/80 bg-white/85 text-zinc-800 dark:border-white/15 dark:bg-zinc-950/70 dark:text-zinc-100";

/** Open status, delivery fee and minimum order — the three things people check before ordering. */
export function StoreInfoChips({
  openingHours,
  deliveryFee,
  minOrderAmount,
  className,
}: StoreInfoChipsProps): React.ReactElement | null {
  const now = useMinuteClock();
  const status = now ? describeOpenStatus(openingHours, now) : null;
  const fee = formatMoneyShort(deliveryFee);
  const minimum = formatMoneyShort(minOrderAmount);

  if (!status && !fee && !minimum) {
    return null;
  }

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {status ? (
        <li className={chipClassName}>
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 rounded-full",
              status.isOpen ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-400",
            )}
          />
          {status.label}
        </li>
      ) : null}
      <li className={chipClassName}>
        <ShoppingBag aria-hidden className="h-3.5 w-3.5" />
        Pickup
      </li>
      {fee ? (
        <li className={chipClassName}>
          <Bike aria-hidden className="h-3.5 w-3.5" />
          {fee} delivery
        </li>
      ) : null}
      {minimum ? (
        <li className={chipClassName}>
          <Receipt aria-hidden className="h-3.5 w-3.5" />
          {minimum} min order
        </li>
      ) : null}
    </ul>
  );
}
