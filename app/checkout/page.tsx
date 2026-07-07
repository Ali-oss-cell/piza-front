import { CheckoutPage } from "@/components/features/checkout/checkout-page";
import { CheckoutBrandSettings } from "@/components/features/checkout/checkout-brand-settings";

export const dynamic = "force-dynamic";

export default function CheckoutRoute(): React.ReactElement {
  return (
    <CheckoutBrandSettings>
      {(settings) => <CheckoutPage settings={settings} />}
    </CheckoutBrandSettings>
  );
}
