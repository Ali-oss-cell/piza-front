import {
  INSTANT_CHECKOUT_MAX,
  LARGE_EVENT_GUEST_THRESHOLD,
  MIN_LEAD_HOURS,
  MIN_LEAD_HOURS_LARGE,
} from "@/data/catering";
import type { BulkMenuItem, CateringPackage, CateringQuoteFormData } from "@/types/catering";
import type { MenuItem } from "@/types/menu";

export function packageEligibleForInstantCheckout(pkg: CateringPackage): boolean {
  return pkg.totalPrice <= INSTANT_CHECKOUT_MAX;
}

export function bulkLineTotal(item: BulkMenuItem, quantity: number): number {
  return Math.round(item.unitPrice * quantity * 100) / 100;
}

export function bulkEligibleForInstantCheckout(item: BulkMenuItem, quantity: number): boolean {
  return bulkLineTotal(item, quantity) <= INSTANT_CHECKOUT_MAX;
}

export function packageToMenuItem(pkg: CateringPackage): MenuItem {
  return {
    id: pkg.slug,
    slug: pkg.slug,
    number: 900,
    name: `Catering — ${pkg.name}`,
    description: `${pkg.guestRange}. ${pkg.items.join(" · ")}`,
    price: pkg.totalPrice,
    category: "catering",
    imageUrl: pkg.imageUrl,
    imageAlt: pkg.imageAlt,
    priceNote: `$${pkg.perPerson.toFixed(0)} / person`,
  };
}

export function bulkToMenuItem(item: BulkMenuItem, quantity: number): MenuItem {
  const total = bulkLineTotal(item, quantity);
  return {
    id: `${item.slug}-${quantity}`,
    slug: item.slug,
    number: 901,
    name: `Catering — ${item.name}`,
    description: `${quantity}× ${item.description}`,
    price: total,
    category: "catering",
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    priceNote: `$${item.unitPrice.toFixed(0)} each`,
  };
}

export function getMinimumLeadHours(guestCount: number): number {
  return guestCount >= LARGE_EVENT_GUEST_THRESHOLD ? MIN_LEAD_HOURS_LARGE : MIN_LEAD_HOURS;
}

export function getEarliestEventDate(guestCount: number): string {
  const hours = getMinimumLeadHours(guestCount);
  const earliest = new Date();
  earliest.setHours(earliest.getHours() + hours, 0, 0, 0);
  return earliest.toISOString().slice(0, 10);
}

export function isEventDateValid(eventDate: string, guestCount: number): boolean {
  if (!eventDate) {
    return false;
  }
  const selected = new Date(`${eventDate}T12:00:00`);
  const hours = getMinimumLeadHours(guestCount);
  const earliest = new Date();
  earliest.setHours(earliest.getHours() + hours);
  return selected >= earliest;
}

export function buildQuoteMailto(
  contactEmail: string,
  data: CateringQuoteFormData,
  storeName: string
): string {
  const subject = encodeURIComponent(`${storeName} catering quote request`);
  const body = encodeURIComponent(
    [
      `Catering quote request — ${storeName}`,
      "",
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      data.company ? `Company: ${data.company}` : null,
      `Guests: ${data.guestCount}`,
      `Event date: ${data.eventDate}`,
      `Event time: ${data.eventTime}`,
      `Delivery address: ${data.deliveryAddress}`,
      data.dietaryNotes ? `Dietary notes: ${data.dietaryNotes}` : null,
      data.notes ? `Additional notes: ${data.notes}` : null,
      `Request invoice: ${data.requestInvoice ? "Yes" : "No"}`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return `mailto:${contactEmail || "orders@marinapizzas.com.au"}?subject=${subject}&body=${body}`;
}
