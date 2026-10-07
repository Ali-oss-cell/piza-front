"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
  fetchCheckoutOrderStatus,
  type CheckoutOrderStatus,
} from "@/lib/orders-api";
import { brandAccent, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export function CheckoutConfirmationPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<CheckoutOrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function load(): Promise<void> {
      try {
        const next = await fetchCheckoutOrderStatus(orderId!);
        if (cancelled) {
          return;
        }
        setStatus(next);
        setError(null);

        /* Wait briefly for webhook if card just paid */
        if (
          next.paymentStatus !== "PAID" &&
          next.paymentMethod === "CARD_ONLINE" &&
          attempts < 8
        ) {
          attempts += 1;
          window.setTimeout(() => {
            void load();
          }, 1500);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load order");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const ticketLabel =
    status?.ticketNumber != null
      ? `#${status.ticketNumber}`
      : orderId
        ? orderId.slice(0, 8).toUpperCase()
        : "—";

  const paid = status?.paymentStatus === "PAID";
  const paying =
    status?.paymentMethod === "CARD_ONLINE" && status.paymentStatus !== "PAID";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      <Card className="w-full p-8 md:p-10" padded={false}>
        {paying ? (
          <Loader2 className={cn("mx-auto h-14 w-14 animate-spin", brandAccent)} />
        ) : (
          <CheckCircle2 className={cn("mx-auto h-14 w-14", brandAccent)} />
        )}
        <h1 className={cn("mt-4 font-display text-2xl font-bold md:text-3xl", primaryText)}>
          {paying ? "Confirming payment…" : "Order received"}
        </h1>
        <p className={cn("mt-3 text-[15px] leading-relaxed", secondaryText)}>
          {paying
            ? "Hang tight — we’re confirming your card payment with the kitchen."
            : paid
              ? "Thanks! Your order is paid and will appear on the kitchen board."
              : "Thanks for your order. We will start preparing it for your selected time."}
        </p>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard highlight label="Order #" value={ticketLabel} />
          <StatCard
            label="Payment"
            value={
              status?.paymentStatus
                ? status.paymentStatus.replaceAll("_", " ")
                : "—"
            }
          />
        </div>
        {status?.fulfillmentType ? (
          <p className={cn("mt-4 text-sm", secondaryText)}>
            {status.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup"}
            {status.channel === "WEB" ? " · Online order" : ""}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="rounded-full px-8" variant="pill">
            <Link href="/track-order">Track order</Link>
          </Button>
          <Button asChild className="rounded-full px-8" variant="secondary">
            <Link href="/menu">Back to menu</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
