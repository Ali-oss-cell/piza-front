"use client";

import { useEffect } from "react";
import { setSiteBrandSlug, setSiteLocationId } from "@/lib/brand-storage";

export function SiteBrandInit({
  brandSlug,
  locationId = null,
}: {
  brandSlug: string;
  locationId?: string | null;
}): null {
  useEffect(() => {
    setSiteBrandSlug(brandSlug);
    setSiteLocationId(locationId ?? null);
  }, [brandSlug, locationId]);

  return null;
}
