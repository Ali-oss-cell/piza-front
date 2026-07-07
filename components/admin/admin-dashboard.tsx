"use client";

import { AdminBrandProvider } from "@/providers/admin-brand-provider";
import { useAuth } from "@/providers/auth-provider";
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";

export function AdminDashboard(): React.ReactElement {
  const { token } = useAuth();

  return (
    <AdminBrandProvider token={token}>
      <AdminDashboardContent />
    </AdminBrandProvider>
  );
}
