"use client";

import { BrandLogo } from "@/components/brand/brand-logo";

interface SiteFooterProps {
  brandName?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  tagline?: string | null;
  address?: string | null;
  deliveryFee?: string;
}

export function SiteFooter({
  brandName = "Leovorno",
  logoUrl = null,
  logoDarkUrl = null,
  tagline = "Experience the zenith of Italian culinary art. Designed for the urban epicurean who demands both speed and soul.",
  address = "231 Murrumbeena Rd.\nMelbourne, VIC 3163\nAustralia",
  deliveryFee = "5",
}: SiteFooterProps): React.ReactElement {
  const hasLogo = Boolean(logoUrl || logoDarkUrl);
  const resolvedTagline =
    tagline?.trim() ||
    "Experience the zenith of Italian culinary art. Designed for the urban epicurean who demands both speed and soul.";
  const resolvedAddress =
    address?.trim() || "231 Murrumbeena Rd.\nMelbourne, VIC 3163\nAustralia";

  return (
    <footer className="w-full border-t border-zinc-200/70 bg-zinc-50 px-margin-mobile py-16 transition-colors duration-150 ease-out dark:border-white/5 dark:bg-zinc-950 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            {hasLogo ? (
              <div className="mb-6">
                <BrandLogo
                  brandName={brandName}
                  imageClassName="h-12 w-auto"
                  logoDarkUrl={logoDarkUrl}
                  logoUrl={logoUrl}
                />
              </div>
            ) : (
              <h2 className="mb-6 font-display text-headline-md font-bold uppercase tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
                {brandName}
              </h2>
            )}
            <p className="mb-8 max-w-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              {resolvedTagline}
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-label-md uppercase tracking-widest text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
              Location
            </h4>
            <p className="whitespace-pre-line leading-loose text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              {resolvedAddress}
            </p>
            <p className="mt-4 font-bold text-[#d81b60]">${deliveryFee} Flat Delivery</p>
          </div>
          <div>
            <h4 className="mb-6 text-label-md uppercase tracking-widest text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
              Hours
            </h4>
            <p className="leading-loose text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              Mon — Fri: 5pm – 11pm
              <br />
              Sat — Sun: 12pm – 12am
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
