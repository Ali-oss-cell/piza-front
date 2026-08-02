"use client";

import { Loader2, Menu, Package } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HistoryPanel } from "@/components/admin/inventory/history-panel";
import { InventorySidebar } from "@/components/admin/inventory/inventory-sidebar";
import { MovementPanel } from "@/components/admin/inventory/movement-panel";
import { StockListPanel } from "@/components/admin/inventory/stock-list-panel";
import { BrandLogoMark } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  fetchInventorySummary,
  fetchStockItems,
} from "@/lib/admin-api";
import {
  dashboardGlass,
  pageShell,
  primaryText,
  secondaryText,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types/brand";
import type {
  InventorySummary,
  InventoryTab,
  StockItem,
} from "@/types/inventory";
import { INVENTORY_TAB_LABELS } from "@/types/inventory";

interface InventoryShellProps {
  token: string;
  brands: Brand[];
  selectedBrand: Brand | null;
  onSelectBrand: (slug: string) => void;
  onClearBrand: () => void;
  onBackToStores: () => void;
}

export function InventoryShell({
  token,
  brands,
  selectedBrand,
  onSelectBrand,
  onClearBrand,
  onBackToStores,
}: InventoryShellProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<InventoryTab>("stock-list");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brandSlug = selectedBrand?.slug;

  const load = useCallback(async (): Promise<void> => {
    if (!brandSlug) {
      setItems([]);
      setSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [nextItems, nextSummary] = await Promise.all([
        fetchStockItems(token, brandSlug, { includeInactive: true }),
        fetchInventorySummary(token, brandSlug),
      ]);
      setItems(nextItems);
      setSummary(nextSummary);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load inventory.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!selectedBrand) {
    return (
      <div className={cn("relative min-h-screen overflow-hidden", pageShell)}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(216,27,96,0.12),_transparent_55%)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                className={cn(
                  "text-sm font-medium uppercase tracking-[0.2em]",
                  secondaryText,
                )}
              >
                Inventory
              </p>
              <h1
                className={cn(
                  "mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl",
                  primaryText,
                )}
              >
                Choose a store
              </h1>
              <p className={cn("mt-3 max-w-xl text-base", secondaryText)}>
                Inventory is separate from the store dashboard. Pick a store to
                manage stock, receive, waste, counts, and history.
              </p>
              <Button
                className="mt-4"
                onClick={onBackToStores}
                type="button"
                variant="outline"
              >
                ← Your stores
              </Button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => {
              const accent = brand.primaryColor?.trim() || "#D81B60";
              return (
                <button
                  className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d81b60]/35 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/70"
                  key={brand.id}
                  onClick={() => onSelectBrand(brand.slug)}
                  type="button"
                >
                  <div
                    className="relative flex h-28 items-center justify-center px-6"
                    style={{
                      background: `linear-gradient(145deg, ${accent}18 0%, transparent 60%), linear-gradient(180deg, #fafafa 0%, #f3f3f3 100%)`,
                    }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: accent }}
                    />
                    <BrandLogoMark
                      brandName={brand.name}
                      className="max-h-16 max-w-[70%]"
                      logoDarkUrl={brand.logoDarkUrl}
                      logoUrl={brand.logoUrl}
                      primaryColor={accent}
                    />
                  </div>
                  <div className="p-5">
                    <h2
                      className={cn(
                        "font-display text-xl font-bold tracking-tight",
                        primaryText,
                      )}
                    >
                      {brand.name}
                    </h2>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#d81b60]">
                      Open inventory →
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {brands.length === 0 ? (
            <div
              className={cn(
                "mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-white/15",
                dashboardGlass,
              )}
            >
              <Package className={cn("h-8 w-8", secondaryText)} />
              <p className={cn("text-sm", secondaryText)}>
                No stores available for inventory.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", pageShell)}>
      <InventorySidebar
        activeTab={activeTab}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onSelectTab={setActiveTab}
      />

      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 px-4 py-3 backdrop-blur-md dark:border-white/10",
            dashboardGlass,
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className={cn("text-xs font-medium uppercase tracking-wider", secondaryText)}>
                Inventory · {INVENTORY_TAB_LABELS[activeTab]}
              </p>
              <p className={cn("font-display text-lg font-bold", primaryText)}>
                {selectedBrand.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="flex h-10 max-w-[12rem] rounded-md border border-input bg-background px-3 text-sm"
              onChange={(event) => {
                const slug = event.target.value;
                if (slug) {
                  onSelectBrand(slug);
                  setActiveTab("stock-list");
                }
              }}
              value={selectedBrand.slug}
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                onClearBrand();
              }}
              type="button"
              variant="outline"
            >
              Switch store
            </Button>
            <Button onClick={onBackToStores} type="button" variant="outline">
              ← Your stores
            </Button>
            <Button
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((current) => !current)}
              type="button"
              variant="ghost"
            >
              {collapsed ? "Expand" : "Collapse"}
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {error ? (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className={cn("h-8 w-8 animate-spin", secondaryText)} />
            </div>
          ) : (
            <>
              {activeTab === "stock-list" ? (
                <StockListPanel
                  brandSlug={brandSlug!}
                  items={items}
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  summary={summary}
                  token={token}
                />
              ) : null}
              {activeTab === "receive" ? (
                <MovementPanel
                  brandSlug={brandSlug!}
                  items={items}
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  token={token}
                  type="RECEIVE"
                />
              ) : null}
              {activeTab === "waste" ? (
                <MovementPanel
                  brandSlug={brandSlug!}
                  items={items}
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  token={token}
                  type="WASTE"
                />
              ) : null}
              {activeTab === "adjust" ? (
                <MovementPanel
                  brandSlug={brandSlug!}
                  items={items}
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  token={token}
                  type="ADJUST"
                />
              ) : null}
              {activeTab === "count" ? (
                <MovementPanel
                  brandSlug={brandSlug!}
                  items={items}
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  token={token}
                  type="COUNT"
                />
              ) : null}
              {activeTab === "low-stock" ? (
                <StockListPanel
                  brandSlug={brandSlug!}
                  description="Items at or below their low-stock threshold."
                  items={items}
                  lowStockOnly
                  onItemsChange={setItems}
                  onSummaryChange={setSummary}
                  summary={summary}
                  title="Low stock"
                  token={token}
                />
              ) : null}
              {activeTab === "history" ? (
                <HistoryPanel
                  brandSlug={brandSlug!}
                  items={items}
                  token={token}
                />
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
