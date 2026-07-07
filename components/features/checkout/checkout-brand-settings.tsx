"use client";

import { useEffect, useState, type ReactNode } from "react";
import { fetchStoreSettings } from "@/lib/menu-api";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import type { StoreSettings } from "@/types/store";

export function CheckoutBrandSettings({
  children,
}: {
  children: (settings: StoreSettings) => ReactNode;
}): React.ReactElement | null {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const brandSlug = getSiteBrandSlug();
    void fetchStoreSettings(brandSlug).then(setSettings);
  }, []);

  if (!settings) {
    return null;
  }

  return <>{children(settings)}</>;
}
