"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPlatformSecrets, updatePlatformSecrets } from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { PlatformSecretKey, PlatformSecretRow } from "@/types/hq";
import { cn } from "@/lib/utils";

const KEY_HELP: Record<PlatformSecretKey, string> = {
  STRIPE_SECRET_KEY: "Global Stripe secret fallback when a store has no per-store key.",
  STRIPE_WEBHOOK_SECRET: "Global webhook signing secret for POST /webhooks/stripe.",
  LINKLY_ENV: 'Linkly Cloud environment: "sandbox" or "production".',
};

interface PlatformSecretsViewProps {
  token: string;
}

export function PlatformSecretsView({ token }: PlatformSecretsViewProps): React.ReactElement {
  const [rows, setRows] = useState<PlatformSecretRow[]>([]);
  const [drafts, setDrafts] = useState<Partial<Record<PlatformSecretKey, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchPlatformSecrets(token);
      setRows(next);
      setDrafts({});
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSave = async (): Promise<void> => {
    const secrets = (Object.entries(drafts) as Array<[PlatformSecretKey, string]>)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({
        key,
        value: value.trim() === "" ? null : value.trim(),
      }));

    if (secrets.length === 0) {
      setError("Change at least one value before saving.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const next = await updatePlatformSecrets(token, secrets);
      setRows(next);
      setDrafts({});
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save secrets.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Platform secrets</h2>
        <p className={cn("mt-1 max-w-2xl text-sm", secondaryText)}>
          Marina HQ only. Allowlisted global keys stored encrypted in the database (overrides env).
          Per-store Stripe and Linkly credentials stay under each store&apos;s Infrastructure screen.
          Leave a field blank and save to clear the DB override. Never put JWT_SECRET or DATABASE_URL
          here — those stay on the Droplet. Restart the API container if a change does not take effect.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#d81b60]" />
        </div>
      ) : (
        <div className={cn("max-w-2xl space-y-5 rounded-2xl border border-zinc-200/70 p-6", dashboardGlass)}>
          {rows.map((row) => (
            <div className="space-y-2" key={row.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label className={cn("text-sm font-semibold", primaryText)} htmlFor={row.key}>
                  {row.key}
                </label>
                <span className={cn("text-xs", secondaryText)}>
                  {row.source === "database"
                    ? `DB · ${row.maskedValue ?? "set"}`
                    : row.source === "env"
                      ? `env · ${row.maskedValue ?? "set"}`
                      : "not set"}
                </span>
              </div>
              <p className={cn("text-xs", secondaryText)}>{KEY_HELP[row.key]}</p>
              <Input
                autoComplete="off"
                id={row.key}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [row.key]: event.target.value }))
                }
                placeholder={
                  row.key === "LINKLY_ENV"
                    ? row.maskedValue ?? "sandbox | production"
                    : row.maskedValue
                      ? `Current: ${row.maskedValue}`
                      : "Paste new value (leave blank to clear DB override)"
                }
                type={row.key === "LINKLY_ENV" ? "text" : "password"}
                value={drafts[row.key] ?? ""}
              />
            </div>
          ))}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {saved ? (
            <p className="text-sm text-emerald-700">
              Saved. If Stripe/Linkly behaviour is unchanged, restart the API:
              {" "}
              <code className="text-xs">docker compose -f docker-compose.prod.yml restart api</code>
            </p>
          ) : null}

          <Button disabled={isSaving} onClick={() => void handleSave()} type="button">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save platform secrets
          </Button>
        </div>
      )}
    </div>
  );
}
