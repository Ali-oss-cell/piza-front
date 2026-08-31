"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/lib/inquiries-api";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";
import type { InquiryType } from "@/types/inquiry";
import { cn } from "@/lib/utils";

interface InquiryFormProps {
  type: InquiryType;
  brandSlug?: string;
  subjectLabel?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  extraFields?: React.ReactNode;
  buildPayload?: () => Record<string, unknown> | undefined;
  validate?: () => string | null;
  className?: string;
}

export function InquiryForm({
  type,
  brandSlug = DEFAULT_BRAND_SLUG,
  subjectLabel = "Subject",
  messageLabel = "Message",
  messagePlaceholder = "How can we help?",
  submitLabel = "Send Message",
  extraFields,
  buildPayload,
  validate,
  className = "",
}: InquiryFormProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    const validationError = validate?.();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry(
        {
          type,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim() || undefined,
          message: message.trim(),
          payload: buildPayload?.(),
        },
        brandSlug
      );
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again or call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30",
          className
        )}
      >
        <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
          Message sent
        </h3>
        <p className="mt-2 text-emerald-800 dark:text-emerald-300">
          Thanks — we&apos;ll get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form className={cn("space-y-5", className)} onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inquiry-name">Name</Label>
          <Input
            id="inquiry-name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inquiry-email">Email</Label>
          <Input
            id="inquiry-email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inquiry-phone">Phone</Label>
          <Input
            id="inquiry-phone"
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            value={phone}
          />
        </div>
        {type === "CONTACT" || type === "CAREERS" ? (
          <div className="space-y-2">
            <Label htmlFor="inquiry-subject">{subjectLabel}</Label>
            <Input
              id="inquiry-subject"
              onChange={(event) => setSubject(event.target.value)}
              value={subject}
            />
          </div>
        ) : null}
      </div>
      {extraFields}
      <div className="space-y-2">
        <Label htmlFor="inquiry-message">{messageLabel}</Label>
        <Textarea
          id="inquiry-message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder={messagePlaceholder}
          required
          rows={5}
          value={message}
        />
      </div>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button className="gap-2" disabled={isSubmitting} type="submit">
        <Send className="h-4 w-4" />
        {isSubmitting ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
