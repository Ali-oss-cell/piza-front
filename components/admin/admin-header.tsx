"use client";

import dynamic from "next/dynamic";
import { ChevronRight, LogOut, Menu, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandSwitcher } from "@/components/admin/brand-picker";
import { Button } from "@/components/ui/button";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { useAuth } from "@/providers/auth-provider";
import type { AdminView } from "@/types/admin";
import { cn } from "@/lib/utils";

const ThemeToggle = dynamic(
  () => import("@/components/ui/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => <div aria-hidden className="h-10 w-10 shrink-0 rounded-full" />,
  }
);

const VIEW_LABELS: Record<AdminView, string> = {
  overview: "Overview",
  hq: "HQ Overview",
  reports: "Reports",
  orders: "Live Orders",
  menu: "Menu Management",
  "menu-categories": "Menu Categories",
  toppings: "Toppings Management",
  ingredients: "Ingredients",
  categories: "Topping Categories",
  crusts: "Crust Management",
  deals: "Deals & Promotions",
  payments: "Payments",
  settings: "System Settings",
  team: "Team",
  locations: "Locations",
  domains: "Domains",
  templates: "Transfer Menu",
  customers: "Customers",
  people: "People",
  health: "Store Health",
  activity: "Activity",
};

interface AdminHeaderProps {
  activeView: AdminView;
  brandName: string;
  collapsed: boolean;
  mode?: "hq" | "store";
  onToggleCollapsed: () => void;
  onOpenMobileNav: () => void;
  onAllStores?: () => void;
  onSelectView?: (view: AdminView) => void;
}

export function AdminHeader({
  activeView,
  brandName,
  collapsed,
  mode = "store",
  onToggleCollapsed,
  onOpenMobileNav,
  onAllStores,
  onSelectView,
}: AdminHeaderProps): React.ReactElement {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [clock, setClock] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = (): void => {
      setClock(
        new Intl.DateTimeFormat("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          weekday: "short",
          day: "numeric",
          month: "short",
        }).format(new Date())
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = (): void => {
    logout();
    router.push("/login");
  };

  const homeView: AdminView = mode === "hq" ? "hq" : "overview";
  const crumbClass =
    "rounded-sm transition-colors hover:text-[#d81b60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d81b60]/40";

  return (
    <header className={cn("sticky top-0 z-30 border-b border-zinc-200/50 px-4 py-4 dark:border-white/10", dashboardGlass)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button className="lg:hidden" onClick={onOpenMobileNav} size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
          <Button className="hidden lg:inline-flex" onClick={onToggleCollapsed} size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <nav
              aria-label="Breadcrumb"
              className={cn("flex items-center gap-2 text-xs uppercase tracking-wide", secondaryText)}
            >
              {onAllStores ? (
                <button className={crumbClass} onClick={onAllStores} type="button">
                  {brandName}
                </button>
              ) : onSelectView ? (
                <button
                  className={crumbClass}
                  onClick={() => onSelectView(homeView)}
                  type="button"
                >
                  {brandName}
                </button>
              ) : (
                <span>{brandName}</span>
              )}
              <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
              {onSelectView && activeView !== homeView ? (
                <button
                  className={crumbClass}
                  onClick={() => onSelectView(homeView)}
                  type="button"
                >
                  Dashboard
                </button>
              ) : (
                <span>Dashboard</span>
              )}
              <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
              <span aria-current="page" className="text-[#d81b60]">
                {VIEW_LABELS[activeView]}
              </span>
            </nav>
            <h1 className={cn("font-display text-xl font-bold", primaryText)}>
              {VIEW_LABELS[activeView]}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BrandSwitcher onAllStores={onAllStores} />
          <span className={cn("hidden text-sm md:inline", secondaryText)}>{clock}</span>
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/70 px-3 py-2 text-sm transition-colors hover:border-[#d81b60]/40 dark:border-white/10 dark:bg-zinc-900/50"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <UserCircle2 className="h-5 w-5 text-[#d81b60]" />
              <span className={cn("hidden sm:inline", primaryText)}>
                {user?.firstName} {collapsed ? "" : user?.lastName}
              </span>
            </button>
            {menuOpen ? (
              <div className={cn("absolute right-0 mt-2 w-48 rounded-xl p-2 shadow-xl", dashboardGlass)}>
                <p className={cn("px-3 py-2 text-sm font-medium", primaryText)}>{user?.email}</p>
                <p className={cn("px-3 pb-2 text-xs uppercase tracking-wide text-[#d81b60]")}>
                  {user?.role}
                </p>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-[#d81b60] dark:text-zinc-300 dark:hover:bg-zinc-800"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
