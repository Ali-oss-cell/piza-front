import { CheckoutPage } from "@/components/features/checkout/checkout-page";
import { fetchStoreSettings } from "@/lib/menu-api";

export const dynamic = "force-dynamic";

export default async function CheckoutRoute(): Promise<React.ReactElement> {
  const settings = await fetchStoreSettings();

  return <CheckoutPage settings={settings} />;
}
