export const PLATFORM_ACCENT = "#d81b60";
export const DEFAULT_BG_LIGHT = "#ffffff";
export const DEFAULT_BG_DARK = "#000000";

export interface StoreThemeInput {
  accent?: string | null;
  backgroundLight?: string | null;
  backgroundDark?: string | null;
}

export interface StoreThemeTokens {
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
}

export function resolveStoreTheme(input: StoreThemeInput = {}): StoreThemeTokens {
  return {
    accent: input.accent?.trim() || PLATFORM_ACCENT,
    backgroundLight: input.backgroundLight?.trim() || DEFAULT_BG_LIGHT,
    backgroundDark: input.backgroundDark?.trim() || DEFAULT_BG_DARK,
  };
}

/** Apply storefront CSS variables on documentElement (customer routes only). */
export function applyStoreTheme(input: StoreThemeInput, root: HTMLElement = document.documentElement): StoreThemeTokens {
  const tokens = resolveStoreTheme(input);
  root.style.setProperty("--brand-accent", tokens.accent);
  root.style.setProperty("--brand-primary", tokens.accent);
  root.style.setProperty("--brand-bg-light", tokens.backgroundLight);
  root.style.setProperty("--brand-bg-dark", tokens.backgroundDark);
  return tokens;
}

export function applyPlatformTheme(root: HTMLElement = document.documentElement): void {
  applyStoreTheme({ accent: PLATFORM_ACCENT, backgroundLight: DEFAULT_BG_LIGHT, backgroundDark: DEFAULT_BG_DARK }, root);
}
