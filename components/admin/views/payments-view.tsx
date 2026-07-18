"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePaymentSettings } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { PaymentSettings, UpdatePaymentSettingsPayload } from "@/types/payments";
import { cn } from "@/lib/utils";

interface PaymentsViewProps {
  token: string;
  settings: PaymentSettings;
  onSettingsChange: (settings: PaymentSettings) => void;
}

export function PaymentsView({
  token,
  settings,
  onSettingsChange,
}: PaymentsViewProps): React.ReactElement {
  const [cashEnabled, setCashEnabled] = useState(settings.cashEnabled);
  const [cardTerminalEnabled, setCardTerminalEnabled] = useState(
    settings.cardTerminalEnabled,
  );
  const [stripePublishableKey, setStripePublishableKey] = useState(
    settings.stripePublishableKey ?? "",
  );
  const [stripeSecretKeyRef, setStripeSecretKeyRef] = useState("");
  const [terminalLocationId, setTerminalLocationId] = useState(
    settings.location?.stripeTerminalLocationId ?? "",
  );
  const [terminalReaderId, setTerminalReaderId] = useState(
    settings.location?.stripeTerminalReaderId ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCashEnabled(settings.cashEnabled);
    setCardTerminalEnabled(settings.cardTerminalEnabled);
    setStripePublishableKey(settings.stripePublishableKey ?? "");
    setStripeSecretKeyRef("");
    setTerminalLocationId(settings.location?.stripeTerminalLocationId ?? "");
    setTerminalReaderId(settings.location?.stripeTerminalReaderId ?? "");
  }, [settings]);

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const payload: UpdatePaymentSettingsPayload = {
      cashEnabled,
      cardTerminalEnabled,
      provider: cardTerminalEnabled ? "STRIPE" : cashEnabled ? "CASH" : "NONE",
      stripePublishableKey: stripePublishableKey.trim() || null,
      stripeTerminalLocationId: terminalLocationId.trim() || null,
      stripeTerminalReaderId: terminalReaderId.trim() || null,
      locationId: settings.location?.id,
    };

    if (stripeSecretKeyRef.trim()) {
      payload.stripeSecretKeyRef = stripeSecretKeyRef.trim();
    }

    try {
      const updated = await updatePaymentSettings(token, payload);
      onSettingsChange(updated);
      setSaved(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save payment settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Payments</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Control which payment methods POS can use for this store. Secrets are stored as
          references only — never pasted into the browser long-term.
        </p>
      </div>

      <div className={cn("max-w-2xl space-y-5 rounded-2xl border p-6", dashboardGlass)}>
        <label className="flex items-start gap-3">
          <input
            checked={cashEnabled}
            className="mt-1 h-4 w-4"
            onChange={(event) => setCashEnabled(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className={cn("block text-sm font-medium", primaryText)}>Cash enabled</span>
            <span className={cn("block text-xs", secondaryText)}>
              Staff can mark POS orders paid with cash.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            checked={cardTerminalEnabled}
            className="mt-1 h-4 w-4"
            onChange={(event) => setCardTerminalEnabled(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className={cn("block text-sm font-medium", primaryText)}>
              Card terminal (Stripe)
            </span>
            <span className={cn("block text-xs", secondaryText)}>
              Enable after reader IDs are configured. Linkly comes later.
            </span>
          </span>
        </label>

        <div className="border-t border-zinc-200/60 pt-4 dark:border-white/10">
          <p className={cn("mb-3 text-sm font-semibold", primaryText)}>Stripe Terminal</p>
          <div className="space-y-3">
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Publishable key
              </label>
              <Input
                onChange={(event) => setStripePublishableKey(event.target.value)}
                placeholder="pk_live_… or pk_test_…"
                value={stripePublishableKey}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Secret key reference
              </label>
              <Input
                onChange={(event) => setStripeSecretKeyRef(event.target.value)}
                placeholder={
                  settings.hasStripeSecretRef
                    ? "Saved — enter a new ref to replace"
                    : "Vault / env ref name (not the raw secret)"
                }
                value={stripeSecretKeyRef}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Terminal location ID
              </label>
              <Input
                onChange={(event) => setTerminalLocationId(event.target.value)}
                placeholder="tml_…"
                value={terminalLocationId}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Terminal reader ID
              </label>
              <Input
                onChange={(event) => setTerminalReaderId(event.target.value)}
                placeholder="tmr_…"
                value={terminalReaderId}
              />
            </div>
            {settings.location ? (
              <p className={cn("text-xs", secondaryText)}>
                Applied to location: {settings.location.name}
              </p>
            ) : (
              <p className="text-xs text-[#d81b60]">No active location on this store yet.</p>
            )}
          </div>
        </div>

        {error ? <p className="text-sm text-[#d81b60]">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Payment settings saved.</p>
        ) : null}

        <Button disabled={isSaving} onClick={() => void handleSubmit()} type="button">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save payment settings
        </Button>
      </div>
    </div>
  );
}
