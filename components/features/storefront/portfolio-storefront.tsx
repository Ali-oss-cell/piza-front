"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClosingCta } from "@/components/layout-e/closing-cta";
import { PortfolioHero } from "@/components/layout-e/hero";
import { NumbersStrip } from "@/components/layout-e/numbers-strip";
import { SignatureDishGrid } from "@/components/layout-e/signature-dish-grid";
import { StoryBlock } from "@/components/layout-e/story-block";
import { TestimonialMarquee } from "@/components/layout-e/testimonial-marquee";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { Button } from "@/components/ui/button";
import { craftPillars } from "@/data/about";
import { pizzaImages } from "@/data/images";
import { LenisProvider } from "@/lib/layout-e/lenis-provider";
import { cinematicTransition } from "@/lib/layout-e/motion-tokens";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import type { MenuItem } from "@/types/menu";

const STORY_BLOCKS = [
  {
    title: "Our dough rests 48 hours",
    body: "Slow fermentation builds flavour and a crust that stays light — never rushed.",
    image: pizzaImages[0],
  },
  {
    title: "Hot from the oven",
    body: "High heat, generous toppings, and the kind of cheese pull that belongs on a poster.",
    image: pizzaImages[2],
  },
  {
    title: "Family-run craft",
    body: craftPillars[0]?.description ?? "Classics done right, every busy night.",
    image: pizzaImages[1],
  },
];

const STATS = [
  { value: "12+", label: "Years" },
  { value: "40k+", label: "Pizzas" },
  { value: "3", label: "Locations" },
];

const QUOTES = [
  "The neighbourhood favourite — generous, consistent, always ready.",
  "Fire. Dough. Family. — the kind of pizza night you remember.",
  "Best cheese pull in Wantirna South.",
];

export function PortfolioStorefront({
  menuItems,
  brandName,
  tagline,
  heroImageUrl,
  address,
  variant = "home",
}: StorefrontProps): React.ReactElement {
  if (variant === "menu") {
    return <PortfolioLookbook menuItems={menuItems} brandName={brandName} />;
  }

  const heroSrc =
    resolveMediaUrl(heroImageUrl) ??
    heroImageUrl ??
    pizzaImages[2].imageUrl;

  const signatures = useMemo(
    () =>
      menuItems
        .filter((item) => item.category !== "deals")
        .sort((a, b) => a.number - b.number)
        .slice(0, 6),
    [menuItems],
  );

  const heroLine =
    tagline?.trim() ||
    (brandName ? `${brandName}.` : "Fire. Dough. Family.");

  const reduceMotion = useReducedMotion();

  return (
    <LenisProvider>
      <main className="bg-zinc-950 text-white">
        <PortfolioHero
          brandName={brandName}
          headline={heroLine}
          imageUrl={heroSrc}
        />

        {STORY_BLOCKS.map((block, index) => (
          <StoryBlock
            body={block.body}
            imageAlt={block.image.imageAlt}
            imageUrl={block.image.imageUrl}
            key={block.title}
            reverse={index % 2 === 1}
            title={block.title}
          />
        ))}

        <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-36">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            transition={cinematicTransition}
            viewport={{ once: true, amount: 0.4 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Signature
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-bold md:text-5xl">
              Dishes worth a second look
            </h2>
          </motion.div>
          <SignatureDishGrid
            items={
              signatures.length > 0 ? signatures : menuItems.slice(0, 3)
            }
          />
        </section>

        <NumbersStrip stats={STATS} />
        <TestimonialMarquee quotes={QUOTES} />

        <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-28">
          <motion.div
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            transition={cinematicTransition}
            viewport={{ once: true, amount: 0.3 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-zinc-900">
              <Image
                alt="Storefront"
                className="object-cover brightness-[0.9] saturate-[0.9]"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src={pizzaImages[3]?.imageUrl ?? heroSrc}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Find us
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
                {brandName}
              </h2>
              {address ? (
                <p className="mt-4 text-lg text-white/65">{address}</p>
              ) : (
                <p className="mt-4 text-lg text-white/65">
                  Pickup and delivery from our kitchen.
                </p>
              )}
              <Link
                className="mt-6 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-white underline-offset-4 hover:underline"
                href="/locations"
              >
                Locations →
              </Link>
            </div>
          </motion.div>
        </section>

        <ClosingCta imageUrl={heroSrc} />
      </main>
    </LenisProvider>
  );
}

function LookbookTile({ item }: { item: MenuItem }): React.ReactElement {
  const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const desc = getMenuDisplayDescription(item);

  return (
    <Link
      className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900"
      href={`/menu/${item.id}`}
    >
      <Image
        alt={item.imageAlt}
        className="object-cover brightness-[0.92] contrast-[1.05] saturate-[0.92] transition duration-700 group-hover:scale-105"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        src={src}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="font-display text-xl font-bold text-white">{item.name}</p>
        <p className="mt-1 line-clamp-1 text-sm text-white/70">{desc}</p>
      </div>
    </Link>
  );
}

function PortfolioLookbook({
  menuItems,
  brandName,
}: {
  menuItems: MenuItem[];
  brandName?: string;
}): React.ReactElement {
  const items = useMemo(
    () => [...menuItems].sort((a, b) => a.number - b.number),
    [menuItems],
  );

  return (
    <main className="bg-zinc-950 pt-24 text-white md:pt-28">
      <div className="mx-auto max-w-container-max px-margin-mobile pb-8 md:px-margin-desktop">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Lookbook
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-6xl">
          {brandName ? `${brandName} menu` : "Menu"}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/60 md:text-lg">
          Browse the craft — tap any dish to order. Prices and options live on
          the item page.
        </p>
      </div>
      <div className="mx-auto grid max-w-container-max gap-4 px-margin-mobile pb-24 sm:grid-cols-2 md:gap-6 md:px-margin-desktop lg:grid-cols-3">
        {items.map((item) => (
          <LookbookTile item={item} key={item.id} />
        ))}
      </div>
      <div className="border-t border-white/10 px-margin-mobile py-12 text-center md:px-margin-desktop">
        <Button asChild className="rounded-full px-10" variant="pill">
          <Link href="/checkout">Ready to checkout</Link>
        </Button>
      </div>
    </main>
  );
}
