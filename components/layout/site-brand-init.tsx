"use client";

import { useEffect } from "react";
import { setSiteBrandSlug } from "@/lib/brand-storage";

export function SiteBrandInit({ brandSlug }: { brandSlug: string }): null {
  useEffect(() => {
    setSiteBrandSlug(brandSlug);
  }, [brandSlug]);

  return null;
}
