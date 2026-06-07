"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStoreSettings } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { StoreSettings, UpdateStoreSettingsPayload } from "@/types/store";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  token: string;
  settings: StoreSettings;
  onSettingsChange: (settings: StoreSettings) => void;
}

interface SettingsFormState {
  storeName: string;
  tagline: string;
  deliveryFee: string;
  minOrderAmount: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

function formFromSettings(settings: StoreSettings): SettingsFormState {
  return {
    storeName: settings.storeName,
    tagline: settings.tagline ?? "",
    deliveryFee: String(settings.deliveryFee),
    minOrderAmount: String(settings.minOrderAmount),
    contactEmail: settings.contactEmail ?? "",
    contactPhone: settings.contactPhone ?? "",
    address: settings.address ?? "",
  };
}

export function SettingsView({
  token,
  settings,
  onSettingsChange,
}: SettingsViewProps): React.ReactElement {
  const [form, setForm] = useState<SettingsFormState>(() => formFromSettings(settings));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(formFromSettings(settings));
  }, [settings]);

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const payload: UpdateStoreSettingsPayload = {
      storeName: form.storeName.trim(),
      tagline: form.tagline.trim(),
      deliveryFee: Number(form.deliveryFee),
      minOrderAmount: Number(form.minOrderAmount),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
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
          Store details and delivery pricing used on the customer site and checkout.
        </p>
      </div>

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

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}

        <Button disabled={isSaving || !form.storeName.trim()} onClick={() => void handleSubmit()}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
