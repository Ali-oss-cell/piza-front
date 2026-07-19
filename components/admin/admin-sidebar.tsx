"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  FolderPlus,
  LayoutDashboard,
  Layers,
  Leaf,
  Pizza,
  Settings,
  ShoppingBag,
  UtensilsCrossed,
  CircleDot,
  Tag,
  CreditCard,
  X,
  Building2,
  BarChart3,
  Globe,
  FileText,
  // Users,
  MapPin,
  Activity as ActivityIcon,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { AdminView } from "@/types/admin";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const STORE_NAV_ITEMS: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Live Orders", icon: ShoppingBag },
  { id: "menu", label: "Menu Management", icon: UtensilsCrossed },
  { id: "menu-categories", label: "Menu Categories", icon: Layers },
  { id: "toppings", label: "Toppings", icon: Pizza },
  { id: "ingredients", label: "Ingredients", icon: Leaf },
  { id: "categories", label: "Topping Categories", icon: FolderPlus },
  { id: "crusts", label: "Crusts", icon: CircleDot },
  { id: "deals", label: "Deals", icon: Tag },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "team", label: "Team", icon: UsersRound },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "settings", label: "System Settings", icon: Settings },
];

const HQ_NAV_ITEMS: { id: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "hq", label: "HQ Overview", icon: Building2 },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "templates", label: "Transfer menu", icon: FileText },
  // CRM paused for now
  // { id: "customers", label: "Customers", icon: Users },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

interface AdminSidebarProps {
  activeView: AdminView;
  collapsed: boolean;
  mobileOpen: boolean;
  mode?: "hq" | "store";
  isPlatformAdmin?: boolean;
  onSelectView: (view: AdminView) => void;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  activeView,
  collapsed,
  mobileOpen,
  mode = "store",
  onSelectView,
  onCloseMobile,
}: AdminSidebarProps): React.ReactElement {
  const navItems = mode === "hq" ? HQ_NAV_ITEMS : STORE_NAV_ITEMS;
  const title = mode === "hq" ? "Franchise HQ" : "Admin Console";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-6">
        <Link className="flex items-center gap-3" href="/">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#d81b60]/15 text-[#d81b60]">
            <ChefHat className="h-5 w-5" />
          </span>
          {!collapsed ? (
            <div>
              <p className={cn("font-display text-lg font-bold uppercase tracking-wide", primaryText)}>
                Marina
              </p>
              <p className={cn("text-xs", secondaryText)}>{title}</p>
            </div>
          ) : null}
        </Link>
        <button
          className="rounded-lg p-2 text-zinc-500 hover:text-[#d81b60] lg:hidden"
          onClick={onCloseMobile}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-300",
                isActive
                  ? "bg-[#d81b60] text-white shadow-lg shadow-[#d81b60]/20"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-[#d81b60] dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-[#d81b60]",
              )}
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden border-r border-zinc-200/50 bg-white/70 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-zinc-950/80 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col",
          collapsed ? "lg:w-20" : "lg:w-72",
        )}
      >
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          onClick={onCloseMobile}
        />
      ) : null}

      <motion.aside
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        className={cn("fixed inset-y-0 left-0 z-[60] w-72 lg:hidden", dashboardGlass)}
        initial={false}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
