"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BrandPicker } from "@/components/admin/brand-picker";
import { MenuView } from "@/components/admin/views/menu-view";
import { CategoriesView } from "@/components/admin/views/categories-view";
import { CrustsView } from "@/components/admin/views/crusts-view";
import { DealsView } from "@/components/admin/views/deals-view";
import { IngredientsView } from "@/components/admin/views/ingredients-view";
import { MenuCategoriesView } from "@/components/admin/views/menu-categories-view";
import { ToppingsView } from "@/components/admin/views/toppings-view";
import { OrdersView } from "@/components/admin/views/orders-view";
import { OverviewView } from "@/components/admin/views/overview-view";
import { SettingsView } from "@/components/admin/views/settings-view";
import { PaymentsView } from "@/components/admin/views/payments-view";
import { HqOverviewView } from "@/components/admin/views/hq-overview-view";
import { HqReportsView } from "@/components/admin/views/hq-reports-view";
import { TeamView } from "@/components/admin/views/team-view";
import { LocationsView } from "@/components/admin/views/locations-view";
import { DomainsView } from "@/components/admin/views/domains-view";
import { TemplatesView } from "@/components/admin/views/templates-view";
// import { CustomersView } from "@/components/admin/views/customers-view";
import { ActivityView } from "@/components/admin/views/activity-view";
import {
  fetchAdminCrusts,
  fetchAdminDeals,
  fetchAdminIngredients,
  fetchAdminMenuItems,
  fetchAdminToppings,
  fetchIngredientCategories,
  fetchMenuCategories,
  fetchOrders,
  fetchPaymentSettings,
  fetchStoreDomains,
  fetchStoreSettings,
  fetchToppingCategories,
} from "@/lib/admin-api";
import { pageShell } from "@/lib/theme-classes";
import { useAdminBrand } from "@/providers/admin-brand-provider";
import { useAuth } from "@/providers/auth-provider";
import type {
  AdminMenuCategoryRecord,
  AdminMenuItem,
  AdminOrder,
  AdminIngredientCategory,
  AdminToppingCategory,
  AdminView,
  IngredientCategoryGroup,
  ToppingCategoryGroup,
} from "@/types/admin";
import { canAccessAdminDashboard, isPlatformAdmin } from "@/types/auth";
import type { PaymentSettings, StoreDomain } from "@/types/payments";
import type { AdminCrustOption, StoreSettings } from "@/types/store";
import type { Deal } from "@/types/deals";
import { cn } from "@/lib/utils";

export function AdminDashboardContent(): React.ReactElement {
  const router = useRouter();
  const { user, token, isAuthReady, isAuthenticated } = useAuth();
  const { selectedBrand, clearBrand, refreshBrands, selectBrand, brands } = useAdminBrand();
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showStoreGallery, setShowStoreGallery] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [toppingCatalog, setToppingCatalog] = useState<ToppingCategoryGroup[]>([]);
  const [ingredientCatalog, setIngredientCatalog] = useState<IngredientCategoryGroup[]>([]);
  const [toppingCategories, setToppingCategories] = useState<AdminToppingCategory[]>([]);
  const [ingredientCategories, setIngredientCategories] = useState<AdminIngredientCategory[]>([]);
  const [menuCategories, setMenuCategories] = useState<AdminMenuCategoryRecord[]>([]);
  const [crusts, setCrusts] = useState<AdminCrustOption[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [storeDomains, setStoreDomains] = useState<StoreDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const brandSlug = selectedBrand?.slug;
  const platformAdmin = isPlatformAdmin(user);

  useEffect(() => {
    if (platformAdmin && !selectedBrand && !showStoreGallery) {
      setActiveView((current) =>
        ["hq", "reports", "domains", "templates", "activity"].includes(current)
          ? current
          : "hq",
      );
    }
  }, [platformAdmin, selectedBrand, showStoreGallery]);

  const goToAllStores = useCallback((): void => {
    clearBrand();
    setShowStoreGallery(true);
  }, [clearBrand]);

  const loadData = useCallback(async (): Promise<void> => {
    if (!token || !brandSlug) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        nextOrders,
        nextMenu,
        nextToppings,
        nextToppingCategories,
        nextIngredients,
        nextIngredientCategories,
        nextMenuCategories,
        nextCrusts,
        nextDeals,
        nextSettings,
        nextPayments,
        nextDomains,
      ] = await Promise.all([
        fetchOrders(token, brandSlug),
        fetchAdminMenuItems(token, brandSlug),
        fetchAdminToppings(token, brandSlug),
        fetchToppingCategories(token, brandSlug),
        fetchAdminIngredients(token, brandSlug),
        fetchIngredientCategories(token, brandSlug),
        fetchMenuCategories(token, brandSlug),
        fetchAdminCrusts(token, brandSlug),
        fetchAdminDeals(token, brandSlug),
        fetchStoreSettings(token, brandSlug),
        fetchPaymentSettings(token, brandSlug),
        fetchStoreDomains(token, brandSlug),
      ]);
      setOrders(nextOrders);
      setMenuItems(nextMenu);
      setToppingCatalog(nextToppings);
      setToppingCategories(nextToppingCategories);
      setIngredientCatalog(nextIngredients);
      setIngredientCategories(nextIngredientCategories);
      setMenuCategories(nextMenuCategories);
      setCrusts(nextCrusts);
      setDeals(nextDeals);
      setStoreSettings(nextSettings);
      setPaymentSettings(nextPayments);
      setStoreDomains(nextDomains);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load dashboard data. Is the API running?"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated || !canAccessAdminDashboard(user)) {
      router.replace("/login");
      return;
    }

    if (!brandSlug) {
      setIsLoading(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      void loadData();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isAuthReady, isAuthenticated, user, router, loadData, brandSlug]);

  const refreshToppingCatalog = useCallback(async (): Promise<void> => {
    if (!token || !brandSlug) {
      return;
    }

    const nextToppings = await fetchAdminToppings(token, brandSlug);
    setToppingCatalog(nextToppings);
  }, [token, brandSlug]);

  const refreshIngredientCatalog = useCallback(async (): Promise<void> => {
    if (!token || !brandSlug) {
      return;
    }

    const [nextCatalog, nextCategories] = await Promise.all([
      fetchAdminIngredients(token, brandSlug),
      fetchIngredientCategories(token, brandSlug),
    ]);
    setIngredientCatalog(nextCatalog);
    setIngredientCategories(nextCategories);
  }, [token, brandSlug]);

  if (!isAuthReady || !isAuthenticated || !canAccessAdminDashboard(user)) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center", pageShell)}>
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  if (!selectedBrand && (!platformAdmin || showStoreGallery)) {
    return <BrandPicker onBackToHq={platformAdmin ? () => setShowStoreGallery(false) : undefined} />;
  }

  if (platformAdmin && !selectedBrand && !showStoreGallery) {
    return (
      <div className={cn("min-h-screen", pageShell)}>
        <AdminSidebar
          activeView={activeView}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          mode="hq"
          onCloseMobile={() => setMobileOpen(false)}
          onSelectView={setActiveView}
        />

        <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-72")}>
          <AdminHeader
            activeView={activeView}
            brandName="Franchise HQ"
            collapsed={collapsed}
            onAllStores={goToAllStores}
            onOpenMobileNav={() => setMobileOpen(true)}
            onToggleCollapsed={() => setCollapsed((current) => !current)}
          />

          <main className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 12 }}
                key={activeView}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeView === "hq" ? (
                  <HqOverviewView
                    onManageStores={() => setShowStoreGallery(true)}
                    onOpenStore={(slug) => {
                      selectBrand(slug);
                      setActiveView("overview");
                    }}
                    token={token!}
                  />
                ) : null}
                {activeView === "reports" ? <HqReportsView token={token!} /> : null}
                {activeView === "domains" ? <DomainsView brands={brands} token={token!} /> : null}
                {activeView === "templates" ? <TemplatesView brands={brands} token={token!} /> : null}
                {/* CRM paused for now */}
                {/* {activeView === "customers" ? <CustomersView token={token!} /> : null} */}
                {activeView === "activity" ? <ActivityView token={token!} /> : null}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", pageShell)}>
      <AdminSidebar
        activeView={activeView}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        mode="store"
        isPlatformAdmin={platformAdmin}
        onCloseMobile={() => setMobileOpen(false)}
        onSelectView={setActiveView}
      />

      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <AdminHeader
          activeView={activeView}
          brandName={selectedBrand!.name}
          collapsed={collapsed}
          onAllStores={goToAllStores}
          onOpenMobileNav={() => setMobileOpen(true)}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
        />

        <main className="p-4 md:p-6">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#d81b60]/20 bg-[#d81b60]/10 p-6 text-[#d81b60]">
              {error}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 12 }}
                key={activeView}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeView === "overview" ? <OverviewView orders={orders} /> : null}
                {activeView === "orders" ? (
                  <OrdersView onOrdersChange={setOrders} orders={orders} token={token!} />
                ) : null}
                {activeView === "menu" ? (
                  <MenuView
                    ingredientCatalog={ingredientCatalog}
                    items={menuItems}
                    menuCategories={menuCategories}
                    onItemsChange={setMenuItems}
                    token={token!}
                    toppingCatalog={toppingCatalog}
                  />
                ) : null}
                {activeView === "menu-categories" ? (
                  <MenuCategoriesView
                    categories={menuCategories}
                    menuItems={menuItems}
                    onCategoriesChange={setMenuCategories}
                    token={token!}
                  />
                ) : null}
                {activeView === "toppings" ? (
                  <ToppingsView
                    categories={toppingCategories}
                    onCatalogChange={setToppingCatalog}
                    token={token!}
                    toppingCatalog={toppingCatalog}
                  />
                ) : null}
                {activeView === "categories" ? (
                  <CategoriesView
                    categories={toppingCategories}
                    onCategoriesChange={setToppingCategories}
                    onCatalogRefresh={() => void refreshToppingCatalog()}
                    token={token!}
                    toppingCatalog={toppingCatalog}
                  />
                ) : null}
                {activeView === "ingredients" ? (
                  <IngredientsView
                    categories={ingredientCategories}
                    ingredientCatalog={ingredientCatalog}
                    onCatalogChange={setIngredientCatalog}
                    onCatalogRefresh={refreshIngredientCatalog}
                    onCategoriesChange={setIngredientCategories}
                    token={token!}
                  />
                ) : null}
                {activeView === "crusts" ? (
                  <CrustsView crusts={crusts} onCrustsChange={setCrusts} token={token!} />
                ) : null}
                {activeView === "deals" ? (
                  <DealsView
                    brands={brands}
                    deals={deals}
                    isPlatformAdmin={platformAdmin}
                    onDealsChange={setDeals}
                    token={token!}
                  />
                ) : null}
                {activeView === "team" ? (
                  <TeamView brandSlug={brandSlug!} token={token!} />
                ) : null}
                {activeView === "locations" ? (
                  <LocationsView brandSlug={brandSlug!} token={token!} />
                ) : null}
                {activeView === "payments" && paymentSettings ? (
                  <PaymentsView
                    onSettingsChange={setPaymentSettings}
                    settings={paymentSettings}
                    token={token!}
                  />
                ) : null}
                {activeView === "settings" && storeSettings ? (
                  <SettingsView
                    brandSlug={brandSlug!}
                    domains={storeDomains}
                    isPlatformAdmin={platformAdmin}
                    onSettingsChange={setStoreSettings}
                    onStoreSuspended={() => {
                      goToAllStores();
                      void refreshBrands();
                    }}
                    settings={storeSettings}
                    token={token!}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
