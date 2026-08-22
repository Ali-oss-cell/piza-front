"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { applyPlatformTheme, applyStoreTheme } from "@/lib/store-theme";

export interface StoreThemeConfig {
  accent?: string | null;
  backgroundLight?: string | null;
  backgroundDark?: string | null;
  darkModeEnabled?: boolean;
}

interface StoreThemeProviderProps {
  config: StoreThemeConfig;
  /** Admin/login routes use platform pink, not store accent. */
  usePlatformTheme?: boolean;
}

export function StoreThemeProvider({
  config,
  usePlatformTheme = false,
}: StoreThemeProviderProps): null {
  const { setTheme } = useTheme();
  const darkModeEnabled = config.darkModeEnabled !== false;

  useEffect(() => {
    if (usePlatformTheme) {
      applyPlatformTheme();
      return;
    }

    applyStoreTheme({
      accent: config.accent,
      backgroundLight: config.backgroundLight,
      backgroundDark: config.backgroundDark,
    });
  }, [
    usePlatformTheme,
    config.accent,
    config.backgroundLight,
    config.backgroundDark,
  ]);

  useEffect(() => {
    if (usePlatformTheme || darkModeEnabled) {
      return;
    }
    setTheme("light");
  }, [usePlatformTheme, darkModeEnabled, setTheme]);

  useEffect(() => {
    if (typeof document === "undefined" || usePlatformTheme) {
      return;
    }
    document.documentElement.dataset.storeDarkMode = darkModeEnabled ? "enabled" : "disabled";
    return () => {
      delete document.documentElement.dataset.storeDarkMode;
    };
  }, [usePlatformTheme, darkModeEnabled]);

  return null;
}

export function useStoreDarkModeEnabled(): boolean {
  if (typeof document === "undefined") {
    return true;
  }
  return document.documentElement.dataset.storeDarkMode !== "disabled";
}
