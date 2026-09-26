"use client";

import { HeroImageUploader } from "@/components/admin/hero-image-uploader";
import { LogoUploader } from "@/components/admin/logo-uploader";
import { OpeningHoursEditor } from "@/components/admin/opening-hours-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOnboarding, updateStoreSettings, updateStoreStatus } from "@/lib/admin-api";
import {
  mergeOpeningHours,
  validateOpeningHoursForSave,
  type OpeningHoursConfig,
} from "@/lib/opening-hours";
import {
  parseStorefrontLayout,
  STOREFRONT_LAYOUTS,
  type StorefrontLayoutId,
} from "@/lib/storefront-layout";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqReadiness } from "@/types/hq";
import type { StoreDomain } from "@/types/payments";
import type { StoreSettings, UpdateStoreSettingsPayload } from "@/types/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SettingsViewProps {
  token: string;
  settings: StoreSettings;
  brandSlug: string;
  isPlatformAdmin: boolean;
  domains: StoreDomain[];
  onSettingsChange: (settings: StoreSettings) => void;
  onStoreSuspended?: () => void;
}

interface SettingsFormState {
  storeName: string;
  tagline: string;
  logoUrl: string;
  logoDarkUrl: string;
  primaryColor: string;
  backgroundLightColor: string;
  backgroundDarkColor: string;
  heroImageUrl: string;
  heroImageDarkUrl: string;
  darkModeEnabled: boolean;
  storefrontLayout: StorefrontLayoutId;
  googleSiteVerification: string;
  deliveryFee: string;
  minOrderAmount: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  openingHours: OpeningHoursConfig;
}

function formFromSettings(settings: StoreSettings): SettingsFormState {
  return {
    storeName: settings.storeName,
    tagline: settings.tagline ?? "",
    logoUrl: settings.logoUrl ?? "",
    logoDarkUrl: settings.logoDarkUrl ?? "",
    primaryColor: settings.primaryColor ?? "#D81B60",
    backgroundLightColor: settings.backgroundLightColor ?? "#ffffff",
    backgroundDarkColor: settings.backgroundDarkColor ?? "#000000",
    heroImageUrl: settings.heroImageUrl ?? "",
    heroImageDarkUrl: settings.heroImageDarkUrl ?? "",
    darkModeEnabled: settings.darkModeEnabled !== false,
    storefrontLayout: parseStorefrontLayout(settings.storefrontLayout),
    googleSiteVerification: settings.googleSiteVerification ?? "",
    deliveryFee: String(settings.deliveryFee),
    minOrderAmount: String(settings.minOrderAmount),
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    address: settings.address ?? "",
    openingHours: mergeOpeningHours(settings.openingHours),
  };
}

function LayoutSketch({
  layout,
  selected,
}: {
  layout: StorefrontLayoutId;
  selected: boolean;
}): React.ReactElement {
  const bar = selected ? "bg-[color:var(--brand-accent,#d81b60)]/40" : "bg-zinc-300 dark:bg-zinc-600";
  const block = selected ? "bg-[color:var(--brand-accent,#d81b60)]/25" : "bg-zinc-200 dark:bg-zinc-700";
  const line = selected ? "bg-[color:var(--brand-accent,#d81b60)]/35" : "bg-zinc-200 dark:bg-zinc-700";

  if (layout === "menu_first") {
    return (
      <div className="flex h-16 flex-col gap-1 rounded-md bg-zinc-50 p-1.5 dark:bg-zinc-900/80" aria-hidden>
        <div className={cn("h-2.5 w-full rounded-sm", bar)} />
        <div className="flex gap-1">
          <div className={cn("h-1.5 w-6 rounded-full", bar)} />
          <div className={cn("h-1.5 w-6 rounded-full", line)} />
          <div className={cn("h-1.5 w-6 rounded-full", line)} />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1">
          <div className={cn("rounded-sm", block)} />
          <div className={cn("rounded-sm", block)} />
          <div className={cn("rounded-sm", block)} />
        </div>
      </div>
    );
  }

  if (layout === "magazine") {
    return (
      <div className="flex h-16 flex-col gap-1 rounded-md bg-zinc-50 p-1.5 dark:bg-zinc-900/80" aria-hidden>
        <div className={cn("h-4 w-full rounded-sm", bar)} />
        <div className="flex gap-1">
          <div className={cn("h-3 flex-1 rounded-sm", block)} />
          <div className={cn("h-3 flex-1 rounded-sm", block)} />
          <div className={cn("h-3 flex-1 rounded-sm", block)} />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-0.5">
          <div className={cn("h-1 w-full rounded-sm", line)} />
          <div className={cn("h-1 w-[80%] rounded-sm", line)} />
        </div>
      </div>
    );
  }

  if (layout === "portfolio") {
    return (
      <div className="flex h-16 flex-col gap-1 rounded-md bg-zinc-950 p-1.5" aria-hidden>
        <div className={cn("h-7 w-full rounded-sm opacity-80", bar)} />
        <div className="grid flex-1 grid-cols-[1.2fr_0.8fr] gap-1">
          <div className={cn("rounded-sm", block)} />
          <div className="flex flex-col justify-center gap-0.5">
            <div className={cn("h-1 w-full rounded-sm", line)} />
            <div className={cn("h-1 w-2/3 rounded-sm", line)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-16 flex-col gap-1 rounded-md bg-zinc-50 p-1.5 dark:bg-zinc-900/80" aria-hidden>
      <div className={cn("h-6 w-full rounded-sm", bar)} />
      <div className="flex gap-1">
        <div className={cn("h-1.5 flex-1 rounded-sm", line)} />
        <div className={cn("h-1.5 flex-1 rounded-sm", line)} />
        <div className={cn("h-1.5 flex-1 rounded-sm", line)} />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-1">
        <div className={cn("rounded-sm", block)} />
        <div className={cn("rounded-sm", block)} />
      </div>
    </div>
  );
}

export function SettingsView({
  token,
  settings,
  brandSlug,
  isPlatformAdmin,
  domains,
  onSettingsChange,
  onStoreSuspended,
}: SettingsViewProps): React.ReactElement {
  const [form, setForm] = useState<SettingsFormState>(() => formFromSettings(settings));
  const [isSaving, setIsSaving] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [readiness, setReadiness] = useState<HqReadiness | null>(null);
  const [storeIsActive, setStoreIsActive] = useState(true);

  useEffect(() => {
    setForm(formFromSettings(settings));
  }, [brandSlug, settings.id, settings.updatedAt]);

  useEffect(() => {
    let cancelled = false;
    void fetchOnboarding(token, brandSlug)
      .then((next) => {
        if (!cancelled) {
          setReadiness(next);
          if (typeof next.brand?.isActive === "boolean") {
            setStoreIsActive(next.brand.isActive);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReadiness(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, brandSlug, settings]);

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const hoursCheck = validateOpeningHoursForSave(form.openingHours);
    if (!hoursCheck.ok) {
      setError(hoursCheck.message);
      setIsSaving(false);
      return;
    }

    const payload: UpdateStoreSettingsPayload = {
      storeName: form.storeName.trim(),
      tagline: form.tagline.trim(),
      logoUrl: form.logoUrl.trim() || null,
      logoDarkUrl: form.logoDarkUrl.trim() || null,
      primaryColor: form.primaryColor.trim() || null,
      backgroundLightColor: form.backgroundLightColor.trim() || null,
      backgroundDarkColor: form.backgroundDarkColor.trim() || null,
      heroImageUrl: form.heroImageUrl.trim() || null,
      heroImageDarkUrl: form.heroImageDarkUrl.trim() || null,
      darkModeEnabled: form.darkModeEnabled,
      storefrontLayout: form.storefrontLayout,
      googleSiteVerification: form.googleSiteVerification.trim() || null,
      deliveryFee: Number(form.deliveryFee),
      minOrderAmount: Number(form.minOrderAmount),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
      openingHours: hoursCheck.value,
    };

    try {
      const updated = await updateStoreSettings(token, payload);
      onSettingsChange(updated);
      setSaved(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>System Settings</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Store details, logo, colours, hero banner, hours, and delivery pricing used on the
          customer site and checkout.
        </p>
      </div>

      {readiness ? (
        <div className={cn("max-w-2xl space-y-3 rounded-2xl border p-6", dashboardGlass)}>
          <h3 className={cn("font-display text-lg font-bold", primaryText)}>
            Onboarding · {readiness.percentComplete ?? 0}%
          </h3>
          <ul className="space-y-2">
            {(readiness.checks ?? []).map((check) => (
              <li
                className={cn("text-sm", check.complete ? "text-emerald-600" : secondaryText)}
                key={check.key}
              >
                {check.complete ? "✓" : "○"} {check.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={cn("max-w-2xl space-y-4 rounded-2xl border p-6", dashboardGlass)}>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Store name</label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
            value={form.storeName}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Tagline</label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))}
            value={form.tagline}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/70 p-4 dark:border-white/10">
            <label className={cn("mb-1 block text-sm font-semibold", primaryText)}>
              Light mode logo
            </label>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Shown when the site is in light mode. Stored on the server.
            </p>
            <LogoUploader
              label="Upload light logo"
              onChange={(logoUrl) => setForm((current) => ({ ...current, logoUrl }))}
              previewMode="light"
              primaryColor={form.primaryColor || "#D81B60"}
              storeName={form.storeName || "Store"}
              token={token}
              value={form.logoUrl}
            />
          </div>

          <div className="rounded-2xl border border-zinc-200/70 p-4 dark:border-white/10">
            <label className={cn("mb-1 block text-sm font-semibold", primaryText)}>
              Dark mode logo
            </label>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Shown when the site is in dark mode. Stored on the server.
            </p>
            <LogoUploader
              label="Upload dark logo"
              onChange={(logoDarkUrl) => setForm((current) => ({ ...current, logoDarkUrl }))}
              previewMode="dark"
              primaryColor={form.primaryColor || "#D81B60"}
              storeName={form.storeName || "Store"}
              token={token}
              value={form.logoDarkUrl}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/70 p-4 dark:border-white/10">
          <h3 className={cn("mb-1 text-sm font-semibold", primaryText)}>Storefront theme</h3>
          <p className={cn("mb-4 text-xs", secondaryText)}>
            Colours apply across the customer site — menu, checkout, deals, and landing page.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Accent colour
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="h-10 w-14 cursor-pointer rounded border border-zinc-200 bg-transparent dark:border-white/10"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, primaryColor: event.target.value }))
                  }
                  type="color"
                  value={form.primaryColor || "#D81B60"}
                />
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, primaryColor: event.target.value }))
                  }
                  placeholder="#D81B60"
                  value={form.primaryColor}
                />
              </div>
              <p className={cn("mt-1 text-xs", secondaryText)}>Buttons, links, prices</p>
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Light background
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="h-10 w-14 cursor-pointer rounded border border-zinc-200 bg-transparent dark:border-white/10"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      backgroundLightColor: event.target.value,
                    }))
                  }
                  type="color"
                  value={form.backgroundLightColor || "#ffffff"}
                />
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      backgroundLightColor: event.target.value,
                    }))
                  }
                  placeholder="#ffffff"
                  value={form.backgroundLightColor}
                />
              </div>
              <p className={cn("mt-1 text-xs", secondaryText)}>Light mode page base</p>
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Dark background
              </label>
              <div className="flex items-center gap-3">
                <input
                  className="h-10 w-14 cursor-pointer rounded border border-zinc-200 bg-transparent dark:border-white/10"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      backgroundDarkColor: event.target.value,
                    }))
                  }
                  type="color"
                  value={form.backgroundDarkColor || "#000000"}
                />
                <Input
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      backgroundDarkColor: event.target.value,
                    }))
                  }
                  placeholder="#000000"
                  value={form.backgroundDarkColor}
                />
              </div>
              <p className={cn("mt-1 text-xs", secondaryText)}>Dark mode page base</p>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              checked={form.darkModeEnabled}
              className="h-4 w-4 rounded border-zinc-300"
              onChange={(event) =>
                setForm((current) => ({ ...current, darkModeEnabled: event.target.checked }))
              }
              type="checkbox"
            />
            <span className={cn("text-sm", primaryText)}>Allow dark mode for this store</span>
          </label>
          <p className={cn("mt-1 text-xs", secondaryText)}>
            When off, customers always see light mode and the theme toggle is hidden.
          </p>

          <div className="mt-6 border-t border-zinc-200/70 pt-5 dark:border-white/10">
            <h4 className={cn("mb-1 text-sm font-semibold", primaryText)}>Storefront layout</h4>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Choose how the home and menu pages are structured. Colours and menu items stay the
              same.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {STOREFRONT_LAYOUTS.map((layout) => {
                const selected = form.storefrontLayout === layout.id;
                return (
                  <button
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-[color:var(--brand-accent,#d81b60)] bg-[color:var(--brand-accent,#d81b60)]/5 ring-1 ring-[color:var(--brand-accent,#d81b60)]"
                        : "border-zinc-200/80 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20"
                    )}
                    key={layout.id}
                    onClick={() =>
                      setForm((current) => ({ ...current, storefrontLayout: layout.id }))
                    }
                    type="button"
                  >
                    <LayoutSketch layout={layout.id} selected={selected} />
                    <p className={cn("mt-2 text-sm font-semibold", primaryText)}>{layout.label}</p>
                    <p className={cn("mt-0.5 text-xs leading-snug", secondaryText)}>
                      {layout.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/70 p-4 dark:border-white/10">
            <label className={cn("mb-1 block text-sm font-semibold", primaryText)}>
              Hero image (light mode)
            </label>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Landing page banner when the site is in light mode.
            </p>
            <HeroImageUploader
              onChange={(heroImageUrl) => setForm((current) => ({ ...current, heroImageUrl }))}
              token={token}
              value={form.heroImageUrl}
            />
          </div>
          <div className="rounded-2xl border border-zinc-200/70 p-4 dark:border-white/10">
            <label className={cn("mb-1 block text-sm font-semibold", primaryText)}>
              Hero image (dark mode)
            </label>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Optional — falls back to the light hero if empty.
            </p>
            <HeroImageUploader
              onChange={(heroImageDarkUrl) =>
                setForm((current) => ({ ...current, heroImageDarkUrl }))
              }
              token={token}
              value={form.heroImageDarkUrl}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Delivery fee ($)</label>
            <Input
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, deliveryFee: event.target.value }))}
              step="0.01"
              type="number"
              value={form.deliveryFee}
            />
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Minimum order ($)</label>
            <Input
              min="0"
              onChange={(event) =>
                setForm((current) => ({ ...current, minOrderAmount: event.target.value }))
              }
              step="0.01"
              type="number"
              value={form.minOrderAmount}
            />
          </div>
        </div>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Contact email</label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))}
            type="email"
            value={form.contactEmail}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Contact phone</label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
            value={form.contactPhone}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Address</label>
          <Input
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            value={form.address}
          />
        </div>

        <div className="border-t border-zinc-200/70 pt-4 dark:border-white/10">
          <OpeningHoursEditor
            onChange={(openingHours) => setForm((current) => ({ ...current, openingHours }))}
            value={form.openingHours}
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}

        <Button disabled={isSaving || !form.storeName.trim()} onClick={() => void handleSubmit()}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Settings
        </Button>
      </div>

      <div className={cn("max-w-2xl space-y-3 rounded-2xl border p-6", dashboardGlass)}>
        <h3 className={cn("font-display text-lg font-bold", primaryText)}>Domains</h3>
        <p className={cn("text-sm", secondaryText)}>
          Path and host routing for this storefront. DNS / Traefik for custom hosts comes later.
        </p>
        {domains.length === 0 ? (
          <p className={cn("text-sm", secondaryText)}>No domains configured.</p>
        ) : (
          <ul className="space-y-2">
            {domains.map((domain) => (
              <li
                className="rounded-xl border border-zinc-200/70 px-4 py-3 text-sm dark:border-white/10"
                key={domain.id}
              >
                <p className={cn("font-medium", primaryText)}>
                  {domain.pathPrefix ?? "(no path)"}
                  {domain.isPrimary ? " · primary" : ""}
                </p>
                <p className={cn("text-xs", secondaryText)}>
                  Host: {domain.host ?? "—"} · {domain.isActive ? "active" : "inactive"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={cn("max-w-2xl space-y-4 rounded-2xl border p-6", dashboardGlass)}>
        <h3 className={cn("font-display text-lg font-bold", primaryText)}>Search Console</h3>
        <p className={cn("text-sm", secondaryText)}>
          Paste the Google Search Console HTML-tag token (content value only). Emitted as{" "}
          <code className="text-xs">google-site-verification</code> on the storefront. Each custom
          domain needs its own GSC property and that host&apos;s <code className="text-xs">/sitemap.xml</code>.
        </p>
        <Input
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              googleSiteVerification: event.target.value,
            }))
          }
          placeholder="google-site-verification token"
          value={form.googleSiteVerification}
        />
      </div>

      {isPlatformAdmin ? (
        <div className={cn("max-w-2xl space-y-3 rounded-2xl border border-[#d81b60]/30 p-6", dashboardGlass)}>
          <h3 className={cn("font-display text-lg font-bold", primaryText)}>Platform controls</h3>
          <p className={cn("text-sm", secondaryText)}>
            Soft-delete hides this store from customers, POS brand lists, and admin pickers.
            Data is kept and you can reactivate later.
          </p>
          {storeIsActive ? (
            <Button
              disabled={isSuspending}
              onClick={() => {
                const confirmed = window.confirm(
                  `Delete store "${settings.storeName}"?\n\nThis is a soft delete: the store is hidden but data is kept. You can reactivate it later.`,
                );
                if (!confirmed) {
                  return;
                }
                void (async () => {
                  setIsSuspending(true);
                  setError(null);
                  try {
                    await updateStoreStatus(token, brandSlug, false);
                    setStoreIsActive(false);
                    onStoreSuspended?.();
                  } catch (suspendError) {
                    setError(
                      suspendError instanceof Error
                        ? suspendError.message
                        : "Unable to delete store.",
                    );
                  } finally {
                    setIsSuspending(false);
                  }
                })();
              }}
              type="button"
              variant="outline"
            >
              {isSuspending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete store
            </Button>
          ) : (
            <Button
              disabled={isSuspending}
              onClick={() => {
                void (async () => {
                  setIsSuspending(true);
                  setError(null);
                  try {
                    await updateStoreStatus(token, brandSlug, true);
                    setStoreIsActive(true);
                  } catch (reactivateError) {
                    setError(
                      reactivateError instanceof Error
                        ? reactivateError.message
                        : "Unable to reactivate store.",
                    );
                  } finally {
                    setIsSuspending(false);
                  }
                })();
              }}
              type="button"
            >
              {isSuspending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reactivate store
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
