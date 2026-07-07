"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { fetchBrands } from "@/lib/admin-api";
import { clearAdminBrandSlug, getAdminBrandSlug, setAdminBrandSlug } from "@/lib/brand-storage";
import type { Brand } from "@/types/brand";

interface AdminBrandContextValue {
  brands: Brand[];
  selectedBrand: Brand | null;
  isLoading: boolean;
  selectBrand: (slug: string) => void;
  clearBrand: () => void;
  refreshBrands: () => Promise<void>;
}

const AdminBrandContext = createContext<AdminBrandContextValue | null>(null);

function subscribe(onStoreChange: () => void): () => void {
  const handler = (): void => onStoreChange();
  window.addEventListener("marina-admin-brand-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("marina-admin-brand-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function getBrandSnapshot(): string | null {
  return getAdminBrandSlug();
}

export function AdminBrandProvider({
  children,
  token,
}: {
  children: ReactNode;
  token: string | null;
}): React.ReactElement {
  const storedSlug = useSyncExternalStore(subscribe, getBrandSnapshot, () => null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBrands = useCallback(async (): Promise<void> => {
    if (!token) {
      setBrands([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const nextBrands = await fetchBrands(token);
      setBrands(nextBrands);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refreshBrands();
  }, [refreshBrands]);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.slug === storedSlug) ?? null,
    [brands, storedSlug]
  );

  const selectBrand = useCallback((slug: string): void => {
    setAdminBrandSlug(slug);
  }, []);

  const clearBrand = useCallback((): void => {
    clearAdminBrandSlug();
  }, []);

  const value = useMemo(
    () => ({
      brands,
      selectedBrand,
      isLoading,
      selectBrand,
      clearBrand,
      refreshBrands,
    }),
    [brands, selectedBrand, isLoading, selectBrand, clearBrand, refreshBrands]
  );

  return <AdminBrandContext.Provider value={value}>{children}</AdminBrandContext.Provider>;
}

export function useAdminBrand(): AdminBrandContextValue {
  const context = useContext(AdminBrandContext);

  if (!context) {
    throw new Error("useAdminBrand must be used within an AdminBrandProvider");
  }

  return context;
}
