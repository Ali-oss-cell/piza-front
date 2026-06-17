"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  MapPin,
  Pencil,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-context";
import { buildTimeSlots, formatScheduledAt } from "@/lib/opening-hours";
import { createOrder, toApiDeliveryMode } from "@/lib/orders-api";
import {
  brandPink,
  cardShell,
  primaryText,
  secondaryText,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { StoreSettings } from "@/types/store";
import {
  EMPTY_CHECKOUT_ADDRESS,
  EMPTY_CHECKOUT_DETAILS,
  type CheckoutFormState,
} from "@/types/checkout";

interface CheckoutPageProps {
  settings: StoreSettings;
}

function sizeLabel(size?: string): string {
  if (!size) {
    return "";
  }

  if (size === "S") {
    return "Small";
  }

  if (size === "L") {
    return "Large";
  }

  if (size === "F") {
    return "Family";
  }

  return size;
}

export function CheckoutPage({ settings }: CheckoutPageProps): React.ReactElement {
  const router = useRouter();
  const { user, token, isAuthReady } = useAuth();
  const {
    items,
    deliveryMode,
    deliveryFee,
    isCartReady,
    setCartOpen,
    clearCart,
  } = useCart();

  const [form, setForm] = useState<CheckoutFormState>({
    details: EMPTY_CHECKOUT_DETAILS,
    address: EMPTY_CHECKOUT_ADDRESS,
    scheduledAt: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeSlots = useMemo(
    () => buildTimeSlots(settings.openingHours),
    [settings.openingHours],
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFeeAmount = deliveryMode === "delivery" ? deliveryFee : 0;
  const total = subtotal + deliveryFeeAmount;
  const minOrderAmount = Number(settings.minOrderAmount);
  const belowMinimum = subtotal < minOrderAmount;

  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    if (items.length === 0) {
      router.replace("/");
    }
  }, [isCartReady, items.length, router]);

  useEffect(() => {
    if (!isAuthReady || !user) {
      return;
    }

    setForm((current) => ({
      ...current,
      details: {
        guestName: `${user.firstName} ${user.lastName}`.trim(),
        guestEmail: user.email,
        guestPhone: current.details.guestPhone,
      },
    }));
  }, [isAuthReady, user]);

  useEffect(() => {
    if (!form.scheduledAt && timeSlots[0]) {
      setForm((current) => ({ ...current, scheduledAt: timeSlots[0].value }));
    }
  }, [form.scheduledAt, timeSlots]);

  async function handleSubmit(): Promise<void> {
    setError(null);

    if (!form.scheduledAt) {
      setError("Please choose a pickup or delivery time.");
      return;
    }

    if (!form.details.guestName.trim() || !form.details.guestEmail.trim()) {
      setError("Please add your name and email.");
      return;
    }

    if (!form.details.guestPhone.trim()) {
      setError("Please add your phone number.");
      return;
    }

    if (
      deliveryMode === "delivery" &&
      (!form.address.deliveryAddressLine1.trim() ||
        !form.address.deliverySuburb.trim() ||
        !form.address.deliveryPostcode.trim())
    ) {
      setError("Please add your delivery address.");
      return;
    }

    if (belowMinimum) {
      setError(`Minimum order is $${minOrderAmount.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);

    try {
      const order = await createOrder(
        {
          deliveryMode: toApiDeliveryMode(deliveryMode),
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            crust: item.crust,
            toppings: item.toppings,
            removedIngredients: item.removedIngredients,
          })),
          guestName: form.details.guestName.trim(),
          guestEmail: form.details.guestEmail.trim(),
          guestPhone: form.details.guestPhone.trim(),
          deliveryAddressLine1:
            deliveryMode === "delivery"
              ? form.address.deliveryAddressLine1.trim()
              : undefined,
          deliveryAddressLine2:
            deliveryMode === "delivery"
              ? form.address.deliveryAddressLine2.trim() || undefined
              : undefined,
          deliverySuburb:
            deliveryMode === "delivery"
              ? form.address.deliverySuburb.trim()
              : undefined,
          deliveryState:
            deliveryMode === "delivery"
              ? form.address.deliveryState.trim() || "VIC"
              : undefined,
          deliveryPostcode:
            deliveryMode === "delivery"
              ? form.address.deliveryPostcode.trim()
              : undefined,
          scheduledAt: form.scheduledAt,
          notes: form.notes.trim() || undefined,
          subtotal,
          deliveryFee: deliveryFeeAmount,
          total,
        },
        token ?? undefined,
      );

      clearCart();
      router.push(`/checkout/confirmation?orderId=${order.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isCartReady || items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className={secondaryText}>Loading checkout…</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-28">
      <div className="mb-8">
        <h1 className={cn("font-display text-headline-lg", primaryText)}>
          Secure Checkout
        </h1>
        <p className={cn("mt-2 text-sm", secondaryText)}>
          {deliveryMode === "delivery" ? "Delivery" : "Pickup"} ·{" "}
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section className={cn("p-6", cardShell)}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d81b60]/10 text-[#d81b60]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className={cn("font-semibold", primaryText)}>Your details</h2>
                <p className={cn("text-sm", secondaryText)}>
                  Name, email, and phone so we can reach you.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="guestName">Full name</Label>
                <Input
                  id="guestName"
                  value={form.details.guestName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      details: { ...current.details, guestName: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={form.details.guestEmail}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      details: { ...current.details, guestEmail: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Phone</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={form.details.guestPhone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      details: { ...current.details, guestPhone: event.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </section>

          <section className={cn("p-6", cardShell)}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d81b60]/10 text-[#d81b60]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h2 className={cn("font-semibold", primaryText)}>
                  {deliveryMode === "delivery" ? "Delivery time" : "Pickup time"}
                </h2>
                <p className={cn("text-sm", secondaryText)}>
                  Choose when you want your order ready.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & time</Label>
              <select
                className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-zinc-950"
                id="scheduledAt"
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
              >
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              {form.scheduledAt ? (
                <p className={cn("text-sm", brandPink)}>
                  Selected: {formatScheduledAt(form.scheduledAt)}
                </p>
              ) : null}
            </div>
          </section>

          {deliveryMode === "delivery" ? (
            <section className={cn("p-6", cardShell)}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d81b60]/10 text-[#d81b60]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={cn("font-semibold", primaryText)}>
                    Delivery address
                  </h2>
                  <p className={cn("text-sm", secondaryText)}>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine1">Street address</Label>
                  <Input
                    id="addressLine1"
                    value={form.address.deliveryAddressLine1}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: {
                          ...current.address,
                          deliveryAddressLine1: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine2">Unit / apartment (optional)</Label>
                  <Input
                    id="addressLine2"
                    value={form.address.deliveryAddressLine2}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: {
                          ...current.address,
                          deliveryAddressLine2: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb</Label>
                  <Input
                    id="suburb"
                    value={form.address.deliverySuburb}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: {
                          ...current.address,
                          deliverySuburb: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={form.address.deliveryPostcode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: {
                          ...current.address,
                          deliveryPostcode: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className={cn("p-6", cardShell)}>
            <div className="space-y-2">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Gate code, allergies, delivery instructions…"
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </div>
          </section>
        </div>

        <aside className={cn("h-fit p-6 lg:sticky lg:top-28", cardShell)}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#d81b60]" />
              <h2 className={cn("font-semibold", primaryText)}>
                Order summary ({items.length})
              </h2>
            </div>
            <button
              className={cn("inline-flex items-center gap-1 text-sm font-medium", brandPink)}
              type="button"
              onClick={() => setCartOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit order
            </button>
          </div>

          {form.scheduledAt ? (
            <p className={cn("mb-4 text-sm", secondaryText)}>
              {formatScheduledAt(form.scheduledAt)}
            </p>
          ) : null}

          <ul className="space-y-3 border-b border-zinc-200/70 pb-4 dark:border-white/10">
            {items.map((item) => (
              <li className="flex items-start justify-between gap-3" key={item.id}>
                <div>
                  <p className={cn("text-sm font-medium", primaryText)}>
                    {item.name}
                    {item.size ? ` (${sizeLabel(item.size)})` : ""} ×{item.quantity}
                  </p>
                  {item.description ? (
                    <p className={cn("text-xs", secondaryText)}>{item.description}</p>
                  ) : null}
                </div>
                <span className={cn("text-sm font-semibold", primaryText)}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 text-sm">
            <div className={cn("flex justify-between", secondaryText)}>
              <span>Subtotal</span>
              <span className={primaryText}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={cn("flex justify-between", secondaryText)}>
              <span>Delivery fee</span>
              <span className={primaryText}>${deliveryFeeAmount.toFixed(2)}</span>
            </div>
            <div
              className={cn(
                "flex justify-between border-t border-zinc-200/70 pt-3 text-base font-semibold dark:border-white/10",
                primaryText,
              )}
            >
              <span>Total</span>
              <span className={brandPink}>${total.toFixed(2)}</span>
            </div>
          </div>

          {belowMinimum ? (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              Minimum order is ${minOrderAmount.toFixed(2)}.
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          ) : null}

          <Button
            className="mt-6 w-full py-5 uppercase tracking-widest"
            disabled={submitting || belowMinimum}
            onClick={() => void handleSubmit()}
          >
            {submitting ? "Placing order…" : "Place order"}
          </Button>

          <p className={cn("mt-4 text-center text-xs", secondaryText)}>
            Pay on pickup or delivery for now. Card payments coming soon.
          </p>
        </aside>
      </div>
    </main>
  );
}
