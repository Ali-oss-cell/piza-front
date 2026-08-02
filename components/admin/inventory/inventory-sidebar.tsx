"use client";

import {
  AlertTriangle,
  ClipboardList,
  History,
  Package,
  PackageMinus,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";
import type { InventoryTab } from "@/types/inventory";
import { INVENTORY_TAB_LABELS } from "@/types/inventory";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const NAV: { id: InventoryTab; icon: typeof Package }[] = [
  { id: "stock-list", icon: Package },
  { id: "receive", icon: PackagePlus },
  { id: "waste", icon: PackageMinus },
  { id: "adjust", icon: SlidersHorizontal },
  { id: "count", icon: ClipboardList },
  { id: "low-stock", icon: AlertTriangle },
  { id: "history", icon: History },
];

interface InventorySidebarProps {
  activeTab: InventoryTab;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSelectTab: (tab: InventoryTab) => void;
}

export function InventorySidebar({
  activeTab,
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  onSelectTab,
}: InventorySidebarProps): React.ReactElement {
  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      <p
        className={cn(
          "mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider",
          secondaryText,
        )}
      >
        Inventory
      </p>
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
              isActive
                ? "bg-[#d81b60]/12 text-[#d81b60]"
                : cn("hover:bg-zinc-100 dark:hover:bg-white/5", secondaryText),
            )}
            key={item.id}
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile?.();
            }}
            type="button"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{INVENTORY_TAB_LABELS[item.id]}</span> : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-zinc-200/70 bg-white/90 backdrop-blur-md transition-all dark:border-white/10 dark:bg-zinc-950/90 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="border-b border-zinc-200/60 px-4 py-5 dark:border-white/10">
          <p className={cn("font-display text-lg font-bold", primaryText)}>
            {collapsed ? "Inv" : "Inventory"}
          </p>
        </div>
        {nav}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={onCloseMobile}
            type="button"
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 flex w-72 flex-col border-r border-zinc-200/70 bg-white dark:border-white/10 dark:bg-zinc-950",
              dashboardGlass,
            )}
          >
            <div className="border-b border-zinc-200/60 px-4 py-5 dark:border-white/10">
              <p className={cn("font-display text-lg font-bold", primaryText)}>
                Inventory
              </p>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
