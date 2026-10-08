"use client";

import Link from "next/link";
import { ArrowRight, Bike, Clock, MapPin, Phone, Pizza, ShoppingBag, Sparkles } from "lucide-react";
import { MenuCard } from "@/components/features/menu-card";
import { formatMoneyShort } from "@/components/features/storefront/store-info-chips";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { useMinuteClock } from "@/hooks/use-minute-clock";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { describeOpenStatus, formatOpeningHoursLines } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";
import type { AddToCartPayload, MenuItem } from "@/types/menu";

const sectionClassName = "mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop";
const accent = "text-[color:var(--brand-accent,#d81b60)]";

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div className="max-w-2xl">
        <p className={cn("text-xs font-bold uppercase tracking-[0.22em]", accent)}>{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function formatPrice(price: number): string {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

/* ------------------------------------------------------------------ deals */

export function DealsShowcase({
  deals,
  brandSlug,
}: {
  deals: MenuItem[];
  brandSlug?: string;
}): React.ReactElement | null {
  if (deals.length === 0) {
    return null;
  }

  return (
    <MotionReveal as="section" className={cn(sectionClassName, "py-14 md:py-20")} id="deals">
      <SectionHeading
        action={
          <Link
            className={cn("inline-flex items-center gap-1.5 text-sm font-semibold hover:underline", accent)}
            href="/deals"
          >
            All deals <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }
        description="Bundles built for one, two or the whole family — the best value on the menu."
        eyebrow="Deals"
        title="Feed everyone for less"
      />
      {/* Swipe row on phones, grid from tablet up. */}
      <ul className="-mx-margin-mobile flex snap-x snap-mandatory gap-4 overflow-x-auto px-margin-mobile pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
        {deals.map((deal) => {
          const src = resolveMediaUrl(deal.imageUrl) ?? deal.imageUrl;
          return (
            <li className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto" key={deal.id}>
              {/* Same destination as the menu card: the deal's own page to choose pizzas. */}
              <Link
                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand-accent,#d81b60)]/40 hover:shadow-lg dark:border-white/[0.08] dark:bg-zinc-900/60"
                href={isNextOrderOrderingEnabled() ? ORDER_ONLINE_HREF : `/menu/${deal.id}`}
              >
                <span className="relative block aspect-square w-full bg-[color:var(--brand-accent,#d81b60)]/10">
                  {src ? (
                    <SmartImage
                      alt={deal.imageAlt || deal.name}
                      blurHash={deal.imageBlurHash}
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                      fill
                      frameClassName="absolute inset-0"
                      sizes="(max-width: 768px) 80vw, 25vw"
                      src={src}
                    />
                  ) : (
                    <Pizza aria-hidden className={cn("absolute inset-0 m-auto h-12 w-12", accent)} />
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-zinc-950 dark:text-white">{deal.name}</span>
                    <span className="shrink-0 font-bold text-zinc-950 dark:text-white">
                      {formatPrice(deal.price)}
                    </span>
                  </span>
                  <span className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {getMenuDisplayDescription(deal, brandSlug)}
                  </span>
                  <span className={cn("mt-auto pt-2 text-xs font-bold uppercase tracking-[0.16em]", accent)}>
                    Order this deal →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </MotionReveal>
  );
}

/* --------------------------------------------------------- popular picks */

/** Signature items first, then the first pictured pizzas, so the section is never empty. */
export function pickPopularItems(items: MenuItem[], limit = 6): MenuItem[] {
  const candidates = items.filter((item) => item.category !== "deals" && item.imageUrl);
  const signature = candidates.filter((item) => item.badges?.includes("SIGNATURE"));
  const rest = candidates.filter((item) => !item.badges?.includes("SIGNATURE"));
  return [...signature, ...rest].slice(0, limit);
}

export function PopularPicks({
  items,
  brandSlug,
  onAddToCart,
  onBrowseMenu,
}: {
  items: MenuItem[];
  brandSlug?: string;
  onAddToCart: (payload: AddToCartPayload) => void;
  onBrowseMenu: () => void;
}): React.ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <MotionReveal as="section" className={cn(sectionClassName, "py-14 md:py-20")} id="popular">
      <SectionHeading
        action={
          <Button onClick={onBrowseMenu} type="button" variant="outline">
            Full menu
          </Button>
        }
        description="The pizzas our regulars order again and again."
        eyebrow="Fan favourites"
        title="Most loved"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {items.map((item) => (
          <MenuCard brandSlug={brandSlug} item={item} key={item.id} onAddToCart={onAddToCart} />
        ))}
      </div>
    </MotionReveal>
  );
}

/* ---------------------------------------------------------- how it works */

const STEPS = [
  {
    icon: Pizza,
    title: "Pick your favourites",
    body: "Choose a deal or build your pizza — size, crust and extras your way.",
  },
  {
    icon: Sparkles,
    title: "Pay securely online",
    body: "Checkout takes a minute. Pick a time that suits you.",
  },
  {
    icon: ShoppingBag,
    title: "Pickup or delivery",
    body: "Made fresh to order and ready when you are, at the counter or your door.",
  },
] as const;

export function HowItWorks(): React.ReactElement {
  return (
    <MotionReveal as="section" className="border-y border-zinc-200/70 bg-zinc-50 py-14 dark:border-white/[0.06] dark:bg-zinc-950/60 md:py-20">
      <div className={sectionClassName}>
        <SectionHeading eyebrow="Ordering online" title="Hot pizza in three steps" />
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <li
              className="relative rounded-2xl border border-zinc-200/70 bg-white p-6 dark:border-white/[0.08] dark:bg-zinc-900/60"
              key={step.title}
            >
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-zinc-100 dark:text-white/[0.06]">
                {index + 1}
              </span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--brand-accent,#d81b60)]/10">
                <step.icon aria-hidden className={cn("h-5 w-5", accent)} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </MotionReveal>
  );
}

/* --------------------------------------------------------------- visit us */

export function VisitUs({
  brandName,
  address,
  openingHours,
  contactPhone,
  deliveryFee,
  minOrderAmount,
}: {
  brandName?: string;
  address?: string | null;
  openingHours?: unknown;
  contactPhone?: string | null;
  deliveryFee?: string | number | null;
  minOrderAmount?: string | number | null;
}): React.ReactElement | null {
  const now = useMinuteClock();
  const status = now ? describeOpenStatus(openingHours, now) : null;
  const hourLines = formatOpeningHoursLines(openingHours);
  const fee = formatMoneyShort(deliveryFee);
  const minimum = formatMoneyShort(minOrderAmount);

  if (!address && hourLines.length === 0 && !contactPhone) {
    return null;
  }

  const mapsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        brandName ? `${brandName} ${address}` : address,
      )}`
    : null;

  return (
    <MotionReveal as="section" className={cn(sectionClassName, "py-14 md:py-20")} id="visit">
      <SectionHeading eyebrow="Find us" title="Pickup, delivery & opening hours" />
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 dark:border-white/[0.08] dark:bg-zinc-900/60">
          <MapPin aria-hidden className={cn("h-5 w-5", accent)} />
          <h3 className="mt-3 font-semibold text-zinc-950 dark:text-white">Store</h3>
          {address ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{address}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {mapsHref ? (
              <Button asChild variant="outline">
                <a href={mapsHref} rel="noopener noreferrer" target="_blank">
                  Directions
                </a>
              </Button>
            ) : null}
            {contactPhone ? (
              <Button asChild variant="outline">
                <a href={`tel:${contactPhone.replace(/\s+/g, "")}`}>
                  <Phone aria-hidden className="mr-2 h-4 w-4" />
                  {contactPhone}
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 dark:border-white/[0.08] dark:bg-zinc-900/60">
          <Clock aria-hidden className={cn("h-5 w-5", accent)} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-zinc-950 dark:text-white">Opening hours</h3>
            {status ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  status.isOpen
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                )}
              >
                {status.label}
              </span>
            ) : null}
          </div>
          {hourLines.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {hourLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Call us for today&apos;s hours.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 dark:border-white/[0.08] dark:bg-zinc-900/60">
          <Bike aria-hidden className={cn("h-5 w-5", accent)} />
          <h3 className="mt-3 font-semibold text-zinc-950 dark:text-white">Pickup & delivery</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Pickup — free, ready at the counter</li>
            {fee ? <li>Delivery — {fee} flat fee</li> : <li>Delivery available in our local area</li>}
            {minimum ? <li>Minimum order — {minimum}</li> : null}
          </ul>
          <Link
            className={cn("mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline", accent)}
            href="/delivery"
          >
            Delivery areas <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MotionReveal>
  );
}

/* ------------------------------------------------------------- final CTA */

export function OrderCta({
  orderHref,
  onOrder,
}: {
  orderHref?: string;
  onOrder?: () => void;
}): React.ReactElement {
  return (
    <MotionReveal as="section" className={cn(sectionClassName, "pb-16 md:pb-24")}>
      <div className="relative overflow-hidden rounded-3xl bg-[color:var(--brand-accent,#d81b60)] px-6 py-12 text-center text-white md:px-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Hungry? We&apos;re ready.</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          Order online in a minute — pickup or delivery, made fresh to order.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {orderHref ? (
            <Button asChild className="bg-white text-zinc-950 hover:bg-white/90" size="lg">
              <Link href={orderHref}>Start your order</Link>
            </Button>
          ) : (
            <Button className="bg-white text-zinc-950 hover:bg-white/90" onClick={onOrder} size="lg" type="button">
              Start your order
            </Button>
          )}
          <Button
            asChild
            className="border-white/60 text-white hover:bg-white/10 dark:border-white/60"
            size="lg"
            variant="outline"
          >
            <Link href="/deals">See deals</Link>
          </Button>
        </div>
      </div>
    </MotionReveal>
  );
}
