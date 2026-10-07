"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { secondaryText } from "@/lib/theme-classes";

const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

function getStripe(publishableKey: string): Promise<Stripe | null> {
  let promise = stripePromiseCache.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripePromiseCache.set(publishableKey, promise);
  }
  return promise;
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  orderId: string;
  amountLabel: string;
  onPaid: (orderId: string) => void;
  onError: (message: string) => void;
}

function PaymentFormInner({
  orderId,
  amountLabel,
  onPaid,
  onError,
}: Omit<StripePaymentFormProps, "clientSecret" | "publishableKey">): React.ReactElement {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  async function handlePay(): Promise<void> {
    if (!stripe || !elements) {
      return;
    }

    setBusy(true);
    onError("");

    const returnUrl = `${window.location.origin}/checkout/confirmation?orderId=${encodeURIComponent(orderId)}`;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (result.error) {
      onError(result.error.message ?? "Payment failed. Please try again.");
      setBusy(false);
      return;
    }

    const status = result.paymentIntent?.status;
    if (status === "succeeded" || status === "processing") {
      onPaid(orderId);
      return;
    }

    onError(`Unexpected payment status: ${status ?? "unknown"}`);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <Button
        className="w-full py-5 uppercase tracking-widest"
        disabled={!stripe || !elements || busy}
        onClick={() => void handlePay()}
        type="button"
      >
        {busy ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
      <p className={cn("text-center text-xs", secondaryText)}>
        Card payments are processed securely by Stripe.
      </p>
    </div>
  );
}

export function StripePaymentForm({
  clientSecret,
  publishableKey,
  orderId,
  amountLabel,
  onPaid,
  onError,
}: StripePaymentFormProps): React.ReactElement {
  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#d81b60",
            borderRadius: "12px",
          },
        },
      }}
      stripe={getStripe(publishableKey)}
    >
      <PaymentFormInner
        amountLabel={amountLabel}
        orderId={orderId}
        onError={onError}
        onPaid={onPaid}
      />
    </Elements>
  );
}
