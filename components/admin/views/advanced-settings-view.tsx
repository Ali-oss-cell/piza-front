"use client";

import {
  ChevronDown,
  ChevronRight,
  Globe,
  CreditCard,
  Loader2,
  Plus,
  ExternalLink,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchHqDomains,
  createHqDomain,
  updateHqDomain,
  syncHqTraefikDomains,
  updatePaymentSettings,
  pairLinklyPinpad,
  unpairLinklyPinpad,
} from "@/lib/admin-api";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { HqDomain } from "@/types/hq";
import type { Brand } from "@/types/brand";
import type { PaymentSettings, UpdatePaymentSettingsPayload } from "@/types/payments";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────── types ── */

interface AdvancedSettingsViewProps {
  token: string;
  brands: Brand[];
  brandSlug: string;
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (s: PaymentSettings) => void;
}

/* ─────────────────────────── small helpers ── */

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ok
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-zinc-500/15 text-zinc-500",
      )}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {label}
    </span>
  );
}

function SectionHeader({
  open,
  icon: Icon,
  title,
  subtitle,
  badge,
  onToggle,
}: {
  open: boolean;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  onToggle: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-4 text-left"
      onClick={onToggle}
      type="button"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d81b60]/10 text-[#d81b60]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-semibold", primaryText)}>{title}</p>
          {badge}
        </div>
        <p className={cn("text-xs", secondaryText)}>{subtitle}</p>
      </div>
      {open ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════ MAIN VIEW ══ */

export function AdvancedSettingsView({
  token,
  brands,
  brandSlug,
  paymentSettings,
  onPaymentSettingsChange,
}: AdvancedSettingsViewProps): React.ReactElement {
  /* which accordion sections are open */
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["domains", "cash", "linkly"]),
  );

  const toggle = (key: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const isOpen = (key: string) => openSections.has(key);

  /* ── global save feedback ── */
  const [globalMsg, setGlobalMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
          Advanced Settings
        </h2>
        <p className={cn("mt-1 text-sm", secondaryText)}>
          Domain routing and payment gateway configuration for this store.
          Secrets are stored encrypted on the server — never in the browser.
        </p>
      </div>

      {globalMsg ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
            globalMsg.type === "ok"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-[#d81b60]/30 bg-[#d81b60]/10 text-[#d81b60]",
          )}
        >
          {globalMsg.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {globalMsg.text}
        </div>
      ) : null}

      {/* ───────────────────────────── DOMAINS ───────────────────── */}
      <DomainsSection
        brands={brands}
        brandSlug={brandSlug}
        flash={flash}
        isOpen={isOpen("domains")}
        onToggle={() => toggle("domains")}
        token={token}
      />

      {/* ───────────────────────────── CASH ──────────────────────── */}
      <CashSection
        flash={flash}
        isOpen={isOpen("cash")}
        onPaymentSettingsChange={onPaymentSettingsChange}
        onToggle={() => toggle("cash")}
        paymentSettings={paymentSettings}
        token={token}
      />

      {/* ───────────────────────────── STRIPE TERMINAL ───────────── */}
      <StripeTerminalSection
        flash={flash}
        isOpen={isOpen("stripe")}
        onPaymentSettingsChange={onPaymentSettingsChange}
        onToggle={() => toggle("stripe")}
        paymentSettings={paymentSettings}
        token={token}
      />

      {/* ───────────────────────────── STRIPE ONLINE ─────────────── */}
      <StripeOnlineSection
        flash={flash}
        isOpen={isOpen("stripe-online")}
        onPaymentSettingsChange={onPaymentSettingsChange}
        onToggle={() => toggle("stripe-online")}
        paymentSettings={paymentSettings}
        token={token}
      />

      {/* ───────────────────────────── LINKLY ────────────────────── */}
      <LinklySection
        flash={flash}
        isOpen={isOpen("linkly")}
        onPaymentSettingsChange={onPaymentSettingsChange}
        onToggle={() => toggle("linkly")}
        paymentSettings={paymentSettings}
        token={token}
      />

      {/* ───────────────────────────── FUTURE GATEWAYS ───────────── */}
      <div className={cn("rounded-2xl border border-dashed p-5", dashboardGlass)}>
        <p className={cn("text-sm font-semibold", primaryText)}>Coming soon</p>
        <p className={cn("mt-1 text-xs", secondaryText)}>
          Square, Tyro, PayTo, Afterpay, Uber Eats aggregator webhook — each will appear
          here as its own collapsible section. Gateways are opt-in per store.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ SECTION: DOMAINS ══════ */

function DomainsSection({
  token,
  brands,
  brandSlug,
  isOpen,
  onToggle,
  flash,
}: {
  token: string;
  brands: Brand[];
  brandSlug: string;
  isOpen: boolean;
  onToggle: () => void;
  flash: (type: "ok" | "err", text: string) => void;
}) {
  const [domains, setDomains] = useState<HqDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ host: "", pathPrefix: "", isPrimary: false });

  const load = async () => {
    setLoading(true);
    try {
      const all = await fetchHqDomains(token);
      setDomains(all.filter((d) => d.store?.slug === brandSlug));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, brandSlug]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncHqTraefikDomains(token);
      flash(
        "ok",
        result.hosts.length === 0
          ? "Traefik synced — no custom hosts yet."
          : `Synced ${result.hosts.length} host(s): ${result.hosts.join(", ")}`,
      );
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await createHqDomain(token, {
        storeSlug: brandSlug,
        host: form.host.trim() || undefined,
        pathPrefix: form.pathPrefix.trim() || undefined,
        isPrimary: form.isPrimary,
      });
      await load();
      setIsModalOpen(false);
      setForm({ host: "", pathPrefix: "", isPrimary: false });
      flash("ok", "Domain added. Point DNS A record to the Droplet IP, then Sync Traefik.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Failed to add domain.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (domain: HqDomain) => {
    setBusyId(domain.id);
    try {
      await updateHqDomain(token, domain.id, { isActive: !domain.isActive });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleSetPrimary = async (domain: HqDomain) => {
    setBusyId(domain.id);
    try {
      await updateHqDomain(token, domain.id, { isPrimary: true });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const activeDomains = domains.filter((d) => d.isActive).length;

  return (
    <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
      <SectionHeader
        open={isOpen}
        icon={Globe}
        title="Domain routing"
        subtitle="Custom hostnames and path prefixes for this storefront."
        badge={<StatusBadge ok={activeDomains > 0} label={`${activeDomains} active`} />}
        onToggle={onToggle}
      />
      {isOpen ? (
        <div className="mt-5 space-y-4">
            {/* how-to note */}
            <div className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900/50">
              <strong className="text-zinc-700 dark:text-zinc-300">How to set up a custom domain:</strong>
              <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                <li>At your registrar, add an <strong>A record</strong> pointing the domain to the Droplet IP.</li>
                <li>Add the domain here.</li>
                <li>Click <strong>Sync Traefik</strong> — HTTPS is issued automatically via Let&apos;s Encrypt.</li>
              </ol>
            </div>

            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#d81b60]" />
            ) : domains.length === 0 ? (
              <p className={cn("text-sm", secondaryText)}>No domains yet.</p>
            ) : (
              <ul className="space-y-2">
                {domains.map((domain) => (
                  <li
                    key={domain.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-4 py-3 text-sm dark:border-white/10 dark:bg-zinc-900/30"
                  >
                    <div>
                      <p className={cn("font-medium", primaryText)}>
                        {domain.host || "(no host)"}
                        {domain.pathPrefix ? `/${domain.pathPrefix}` : ""}
                      </p>
                      {domain.host ? (
                        <a
                          className="flex items-center gap-1 text-xs text-[#d81b60] hover:underline"
                          href={`https://${domain.host}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </a>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.isPrimary ? (
                        <span className="rounded-full bg-[#d81b60]/10 px-2.5 py-0.5 text-xs font-semibold text-[#d81b60]">
                          Primary
                        </span>
                      ) : (
                        <button
                          className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800"
                          disabled={busyId === domain.id}
                          onClick={() => void handleSetPrimary(domain)}
                          type="button"
                        >
                          Set primary
                        </button>
                      )}
                      <button
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          domain.isActive
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
                        )}
                        disabled={busyId === domain.id}
                        onClick={() => void handleToggleActive(domain)}
                        type="button"
                      >
                        {domain.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={isSyncing}
                onClick={() => void handleSync()}
                type="button"
                variant="outline"
              >
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sync Traefik
              </Button>
              <Button onClick={() => setIsModalOpen(true)} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Add domain
              </Button>
            </div>
        </div>
      ) : null}

      {/* Add domain modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(96vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl",
              dashboardGlass,
            )}
          >
            <Dialog.Title className={cn("font-display text-xl font-bold", primaryText)}>
              Add domain
            </Dialog.Title>
            <div className="mt-5 space-y-4">
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Custom domain (host)
                </label>
                <Input
                  onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                  placeholder="e.g. bunnyboyspizza.com.au"
                  value={form.host}
                />
                <p className={cn("mt-1 text-xs", secondaryText)}>
                  Set an A record at your registrar pointing this domain to the Droplet IP.
                </p>
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Path prefix (optional)
                </label>
                <Input
                  onChange={(e) => setForm((f) => ({ ...f, pathPrefix: e.target.value }))}
                  placeholder="e.g. /bunnyboys"
                  value={form.pathPrefix}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={form.isPrimary}
                  onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))}
                  type="checkbox"
                />
                <span className={primaryText}>Set as primary domain</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button disabled={isSaving || !form.host.trim()} onClick={() => void handleCreate()}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ══════════════════════════════════════════ SECTION: CASH ═════════ */

function CashSection({
  token,
  paymentSettings,
  onPaymentSettingsChange,
  isOpen,
  onToggle,
  flash,
}: {
  token: string;
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (s: PaymentSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  flash: (type: "ok" | "err", text: string) => void;
}) {
  const [enabled, setEnabled] = useState(paymentSettings.cashEnabled);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(paymentSettings.cashEnabled);
  }, [paymentSettings]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updatePaymentSettings(token, { cashEnabled: enabled });
      onPaymentSettingsChange(updated);
      flash("ok", "Cash settings saved.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
      <SectionHeader
        open={isOpen}
        icon={CreditCard}
        title="Cash payments"
        subtitle="Allow staff to mark POS orders as paid with cash."
        badge={<StatusBadge ok={paymentSettings.cashEnabled} label={paymentSettings.cashEnabled ? "Enabled" : "Disabled"} />}
        onToggle={onToggle}
      />
      {isOpen ? (
        <div className="mt-5 space-y-4">
          <label className="flex items-start gap-3">
            <input
              checked={enabled}
              className="mt-1 h-4 w-4"
              onChange={(e) => setEnabled(e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className={cn("block text-sm font-medium", primaryText)}>Cash enabled</span>
              <span className={cn("block text-xs", secondaryText)}>
                Staff can select &quot;Cash&quot; on the POS register. No pinpad required.
              </span>
            </span>
          </label>
          <Button disabled={saving} onClick={() => void save()} type="button">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════ SECTION: STRIPE TERMINAL ═════ */

function StripeTerminalSection({
  token,
  paymentSettings,
  onPaymentSettingsChange,
  isOpen,
  onToggle,
  flash,
}: {
  token: string;
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (s: PaymentSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  flash: (type: "ok" | "err", text: string) => void;
}) {
  const loc = paymentSettings.location;
  const configured = !!(loc?.stripeTerminalLocationId && loc?.stripeTerminalReaderId);

  const [form, setForm] = useState({
    locationId: loc?.stripeTerminalLocationId ?? "",
    readerId: loc?.stripeTerminalReaderId ?? "",
    secretKey: "",
    webhookSecret: "",
    publishableKey: paymentSettings.stripePublishableKey ?? "",
    cardTerminalEnabled: paymentSettings.cardTerminalEnabled,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const l = paymentSettings.location;
    setForm({
      locationId: l?.stripeTerminalLocationId ?? "",
      readerId: l?.stripeTerminalReaderId ?? "",
      secretKey: "",
      webhookSecret: "",
      publishableKey: paymentSettings.stripePublishableKey ?? "",
      cardTerminalEnabled: paymentSettings.cardTerminalEnabled,
    });
  }, [paymentSettings]);

  const save = async () => {
    setSaving(true);
    try {
      const payload: UpdatePaymentSettingsPayload = {
        cardTerminalEnabled: form.cardTerminalEnabled,
        stripePublishableKey: form.publishableKey.trim() || null,
        stripeTerminalLocationId: form.locationId.trim() || null,
        stripeTerminalReaderId: form.readerId.trim() || null,
      };
      if (form.secretKey.trim()) {
        payload.stripeSecretKeyRef = form.secretKey.trim();
      }
      if (form.webhookSecret.trim()) {
        payload.stripeWebhookSecretRef = form.webhookSecret.trim();
      }
      if (form.cardTerminalEnabled) {
        payload.provider = "STRIPE";
      }
      const updated = await updatePaymentSettings(token, payload);
      onPaymentSettingsChange(updated);
      flash("ok", "Stripe Terminal settings saved.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
      <SectionHeader
        open={isOpen}
        icon={CreditCard}
        title="Stripe Terminal (in-store card)"
        subtitle="WisePOS E or T600 pinpad. Server-driven — no app install on tablet."
        badge={
          <StatusBadge
            ok={configured && paymentSettings.cardTerminalEnabled}
            label={configured ? "Configured" : "Not set up"}
          />
        }
        onToggle={onToggle}
      />
      {isOpen ? (
        <div className="mt-5 space-y-4">
            {/* how-to */}
            <div className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900/50">
              <strong className="text-zinc-700 dark:text-zinc-300">Setup checklist:</strong>
              <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
                <li>Create / verify Stripe AU account at stripe.com/au</li>
                <li>Dashboard → Terminal → create a Location (shop address)</li>
                <li>Order WisePOS E from the Terminal Shop → register it to the Location</li>
                <li>Copy IDs below. Secret key stays on the server, never leaves it.</li>
              </ol>
              <a
                className="mt-2 flex items-center gap-1 text-[#d81b60] hover:underline"
                href="https://stripe.com/au/terminal"
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-3 w-3" />
                Stripe Terminal AU pricing & docs
              </a>
            </div>

            <label className="flex items-start gap-3">
              <input
                checked={form.cardTerminalEnabled}
                className="mt-1 h-4 w-4"
                onChange={(e) => setForm((f) => ({ ...f, cardTerminalEnabled: e.target.checked }))}
                type="checkbox"
              />
              <span>
                <span className={cn("block text-sm font-medium", primaryText)}>Enable card terminal</span>
                <span className={cn("block text-xs", secondaryText)}>
                  Enable after reader is registered and IDs are saved.
                </span>
              </span>
            </label>

            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Stripe publishable key
              </label>
              <Input
                onChange={(e) => setForm((f) => ({ ...f, publishableKey: e.target.value }))}
                placeholder="pk_live_..."
                value={form.publishableKey}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Stripe secret key{" "}
                <span className={cn("font-normal", secondaryText)}>
                  {paymentSettings.hasStripeSecretRef ? "(stored — leave blank to keep)" : "(not set)"}
                </span>
              </label>
              <Input
                autoComplete="new-password"
                onChange={(e) => setForm((f) => ({ ...f, secretKey: e.target.value }))}
                placeholder={paymentSettings.hasStripeSecretRef ? "sk_live_... (replace)" : "sk_live_..."}
                type="password"
                value={form.secretKey}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Webhook secret{" "}
                <span className={cn("font-normal", secondaryText)}>
                  {paymentSettings.hasStripeWebhookSecretRef ? "(stored)" : "(not set)"}
                </span>
              </label>
              <Input
                autoComplete="new-password"
                onChange={(e) => setForm((f) => ({ ...f, webhookSecret: e.target.value }))}
                placeholder={paymentSettings.hasStripeWebhookSecretRef ? "whsec_... (replace)" : "whsec_..."}
                type="password"
                value={form.webhookSecret}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Terminal Location ID
              </label>
              <Input
                onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
                placeholder="tml_..."
                value={form.locationId}
              />
            </div>
            <div>
              <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                Reader ID
              </label>
              <Input
                onChange={(e) => setForm((f) => ({ ...f, readerId: e.target.value }))}
                placeholder="tmr_..."
                value={form.readerId}
              />
              <p className={cn("mt-1 text-xs", secondaryText)}>
                Found in Stripe Dashboard → Terminal → Readers after the WisePOS E is registered.
              </p>
            </div>

            <Button disabled={saving} onClick={() => void save()} type="button">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Stripe Terminal
            </Button>
          </div>
        ) : null}
    </div>
  );
}

/* ═══════════════════════════════════ SECTION: STRIPE ONLINE ═══════ */

function StripeOnlineSection({
  token,
  paymentSettings,
  onPaymentSettingsChange,
  isOpen,
  onToggle,
  flash,
}: {
  token: string;
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (s: PaymentSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  flash: (type: "ok" | "err", text: string) => void;
}) {
  const configured = paymentSettings.hasStripeSecretRef && paymentSettings.cardOnlineEnabled;
  const [enabled, setEnabled] = useState(paymentSettings.cardOnlineEnabled);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(paymentSettings.cardOnlineEnabled);
  }, [paymentSettings]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updatePaymentSettings(token, {
        cardOnlineEnabled: enabled,
        provider: enabled ? "STRIPE" : undefined,
      });
      onPaymentSettingsChange(updated);
      flash("ok", "Online card settings saved.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
      <SectionHeader
        open={isOpen}
        icon={CreditCard}
        title="Stripe Online (website checkout)"
        subtitle="Accept card payments on the customer website. Uses same Stripe account as Terminal."
        badge={<StatusBadge ok={!!configured} label={configured ? "Enabled" : "Disabled"} />}
        onToggle={onToggle}
      />
      {isOpen ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900/50">
            Stripe keys are shared with Terminal — enter them once in the Terminal section above.
            Enable online checkout here when the website checkout is ready.
          </div>
          <label className="flex items-start gap-3">
            <input
              checked={enabled}
              className="mt-1 h-4 w-4"
              onChange={(e) => setEnabled(e.target.checked)}
              type="checkbox"
            />
            <span>
              <span className={cn("block text-sm font-medium", primaryText)}>
                Enable online card payments
              </span>
              <span className={cn("block text-xs", secondaryText)}>
                Requires Stripe secret key to be saved in the Terminal section above.
              </span>
            </span>
          </label>
          <Button disabled={saving} onClick={() => void save()} type="button">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════ SECTION: LINKLY ═══════ */

function LinklySection({
  token,
  paymentSettings,
  onPaymentSettingsChange,
  isOpen,
  onToggle,
  flash,
}: {
  token: string;
  paymentSettings: PaymentSettings;
  onPaymentSettingsChange: (s: PaymentSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  flash: (type: "ok" | "err", text: string) => void;
}) {
  const paired = paymentSettings.linklyPaired ?? paymentSettings.hasLinklySecretRef;
  const [username, setUsername] = useState(paymentSettings.linklyUsername ?? "");
  const [password, setPassword] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [cardEnabled, setCardEnabled] = useState(paymentSettings.cardTerminalEnabled && paymentSettings.provider === "LINKLY");
  const [pairing, setPairing] = useState(false);
  const [unpairing, setUnpairing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(paymentSettings.linklyUsername ?? "");
    setCardEnabled(
      paymentSettings.cardTerminalEnabled && paymentSettings.provider === "LINKLY",
    );
  }, [paymentSettings]);

  const handlePair = async () => {
    setPairing(true);
    try {
      const updated = await pairLinklyPinpad(token, {
        username: username.trim(),
        password,
        pairCode: pairCode.trim(),
      });
      onPaymentSettingsChange(updated);
      setPassword("");
      setPairCode("");
      flash("ok", "Linkly pinpad paired. Card payments are ready on POS.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Pairing failed.");
    } finally {
      setPairing(false);
    }
  };

  const handleUnpair = async () => {
    if (!window.confirm("Unpair this Linkly pinpad? Card will be disabled until re-paired.")) return;
    setUnpairing(true);
    try {
      const updated = await unpairLinklyPinpad(token);
      onPaymentSettingsChange(updated);
      flash("ok", "Pinpad unpaired.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Unpair failed.");
    } finally {
      setUnpairing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePaymentSettings(token, {
        cardTerminalEnabled: cardEnabled,
        provider: cardEnabled ? "LINKLY" : undefined,
        linklyUsername: username.trim() || null,
      });
      onPaymentSettingsChange(updated);
      flash("ok", "Linkly settings saved.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-2xl border p-5", dashboardGlass)}>
      <SectionHeader
        open={isOpen}
        icon={CreditCard}
        title="Linkly Cloud (in-store pinpad)"
        subtitle="Australian bank-supplied pinpad via Linkly Cloud REST. Requires accreditation."
        badge={<StatusBadge ok={!!paired} label={paired ? "Paired" : "Not paired"} />}
        onToggle={onToggle}
      />
      {isOpen ? (
        <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:bg-zinc-900/50">
              Linkly is an alternative to Stripe Terminal for Australian bank-supplied pinpads.
              Requires Linkly Cloud accreditation before going live. If you have not heard back
              from Linkly, use <strong>Stripe Terminal</strong> above instead.
            </div>

            <label className="flex items-start gap-3">
              <input
                checked={cardEnabled}
                className="mt-1 h-4 w-4"
                onChange={(e) => setCardEnabled(e.target.checked)}
                type="checkbox"
              />
              <span>
                <span className={cn("block text-sm font-medium", primaryText)}>
                  Enable Linkly card terminal
                </span>
                <span className={cn("block text-xs", secondaryText)}>
                  Enable after the pinpad is paired below.
                </span>
              </span>
            </label>

            <div className="space-y-3 border-t border-zinc-200/60 pt-4 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cn("text-sm font-semibold", primaryText)}>Pinpad pairing</p>
                <StatusBadge ok={!!paired} label={paired ? "Paired" : "Not paired"} />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Username</label>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Linkly Cloud username"
                  value={username}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>Password</label>
                <Input
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Used for pairing only — not stored"
                  type="password"
                  value={password}
                />
              </div>
              <div>
                <label className={cn("mb-1 block text-sm font-medium", primaryText)}>
                  Pair code from pinpad
                </label>
                <Input
                  onChange={(e) => setPairCode(e.target.value)}
                  placeholder="6-digit code"
                  value={pairCode}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={pairing || !username.trim() || !password || !pairCode.trim()}
                  onClick={() => void handlePair()}
                  type="button"
                >
                  {pairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Pair pinpad
                </Button>
                {paired ? (
                  <Button
                    disabled={unpairing}
                    onClick={() => void handleUnpair()}
                    type="button"
                    variant="outline"
                  >
                    {unpairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Unpair
                  </Button>
                ) : null}
              </div>
            </div>

            <Button disabled={saving} onClick={() => void handleSave()} type="button">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Linkly settings
            </Button>
          </div>
        ) : null}
    </div>
  );
}
