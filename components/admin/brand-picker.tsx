"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { CreateStoreWizard } from "@/components/admin/create-store-wizard";
import { Button } from "@/components/ui/button";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { useAdminBrand } from "@/providers/admin-brand-provider";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function BrandPicker(): React.ReactElement {
  const { token } = useAuth();
  const { brands, isLoading, selectBrand, refreshBrands } = useAdminBrand();
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  if (showCreateWizard && token) {
    return (
      <CreateStoreWizard
        onCancel={() => setShowCreateWizard(false)}
        onCreated={async (store) => {
          await refreshBrands();
          setShowCreateWizard(false);
          selectBrand(store.slug);
        }}
        token={token}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div
        className={cn(
          "w-full max-w-2xl rounded-3xl border border-zinc-200/60 p-8 shadow-xl dark:border-white/10",
          dashboardGlass
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={cn("text-sm uppercase tracking-wide", secondaryText)}>Admin dashboard</p>
            <h1 className={cn("mt-2 font-display text-3xl font-bold", primaryText)}>
              Which store are you managing?
            </h1>
            <p className={cn("mt-2 text-sm", secondaryText)}>
              Menu, toppings, deals, and orders are scoped to the store you pick.
            </p>
          </div>
          {token ? (
            <Button
              className="shrink-0"
              onClick={() => setShowCreateWizard(true)}
              type="button"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create store
            </Button>
          ) : null}
        </div>

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

          {token ? (
            <button
              className="flex min-h-[140px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/40 p-6 text-center transition-all hover:border-[#d81b60]/50 hover:bg-white/70 dark:border-white/20 dark:bg-zinc-900/30"
              onClick={() => setShowCreateWizard(true)}
              type="button"
            >
              <Plus className="mb-2 h-6 w-6 text-[#d81b60]" />
              <span className={cn("font-medium", primaryText)}>Create new store</span>
              <span className={cn("mt-1 text-xs", secondaryText)}>
                Branding, location, path, cash
              </span>
            </button>
          ) : null}
        </div>

        {brands.length === 0 ? (
          <p className="mt-6 text-sm text-[#d81b60]">
            No stores yet. Create your first store to get started.
          </p>
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
