"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { CreateStoreWizard } from "@/components/admin/create-store-wizard";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { useAdminBrand } from "@/providers/admin-brand-provider";
import { useAuth } from "@/providers/auth-provider";
import type { Brand } from "@/types/brand";
import { isPlatformAdmin } from "@/types/auth";
import { cn } from "@/lib/utils";

function StoreCard({
  brand,
  onSelect,
}: {
  brand: Brand;
  onSelect: () => void;
}): React.ReactElement {
  const accent = brand.primaryColor?.trim() || "#D81B60";
  const pathHint = brand.pathPrefix || (brand.host ? brand.host : null);

  return (
    <button
      className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d81b60]/35 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70"
      onClick={onSelect}
      type="button"
    >
      <div
        className="relative flex h-36 items-center justify-center px-6"
        style={{
          background: `linear-gradient(145deg, ${accent}18 0%, transparent 60%), linear-gradient(180deg, #fafafa 0%, #f3f3f3 100%)`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
        <BrandLogoMark
          brandName={brand.name}
          className="max-h-24 max-w-[70%] transition duration-300 group-hover:scale-[1.03]"
          logoDarkUrl={brand.logoDarkUrl}
          logoUrl={brand.logoUrl}
          primaryColor={accent}
        />
        {brand.status ? (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              brand.status === "LIVE"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
            )}
          >
            {brand.status}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h2 className={cn("font-display text-xl font-bold tracking-tight", primaryText)}>
          {brand.name}
        </h2>
        {brand.tagline ? (
          <p className={cn("line-clamp-2 text-sm", secondaryText)}>{brand.tagline}</p>
        ) : (
          <p className={cn("text-sm", secondaryText)}>Ready to manage</p>
        )}
        {pathHint ? (
          <p className="mt-2 font-mono text-xs text-[#d81b60]/90">{pathHint}</p>
        ) : null}
        <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-wider text-[#d81b60] opacity-0 transition-opacity group-hover:opacity-100">
          Open dashboard →
        </p>
      </div>
    </button>
  );
}

export function BrandPicker({
  onBackToHq,
}: {
  onBackToHq?: () => void;
} = {}): React.ReactElement {
  const { user, token } = useAuth();
  const { brands, isLoading, selectBrand, refreshBrands } = useAdminBrand();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const canCreate = isPlatformAdmin(user);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  if (showCreateWizard && token && canCreate) {
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
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(216,27,96,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(99,91,255,0.08),_transparent_50%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div
          className={cn(
            "mb-10 flex flex-col gap-6 rounded-[2rem] border border-zinc-200/60 p-8 shadow-xl dark:border-white/10 sm:flex-row sm:items-end sm:justify-between",
            dashboardGlass,
          )}
        >
          <div className="max-w-xl">
            <p className={cn("text-sm font-medium uppercase tracking-[0.2em]", secondaryText)}>
              {canCreate ? "Platform" : "Store admin"}
            </p>
            <h1 className={cn("mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl", primaryText)}>
              Your stores
            </h1>
            <p className={cn("mt-3 text-base", secondaryText)}>
              Pick a store to manage menu, orders, payments, and branding. Each store keeps its own
              logo and look.
            </p>
            {onBackToHq ? (
              <Button className="mt-4" onClick={onBackToHq} type="button" variant="outline">
                ← Back to Franchise HQ
              </Button>
            ) : null}
          </div>
          {token && canCreate ? (
            <Button
              className="h-12 shrink-0 rounded-2xl px-6 text-base"
              onClick={() => setShowCreateWizard(true)}
              type="button"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create store
            </Button>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <StoreCard
              brand={brand}
              key={brand.id}
              onSelect={() => selectBrand(brand.slug)}
            />
          ))}

          {token && canCreate ? (
            <button
              className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-300 bg-white/40 p-8 text-center transition hover:border-[#d81b60]/50 hover:bg-white/70 dark:border-white/20 dark:bg-zinc-900/30"
              onClick={() => setShowCreateWizard(true)}
              type="button"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d81b60]/12 text-[#d81b60]">
                <Plus className="h-7 w-7" />
              </span>
              <span className={cn("font-display text-lg font-bold", primaryText)}>
                New store
              </span>
              <span className={cn("max-w-[14rem] text-sm", secondaryText)}>
                Branding, logo, location, path, and cash ready to go
              </span>
            </button>
          ) : null}
        </div>

        {brands.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[#d81b60]">
            {canCreate
              ? "No stores yet. Create your first store to get started."
              : "No stores assigned to your account. Ask a platform admin."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function BrandSwitcher({
  onAllStores,
}: {
  onAllStores?: () => void;
} = {}): React.ReactElement {
  const { selectedBrand, clearBrand } = useAdminBrand();

  if (!selectedBrand) {
    return <div />;
  }

  return (
    <Button
      className="h-9 px-3 text-sm"
      onClick={onAllStores ?? clearBrand}
      variant="ghost"
    >
      All stores
    </Button>
  );
}
