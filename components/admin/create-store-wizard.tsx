"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { LogoUploader } from "@/components/admin/logo-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStore } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import type { CreatedStore, CreateStorePayload } from "@/types/brand";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Branding", "Location", "Domain", "Review"] as const;

interface CreateStoreWizardProps {
  token: string;
  onCancel: () => void;
  onCreated: (store: CreatedStore) => void;
}

interface FormState {
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  pathPrefix: string;
  host: string;
  createStarterCategories: boolean;
  locationName: string;
  suburb: string;
  address: string;
  phone: string;
  email: string;
  deliveryFee: string;
  minOrderAmount: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function normalizePathPrefix(slug: string, pathPrefix: string): string {
  const raw = (pathPrefix.trim() || `/${slug}`).toLowerCase();
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || withSlash;
}

export function CreateStoreWizard({
  token,
  onCancel,
  onCreated,
}: CreateStoreWizardProps): React.ReactElement {
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    tagline: "",
    logoUrl: "",
    primaryColor: "#D81B60",
    pathPrefix: "",
    host: "",
    createStarterCategories: true,
    locationName: "Main",
    suburb: "",
    address: "",
    phone: "",
    email: "",
    deliveryFee: "5",
    minOrderAmount: "0",
  });

  const pathPreview = useMemo(() => {
    if (!form.slug.trim()) {
      return "/your-store";
    }
    return normalizePathPrefix(form.slug, form.pathPrefix);
  }, [form.slug, form.pathPrefix]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.name.trim().length < 2) {
        return "Store name must be at least 2 characters.";
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return "Slug must be lowercase kebab-case (e.g. ninja-store).";
      }
    }

    if (step === 2 && !form.locationName.trim()) {
      return "Location name is required.";
    }

    return null;
  };

  const goNext = (): void => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = (): void => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (): Promise<void> => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload: CreateStorePayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      primaryColor: form.primaryColor.trim() || undefined,
      pathPrefix: normalizePathPrefix(form.slug, form.pathPrefix),
      host: form.host.trim() || undefined,
      createStarterCategories: form.createStarterCategories,
      location: {
        name: form.locationName.trim(),
        suburb: form.suburb.trim() || undefined,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        deliveryFee: Number(form.deliveryFee) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
      },
    };

    try {
      const store = await createStore(token, payload);
      onCreated(store);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to create store. Try again.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div
        className={cn(
          "w-full max-w-2xl rounded-3xl border border-zinc-200/60 p-8 shadow-xl dark:border-white/10",
          dashboardGlass
        )}
      >
        <p className={cn("text-sm uppercase tracking-wide", secondaryText)}>Platform admin</p>
        <h1 className={cn("mt-2 font-display text-3xl font-bold", primaryText)}>Create store</h1>
        <p className={cn("mt-2 text-sm", secondaryText)}>
          Set up a new store with branding, first location, path, and cash payments.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((label, index) => (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                index === step
                  ? "bg-[#d81b60] text-white"
                  : index < step
                    ? "bg-[#d81b60]/15 text-[#d81b60]"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}
              key={label}
            >
              {index + 1}. {label}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {step === 0 ? (
            <>
              <Field label="Store name">
                <Input
                  onChange={(event) => {
                    const name = event.target.value;
                    const nextSlug = slugify(name);
                    setForm((current) => ({
                      ...current,
                      name,
                      slug:
                        !current.slug || current.slug === slugify(current.name)
                          ? nextSlug
                          : current.slug,
                    }));
                  }}
                  placeholder="Ninja Store"
                  value={form.name}
                />
              </Field>
              <Field label="Slug">
                <Input
                  onChange={(event) => update("slug", slugify(event.target.value))}
                  placeholder="ninja-store"
                  value={form.slug}
                />
              </Field>
              <Field label="Tagline (optional)">
                <Input
                  onChange={(event) => update("tagline", event.target.value)}
                  placeholder="Fast & bold"
                  value={form.tagline}
                />
              </Field>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label="Primary color">
                <div className="flex items-center gap-3">
                  <input
                    className="h-10 w-14 cursor-pointer rounded border border-zinc-200 bg-transparent dark:border-white/10"
                    onChange={(event) => update("primaryColor", event.target.value)}
                    type="color"
                    value={form.primaryColor || "#D81B60"}
                  />
                  <Input
                    onChange={(event) => update("primaryColor", event.target.value)}
                    placeholder="#D81B60"
                    value={form.primaryColor}
                  />
                </div>
              </Field>
              <Field label="Logo">
                <LogoUploader
                  onChange={(logoUrl) => update("logoUrl", logoUrl)}
                  primaryColor={form.primaryColor || "#D81B60"}
                  storeName={form.name || "Store"}
                  token={token}
                  value={form.logoUrl}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  checked={form.createStarterCategories}
                  onChange={(event) => update("createStarterCategories", event.target.checked)}
                  type="checkbox"
                />
                Create starter categories (Mains, Sides, Drinks)
              </label>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field label="Location name">
                <Input
                  onChange={(event) => update("locationName", event.target.value)}
                  placeholder="Main"
                  value={form.locationName}
                />
              </Field>
              <Field label="Suburb (optional)">
                <Input
                  onChange={(event) => update("suburb", event.target.value)}
                  placeholder="Murrumbeena"
                  value={form.suburb}
                />
              </Field>
              <Field label="Address (optional)">
                <Input
                  onChange={(event) => update("address", event.target.value)}
                  value={form.address}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone (optional)">
                  <Input
                    onChange={(event) => update("phone", event.target.value)}
                    value={form.phone}
                  />
                </Field>
                <Field label="Email (optional)">
                  <Input
                    onChange={(event) => update("email", event.target.value)}
                    value={form.email}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery fee">
                  <Input
                    onChange={(event) => update("deliveryFee", event.target.value)}
                    type="number"
                    value={form.deliveryFee}
                  />
                </Field>
                <Field label="Min order">
                  <Input
                    onChange={(event) => update("minOrderAmount", event.target.value)}
                    type="number"
                    value={form.minOrderAmount}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Field label="Website path">
                <Input
                  onChange={(event) => update("pathPrefix", event.target.value)}
                  placeholder={pathPreview}
                  value={form.pathPrefix}
                />
              </Field>
              <p className={cn("text-xs", secondaryText)}>
                Customers will use path <span className="font-medium text-[#d81b60]">{pathPreview}</span>{" "}
                (host routing comes later).
              </p>
              <Field label="Custom host (optional)">
                <Input
                  onChange={(event) => update("host", event.target.value)}
                  placeholder="ninjastore.com.au"
                  value={form.host}
                />
              </Field>
              <p className={cn("rounded-xl bg-zinc-100/80 p-3 text-sm dark:bg-zinc-800/60", secondaryText)}>
                Payments default to <strong className={primaryText}>Cash enabled</strong>. Card
                providers can be configured later from the dashboard.
              </p>
            </>
          ) : null}

          {step === 4 ? (
            <div className={cn("space-y-3 rounded-2xl border border-zinc-200/70 p-5 dark:border-white/10")}>
              <ReviewRow label="Name" value={form.name} />
              <ReviewRow label="Slug" value={form.slug} />
              <ReviewRow label="Path" value={pathPreview} />
              <ReviewRow label="Location" value={form.locationName} />
              <ReviewRow label="Color" value={form.primaryColor || "#D81B60"} />
              <ReviewRow
                label="Starter categories"
                value={form.createStarterCategories ? "Yes" : "No"}
              />
              <ReviewRow label="Payments" value="Cash enabled" />
            </div>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-[#d81b60]">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button onClick={onCancel} type="button" variant="ghost">
            Cancel
          </Button>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button disabled={isSaving} onClick={goBack} type="button" variant="outline">
                Back
              </Button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <Button onClick={goNext} type="button">
                Next
              </Button>
            ) : (
              <Button disabled={isSaving} onClick={() => void handleSubmit()} type="button">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create store
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="block space-y-2">
      <span className={cn("text-sm font-medium", primaryText)}>{label}</span>
      {children}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={secondaryText}>{label}</span>
      <span className={cn("font-medium", primaryText)}>{value}</span>
    </div>
  );
}
