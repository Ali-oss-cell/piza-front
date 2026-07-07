"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { useAdminBrand } from "@/providers/admin-brand-provider";
import { cn } from "@/lib/utils";

export function BrandPicker(): React.ReactElement {
  const { brands, isLoading, selectBrand } = useAdminBrand();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className={cn("w-full max-w-2xl rounded-3xl border border-zinc-200/60 p-8 shadow-xl dark:border-white/10", dashboardGlass)}>
        <p className={cn("text-sm uppercase tracking-wide", secondaryText)}>Admin dashboard</p>
        <h1 className={cn("mt-2 font-display text-3xl font-bold", primaryText)}>
          Which brand are you managing?
        </h1>
        <p className={cn("mt-2 text-sm", secondaryText)}>
          Menu, toppings, deals, and orders are scoped to the brand you pick.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {brands.map((brand) => (
            <button
              className="group rounded-2xl border border-zinc-200/70 bg-white/80 p-6 text-left transition-all hover:border-[#d81b60]/40 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/60"
              key={brand.id}
              onClick={() => selectBrand(brand.slug)}
              type="button"
            >
              <div
                className="mb-4 h-2 w-12 rounded-full"
                style={{ backgroundColor: brand.primaryColor ?? "#D81B60" }}
              />
              <h2 className={cn("font-display text-xl font-bold", primaryText)}>{brand.name}</h2>
              {brand.tagline ? (
                <p className={cn("mt-1 text-sm", secondaryText)}>{brand.tagline}</p>
              ) : null}
              <p className="mt-4 text-xs uppercase tracking-wide text-[#d81b60] opacity-0 transition-opacity group-hover:opacity-100">
                Manage {brand.name}
              </p>
            </button>
          ))}
        </div>

        {brands.length === 0 ? (
          <p className="mt-6 text-sm text-[#d81b60]">No brands found. Check the API connection.</p>
        ) : null}
      </div>
    </div>
  );
}

export function BrandSwitcher(): React.ReactElement {
  const { brands, selectedBrand, selectBrand, clearBrand } = useAdminBrand();

  if (!selectedBrand) {
    return <div />;
  }

  return (
    <div className="flex items-center gap-2">
      {brands.map((brand) => (
        <Button
          className="h-9 px-3 text-sm"
          key={brand.id}
          onClick={() => selectBrand(brand.slug)}
          variant={brand.slug === selectedBrand.slug ? "default" : "outline"}
        >
          {brand.name}
        </Button>
      ))}
      <Button className="h-9 px-3 text-sm" onClick={clearBrand} variant="ghost">
        Switch
      </Button>
    </div>
  );
}
