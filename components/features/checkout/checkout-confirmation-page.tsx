"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { brandAccent, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export function CheckoutConfirmationPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const shortRef = orderId ? orderId.slice(0, 8).toUpperCase() : "—";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      <Card className="w-full p-8 md:p-10" padded={false}>
        <CheckCircle2 className={cn("mx-auto h-14 w-14", brandAccent)} />
        <h1 className={cn("mt-4 font-display text-2xl font-bold md:text-3xl", primaryText)}>
          Order received
        </h1>
        <p className={cn("mt-3 text-[15px] leading-relaxed", secondaryText)}>
          Thanks for your order. We will start preparing it for your selected time.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard highlight label="Order #" value={shortRef} />
          <StatCard label="Est. ready" value="25–40 min" />
        </div>
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
