"use client";

import { useEffect, useState } from "react";
import { CheckoutPage } from "@/components/features/checkout/checkout-page";
import { fetchStoreSettings } from "@/lib/menu-api";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import type { StoreSettings } from "@/types/store";

export function CheckoutBrandSettings(): React.ReactElement {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brandSlug = getSiteBrandSlug();
    void fetchStoreSettings(brandSlug)
      .then(setSettings)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load store settings.",
        );
      });
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 pt-28 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 pt-28 text-center">
        <p className="text-sm text-zinc-500">Loading checkout…</p>
      </div>
    );
  }

  return <CheckoutPage settings={settings} />;
}
