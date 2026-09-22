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
  const [pairLocationId, setPairLocationId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pairMessage, setPairMessage] = useState<string | null>(null);

  const locations = settings.locations ?? [];
  const multiLocation = locations.length > 1;

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

  const handlePair = async (locationId?: string): Promise<void> => {
    setIsPairing(true);
    setError(null);
    setPairMessage(null);
    setSaved(false);

    try {
      const updated = await pairLinklyPinpad(token, {
        username: linklyUsername.trim(),
        password: linklyPassword,
        pairCode: pairCode.trim(),
        ...(locationId ? { locationId } : {}),
      });
      onSettingsChange(updated);
      setCardTerminalEnabled(true);
      setLinklyPassword("");
      setPairCode("");
      setPairMessage(
        locationId
          ? "Location pinpad paired. Card payments use this pinpad for that site."
          : "Brand pinpad paired. Card payments are ready on POS (location overrides still win).",
      );
    } catch (pairError) {
      setError(
        pairError instanceof Error ? pairError.message : "Unable to pair Linkly pinpad.",
      );
    } finally {
      setIsPairing(false);
    }
  };

  const handleUnpair = async (locationId?: string): Promise<void> => {
    const label = locationId ? "this location’s" : "this store’s brand-level";
    if (
      !window.confirm(
        `Unpair ${label} Linkly pinpad? Card will fall back or disable until re-paired.`,
      )
    ) {
      return;
    }

    setIsUnpairing(true);
    setError(null);
    setPairMessage(null);

    try {
      const updated = await unpairLinklyPinpad(token, undefined, locationId);
      onSettingsChange(updated);
      if (!locationId) {
        setCardTerminalEnabled(false);
      }
      setPairMessage(locationId ? "Location pinpad unpaired." : "Brand pinpad unpaired.");
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
          Cash and Linkly Cloud pinpad for this store. Pair a brand default, then optionally
          override per location when you have more than one site.
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
            <p className={cn("text-sm font-semibold", primaryText)}>
              Brand default Linkly pinpad
            </p>
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
            Used when a location has no override. On the pinpad: Cloud Mode → FUNC 8880 → enter
            the 6-digit code with your Linkly Cloud username and password.
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
                Pair brand pinpad
              </Button>
              {paired ? (
                <Button
                  disabled={isUnpairing}
                  onClick={() => void handleUnpair()}
                  type="button"
                  variant="outline"
                >
                  {isUnpairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Unpair brand
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {multiLocation ? (
          <div className="border-t border-zinc-200/60 pt-4 dark:border-white/10">
            <p className={cn("mb-1 text-sm font-semibold", primaryText)}>
              Per-location pinpad override
            </p>
            <p className={cn("mb-3 text-xs", secondaryText)}>
              Pair a different pinpad for a site. POS uses the location override when present,
              otherwise the brand default above.
            </p>
            <ul className="mb-4 space-y-2">
              {locations.map((loc) => (
                <li
                  key={loc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200/60 px-3 py-2 dark:border-white/10"
                >
                  <span className={cn("text-sm font-medium", primaryText)}>{loc.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      loc.linklyPaired
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : "bg-zinc-500/15 text-zinc-500",
                    )}
                  >
                    {loc.linklyPaired ? "Paired override" : "Uses brand default"}
                  </span>
                  {loc.linklyPaired ? (
                    <Button
                      disabled={isUnpairing}
                      onClick={() => void handleUnpair(loc.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Unpair
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Location to pair
                </label>
                <select
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-zinc-900"
                  onChange={(event) => setPairLocationId(event.target.value)}
                  value={pairLocationId}
                >
                  <option value="">Select location…</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                disabled={
                  isPairing ||
                  !pairLocationId ||
                  !linklyUsername.trim() ||
                  !linklyPassword ||
                  !pairCode.trim()
                }
                onClick={() => void handlePair(pairLocationId)}
                type="button"
              >
                {isPairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pair location pinpad
              </Button>
            </div>
          </div>
        ) : null}

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
