"use client";

import { HeroImageUploader } from "@/components/admin/hero-image-uploader";
import { LogoUploader } from "@/components/admin/logo-uploader";
import { OpeningHoursEditor } from "@/components/admin/opening-hours-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOnboarding, updateStoreSettings, updateStoreStatus } from "@/lib/admin-api";
import { coerceOpeningHours, type OpeningHoursConfig } from "@/lib/opening-hours";
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
  secondaryColor: string;
  heroImageUrl: string;
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
    secondaryColor: settings.secondaryColor ?? "#111827",
    heroImageUrl: settings.heroImageUrl ?? "",
    deliveryFee: String(settings.deliveryFee),
    minOrderAmount: String(settings.minOrderAmount),
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    address: settings.address ?? "",
    openingHours: coerceOpeningHours(settings.openingHours),
  };
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

  useEffect(() => {
    setForm(formFromSettings(settings));
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    void fetchOnboarding(token, brandSlug)
      .then((next) => {
        if (!cancelled) {
          setReadiness(next);
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

    const payload: UpdateStoreSettingsPayload = {
      storeName: form.storeName.trim(),
      tagline: form.tagline.trim(),
      logoUrl: form.logoUrl.trim() || null,
      logoDarkUrl: form.logoDarkUrl.trim() || null,
      primaryColor: form.primaryColor.trim() || null,
      secondaryColor: form.secondaryColor.trim() || null,
      heroImageUrl: form.heroImageUrl.trim() || null,
      deliveryFee: Number(form.deliveryFee),
      minOrderAmount: Number(form.minOrderAmount),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
      openingHours: form.openingHours,
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Primary colour</label>
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
            <p className={cn("mt-1 text-xs", secondaryText)}>Buttons and main accents</p>
          </div>
          <div>
            <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
              Secondary colour
            </label>
            <div className="flex items-center gap-3">
              <input
                className="h-10 w-14 cursor-pointer rounded border border-zinc-200 bg-transparent dark:border-white/10"
                onChange={(event) =>
                  setForm((current) => ({ ...current, secondaryColor: event.target.value }))
                }
                type="color"
                value={form.secondaryColor || "#111827"}
              />
              <Input
                onChange={(event) =>
                  setForm((current) => ({ ...current, secondaryColor: event.target.value }))
                }
                placeholder="#111827"
                value={form.secondaryColor}
              />
            </div>
            <p className={cn("mt-1 text-xs", secondaryText)}>Hero highlight and secondary accents</p>
          </div>
        </div>

        <div>
          <label className={cn("mb-1 block text-sm font-semibold", primaryText)}>
            Homepage hero image
          </label>
          <p className={cn("mb-3 text-xs", secondaryText)}>
            Full-bleed banner behind the homepage headline.
          </p>
          <HeroImageUploader
            onChange={(heroImageUrl) => setForm((current) => ({ ...current, heroImageUrl }))}
            token={token}
            value={form.heroImageUrl}
          />
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

      {isPlatformAdmin ? (
        <div className={cn("max-w-2xl space-y-3 rounded-2xl border border-[#d81b60]/30 p-6", dashboardGlass)}>
          <h3 className={cn("font-display text-lg font-bold", primaryText)}>Platform controls</h3>
          <p className={cn("text-sm", secondaryText)}>
            Suspend this store to hide it from customers, POS brand lists, and admin pickers.
          </p>
          <Button
            disabled={isSuspending}
            onClick={() => {
              void (async () => {
                setIsSuspending(true);
                setError(null);
                try {
                  await updateStoreStatus(token, brandSlug, false);
                  onStoreSuspended?.();
                } catch (suspendError) {
                  setError(
                    suspendError instanceof Error
                      ? suspendError.message
                      : "Unable to suspend store.",
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
            Suspend store
          </Button>
        </div>
      ) : null}
    </div>
  );
}
