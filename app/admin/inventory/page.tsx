"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { InventoryShell } from "@/components/admin/inventory/inventory-shell";
import { pageShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import { AdminBrandProvider, useAdminBrand } from "@/providers/admin-brand-provider";
import { useAuth } from "@/providers/auth-provider";
import { canAccessAdminDashboard } from "@/types/auth";

function InventoryApp(): React.ReactElement {
  const router = useRouter();
  const { user, token, isAuthReady, isAuthenticated } = useAuth();
  const { brands, selectedBrand, clearBrand, selectBrand } = useAdminBrand();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }
    if (!isAuthenticated || !canAccessAdminDashboard(user)) {
      router.replace("/login");
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  if (!isAuthReady || !isAuthenticated || !canAccessAdminDashboard(user) || !token) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center", pageShell)}>
        <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
      </div>
    );
  }

  return (
    <InventoryShell
      brands={brands}
      onBackToStores={() => {
        clearBrand();
        router.push("/admin/dashboard");
      }}
      onClearBrand={clearBrand}
      onSelectBrand={selectBrand}
      selectedBrand={selectedBrand}
      token={token}
    />
  );
}

export default function AdminInventoryPage(): React.ReactElement {
  const { token } = useAuth();

  return (
    <AdminBrandProvider token={token}>
      <InventoryApp />
    </AdminBrandProvider>
  );
}
