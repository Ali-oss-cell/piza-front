"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { Button } from "@/components/ui/button";
import { craftPillars } from "@/data/about";
import { pizzaImages } from "@/data/images";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

function useReveal<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  visible: boolean;
} {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

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

function SignatureTile({ item }: { item: MenuItem }): React.ReactElement {
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
    [menuItems]
  );

  const heroLine =
    tagline?.trim() ||
    (brandName ? `${brandName}.` : "Fire. Dough. Family.");

  return (
    <main className="bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 md:pb-24">
        <div className="absolute inset-0">
          <Image
            alt=""
            className="object-cover brightness-[0.55] contrast-[1.08] saturate-[0.85]"
            fill
            priority
            sizes="100vw"
            src={heroSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
        </div>
        <div className="relative z-[1] mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
            {brandName}
          </p>
          <h1 className="max-w-4xl font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-[72px] lg:text-[88px]">
            {heroLine}
          </h1>
          <div className="mt-8">
            <Button
              asChild
              className="rounded-full border border-white/40 bg-transparent px-8 text-white hover:bg-white/10"
              variant="outline"
            >
              <Link href="/menu">Explore the menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story blocks */}
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

      {/* Signature dishes */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-36">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Signature
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold md:text-5xl">
            Dishes worth a second look
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {(signatures.length > 0
            ? signatures
            : menuItems.slice(0, 3)
          ).map((item) => (
            <SignatureTile item={item} key={item.id} />
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="border-y border-white/10 px-margin-mobile py-16 md:px-margin-desktop md:py-28">
        <div className="mx-auto grid max-w-container-max gap-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Reveal key={stat.label}>
              <p className="font-display text-5xl font-bold tracking-tight md:text-7xl lg:text-[88px]">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Marquee quotes */}
      <section className="overflow-hidden py-16 md:py-24">
        <div className="flex w-max animate-[portfolio-marquee_40s_linear_infinite] gap-16 px-8">
          {[...QUOTES, ...QUOTES].map((quote, index) => (
            <p
              className="max-w-md shrink-0 font-display text-2xl font-medium text-white/70 md:text-3xl"
              key={`${quote}-${index}`}
            >
              “{quote}”
            </p>
          ))}
        </div>
      </section>

      {/* Location teaser */}
      <section className="px-margin-mobile py-16 md:px-margin-desktop md:py-28">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
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
          </div>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden md:min-h-[70vh]">
        <div className="absolute inset-0">
          <Image
            alt=""
            className="object-cover brightness-[0.4] contrast-[1.05]"
            fill
            sizes="100vw"
            src={heroSrc}
          />
        </div>
        <div className="relative z-[1] px-6 text-center">
          <h2 className="font-display text-4xl font-bold md:text-6xl lg:text-7xl">
            Hungry yet?
          </h2>
          <Button asChild className="mt-8 rounded-full px-10" size="lg" variant="pill">
            <Link href="/menu">Order now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function Reveal({ children }: { children: React.ReactNode }): React.ReactElement {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      className={cn(
        "transition duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
      ref={ref}
    >
      {children}
    </div>
  );
}

function StoryBlock({
  title,
  body,
  imageUrl,
  imageAlt,
  reverse,
}: {
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  reverse: boolean;
}): React.ReactElement {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      className={cn(
        "grid items-center gap-8 px-margin-mobile py-16 md:gap-12 md:px-margin-desktop md:py-36 lg:grid-cols-2",
        reverse && "lg:[&>*:first-child]:order-2"
      )}
      ref={ref}
    >
      <div
        className={cn(
          "relative h-[60vh] overflow-hidden rounded-sm bg-zinc-900 md:h-[80vh] transition duration-700",
          visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}
      >
        <Image
          alt={imageAlt}
          className="object-cover brightness-[0.9] contrast-[1.05] saturate-[0.9]"
          fill
          sizes="(max-width: 1024px) 100vw, 55vw"
          src={imageUrl}
        />
      </div>
      <div
        className={cn(
          "max-w-md transition duration-700 delay-150",
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        )}
      >
        <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg md:leading-[1.7]">
          {body}
        </p>
      </div>
    </section>
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
    [menuItems]
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
          Browse the craft — tap any dish to order. Prices and options live on the
          item page.
        </p>
      </div>
      <div className="mx-auto grid max-w-container-max gap-4 px-margin-mobile pb-24 sm:grid-cols-2 md:gap-6 md:px-margin-desktop lg:grid-cols-3">
        {items.map((item) => (
          <SignatureTile item={item} key={item.id} />
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
