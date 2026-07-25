"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  pairLinklyPinpad,
  unpairLinklyPinpad,
  updatePaymentSettings,
} from "@/lib/admin-api";
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
  const [linklyUsername, setLinklyUsername] = useState(settings.linklyUsername ?? "");
  const [linklyPassword, setLinklyPassword] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pairMessage, setPairMessage] = useState<string | null>(null);

  useEffect(() => {
    setCashEnabled(settings.cashEnabled);
    setCardTerminalEnabled(settings.cardTerminalEnabled);
    setLinklyUsername(settings.linklyUsername ?? "");
    setLinklyPassword("");
    setPairCode("");
  }, [settings]);

  const handleSubmit = async (): Promise<void> => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    setPairMessage(null);

    const payload: UpdatePaymentSettingsPayload = {
      cashEnabled,
      cardTerminalEnabled,
      provider: cardTerminalEnabled ? "LINKLY" : cashEnabled ? "CASH" : "NONE",
      linklyUsername: linklyUsername.trim() || null,
    };

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

  const handlePair = async (): Promise<void> => {
    setIsPairing(true);
    setError(null);
    setPairMessage(null);
    setSaved(false);

    try {
      const updated = await pairLinklyPinpad(token, {
        username: linklyUsername.trim(),
        password: linklyPassword,
        pairCode: pairCode.trim(),
      });
      onSettingsChange(updated);
      setCardTerminalEnabled(true);
      setLinklyPassword("");
      setPairCode("");
      setPairMessage("Pinpad paired. Card payments are ready on POS.");
    } catch (pairError) {
      setError(
        pairError instanceof Error ? pairError.message : "Unable to pair Linkly pinpad.",
      );
    } finally {
      setIsPairing(false);
    }
  };

  const handleUnpair = async (): Promise<void> => {
    if (!window.confirm("Unpair this store’s Linkly pinpad? Card will be disabled until re-paired.")) {
      return;
    }

    setIsUnpairing(true);
    setError(null);
    setPairMessage(null);

    try {
      const updated = await unpairLinklyPinpad(token);
      onSettingsChange(updated);
      setCardTerminalEnabled(false);
      setPairMessage("Pinpad unpaired.");
    } catch (unpairError) {
      setError(
        unpairError instanceof Error
          ? unpairError.message
          : "Unable to unpair Linkly pinpad.",
      );
    } finally {
      setIsUnpairing(false);
    }
  };

  const paired = settings.linklyPaired ?? settings.hasLinklySecretRef;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Payments</h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Cash and Linkly Cloud pinpad for this store. Pairing secrets stay on the server.
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
              Card terminal (Linkly Cloud)
            </span>
            <span className={cn("block text-xs", secondaryText)}>
              Enable after the pinpad is paired below.
            </span>
          </span>
        </label>

        <div className="border-t border-zinc-200/60 pt-4 dark:border-white/10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className={cn("text-sm font-semibold", primaryText)}>Linkly Cloud pinpad</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                paired
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-zinc-500/15 text-zinc-500",
              )}
            >
              {paired ? "Paired" : "Not paired"}
            </span>
          </div>
          <p className={cn("mb-3 text-xs", secondaryText)}>
            On the pinpad, open Cloud pairing and enter the 6-digit code here with your Linkly
            Cloud username and password.
          </p>
          <div className="space-y-3">
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Linkly username
              </label>
              <Input
                onChange={(event) => setLinklyUsername(event.target.value)}
                placeholder="Cloud username from Linkly / bank"
                value={linklyUsername}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Linkly password
              </label>
              <Input
                autoComplete="new-password"
                onChange={(event) => setLinklyPassword(event.target.value)}
                placeholder="Used only for pairing — not stored"
                type="password"
                value={linklyPassword}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Pair code from pinpad
              </label>
              <Input
                onChange={(event) => setPairCode(event.target.value)}
                placeholder="6-digit code"
                value={pairCode}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={
                  isPairing ||
                  !linklyUsername.trim() ||
                  !linklyPassword ||
                  !pairCode.trim()
                }
                onClick={() => void handlePair()}
                type="button"
              >
                {isPairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pair pinpad
              </Button>
              {paired ? (
                <Button
                  disabled={isUnpairing}
                  onClick={() => void handleUnpair()}
                  type="button"
                  variant="outline"
                >
                  {isUnpairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Unpair
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-[#d81b60]">{error}</p> : null}
        {pairMessage ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">{pairMessage}</p>
        ) : null}
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
