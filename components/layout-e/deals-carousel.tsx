"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/layout-e/motion-tokens";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatCurrency } from "@/lib/pricing";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import type { MenuItem } from "@/types/menu";

function itemHref(item: MenuItem): string {
  return isNextOrderOrderingEnabled() ? ORDER_ONLINE_HREF : `/menu/${item.id}`;
}

export function DealsCarousel({
  items,
}: {
  items: MenuItem[];
}): React.ReactElement {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: items.length > 2,
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    if (!emblaApi || items.length < 3 || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, 3800);
    return () => window.clearInterval(id);
  }, [emblaApi, items.length]);

  return (
    <div className="cursor-grab active:cursor-grabbing" ref={emblaRef}>
      <div className="flex gap-4 md:gap-5">
        {items.map((item) => {
          const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
          return (
            <Link
              className="group relative block w-[260px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-zinc-900/50 sm:w-[320px]"
              href={itemHref(item)}
              key={item.id}
            >
              <div className="relative h-[200px] w-full bg-zinc-100 dark:bg-zinc-800 sm:h-[260px]">
                <Image
                  alt={item.imageAlt}
                  className="object-cover brightness-[1.02] contrast-[1.05] transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="320px"
                  src={src}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-zinc-950/35 via-transparent to-transparent"
                />
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-base font-bold text-zinc-950 dark:text-white">
                  {item.name}
                </p>
                <p className="mt-1 text-base font-semibold text-[color:var(--brand-accent,#d81b60)]">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
