"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getEarliestEventDate,
  getMinimumLeadHours,
  isEventDateValid,
} from "@/lib/catering-utils";
import { submitInquiry } from "@/lib/inquiries-api";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";
import type { CateringQuoteFormData } from "@/types/catering";

interface CateringQuoteFormProps {
  storeName: string;
  brandSlug?: string;
}

const INITIAL: CateringQuoteFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  guestCount: 25,
  eventDate: "",
  eventTime: "12:00",
  deliveryAddress: "",
  dietaryNotes: "",
  requestInvoice: false,
  notes: "",
};

export function CateringQuoteForm({
  storeName,
  brandSlug = DEFAULT_BRAND_SLUG,
}: CateringQuoteFormProps): React.ReactElement {
  const [form, setForm] = useState<CateringQuoteFormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minDate = useMemo(() => getEarliestEventDate(form.guestCount), [form.guestCount]);
  const leadHours = getMinimumLeadHours(form.guestCount);

  const update = <K extends keyof CateringQuoteFormData>(
    key: K,
    value: CateringQuoteFormData[K]
  ): void => {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in your name, email, and phone.");
      return;
    }
    if (!form.deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    if (!isEventDateValid(form.eventDate, form.guestCount)) {
      setError(`Events need at least ${leadHours} hours notice. Pick a later date.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const messageParts = [
        `Catering quote request for ${storeName}`,
        `Guests: ${form.guestCount}`,
        `Event: ${form.eventDate} at ${form.eventTime}`,
        `Address: ${form.deliveryAddress}`,
        form.dietaryNotes.trim() ? `Dietary: ${form.dietaryNotes.trim()}` : null,
        form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
        form.requestInvoice ? "Tax invoice requested." : null,
      ].filter(Boolean);

      await submitInquiry(
        {
          type: "CATERING",
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: `Catering quote — ${form.guestCount} guests`,
          message: messageParts.join("\n"),
          payload: {
            company: form.company.trim() || undefined,
            guestCount: form.guestCount,
            eventDate: form.eventDate,
            eventTime: form.eventTime,
            deliveryAddress: form.deliveryAddress.trim(),
            dietaryNotes: form.dietaryNotes.trim() || undefined,
            requestInvoice: form.requestInvoice,
            notes: form.notes.trim() || undefined,
          },
        },
        brandSlug
      );
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your request. Please call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
          Quote request sent
        </h3>
        <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300">
          Thanks — we&apos;ll respond within 24 hours with a tailored quote
          {form.requestInvoice ? " and invoice details" : ""}.
        </p>
        <Button
          className="mt-6"
          onClick={() => setSubmitted(false)}
          type="button"
          variant="outline"
        >
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6" id="catering-quote" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required>
          <Input onChange={(e) => update("name", e.target.value)} required value={form.name} />
        </Field>
        <Field label="Email" required>
          <Input
            onChange={(e) => update("email", e.target.value)}
            required
            type="email"
            value={form.email}
          />
        </Field>
        <Field label="Phone" required>
          <Input
            onChange={(e) => update("phone", e.target.value)}
            required
            type="tel"
            value={form.phone}
          />
        </Field>
        <Field label="Company (optional)">
          <Input onChange={(e) => update("company", e.target.value)} value={form.company} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Guest count" required>
          <Input
            max={500}
            min={10}
            onChange={(e) => update("guestCount", Number(e.target.value) || 10)}
            required
            type="number"
            value={form.guestCount}
          />
        </Field>
        <Field label={`Event date (${leadHours}h+ notice)`} required>
          <Input
            min={minDate}
            onChange={(e) => update("eventDate", e.target.value)}
            required
            type="date"
            value={form.eventDate}
          />
        </Field>
        <Field label="Event time" required>
          <Input
            onChange={(e) => update("eventTime", e.target.value)}
            required
            type="time"
            value={form.eventTime}
          />
        </Field>
      </div>

      <Field label="Delivery address" required>
        <Input
          onChange={(e) => update("deliveryAddress", e.target.value)}
          placeholder="Street, suburb, postcode"
          required
          value={form.deliveryAddress}
        />
      </Field>

      <Field label="Dietary requirements & menu notes">
        <Textarea
          onChange={(e) => update("dietaryNotes", e.target.value)}
          placeholder="e.g. 3 vegetarian, 1 gluten-free, nut allergy..."
          rows={3}
          value={form.dietaryNotes}
        />
      </Field>

      <Field label="Anything else we should know?">
        <Textarea
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Setup time, parking access, corporate PO number..."
          rows={2}
          value={form.notes}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          checked={form.requestInvoice}
          className="h-4 w-4 rounded border-zinc-300 accent-[color:var(--brand-accent,#d81b60)]"
          onChange={(e) => update("requestInvoice", e.target.checked)}
          type="checkbox"
        />
        Request a tax invoice for corporate billing
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <Button
        className="h-12 w-full rounded-xl bg-[color:var(--brand-accent,#d81b60)] uppercase tracking-[0.12em] hover:brightness-110 sm:w-auto sm:px-10"
        disabled={isSubmitting}
        type="submit"
      >
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Sending…" : "Send Quote Request"}
      </Button>
      <p className="text-xs text-zinc-500">
        We&apos;ll confirm availability and pricing within 24 hours.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}
