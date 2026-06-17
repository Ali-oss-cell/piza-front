"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { brandPink, cardShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export function CheckoutConfirmationPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className={cn("w-full p-8", cardShell)}>
        <CheckCircle2 className={cn("mx-auto h-14 w-14", brandPink)} />
        <h1 className={cn("mt-4 font-display text-headline-md", primaryText)}>
          Order received
        </h1>
        <p className={cn("mt-3 text-sm", secondaryText)}>
          Thanks for your order. We will start preparing it for your selected time.
        </p>
        {orderId ? (
          <p className={cn("mt-4 text-sm font-medium", primaryText)}>
            Reference: <span className={brandPink}>{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-[#d81b60] px-5 py-3 text-sm font-semibold text-white"
            href="/"
          >
            Back to menu
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold dark:border-white/10"
            href="/track-order"
          >
            Track order
          </Link>
        </div>
      </div>
    </main>
  );
}
