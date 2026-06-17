import { Suspense } from "react";
import { CheckoutConfirmationPage } from "@/components/features/checkout/checkout-confirmation-page";

export default function CheckoutConfirmationRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="pt-28 text-center">Loading…</div>}>
      <CheckoutConfirmationPage />
    </Suspense>
  );
}
