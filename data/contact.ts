import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { BENNY_BOYS_ADDRESS } from "@/types/brand";

export const contactHero = {
  eyebrow: "Contact",
  title: "We'd Love to Hear From You",
  subtitle:
    "Questions about an order, catering, careers, or anything else — send a message or reach us directly.",
};

export interface ContactChannel {
  title: string;
  detail: string;
  icon: LucideIcon;
  href: string;
  /** When set, render as an external/tel link instead of Next Link to an internal path. */
  external?: boolean;
}

export function buildContactChannels(input: {
  address?: string | null;
  phone?: string | null;
  phoneHref?: string | null;
}): ContactChannel[] {
  const address = input.address?.trim() || BENNY_BOYS_ADDRESS;
  const phone = input.phone?.trim();
  const phoneHref = input.phoneHref?.trim();

  return [
    {
      title: "Visit us",
      detail: address,
      icon: MapPin,
      href: "/locations",
    },
    phone && phoneHref
      ? {
          title: "Call",
          detail: phone,
          icon: Phone,
          href: phoneHref,
          external: true,
        }
      : {
          title: "Call",
          detail: "Phone number coming soon — visit us or use the form below",
          icon: Phone,
          href: "/locations",
        },
    {
      title: "Email",
      detail: "Use the form — we reply within one business day",
      icon: Mail,
      href: "#contact-form",
    },
  ];
}

/** @deprecated Prefer buildContactChannels with live store settings. */
export const contactChannels = buildContactChannels({});
