"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { aboutHero } from "@/data/about";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { Button } from "@/components/ui/button";
import { useSeoContent } from "@/hooks/useSeoContent";
import { resolveMediaUrl } from "@/lib/media-url";

function plainTextFromHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function AboutHero(): React.ReactElement {
  const { sections } = useSeoContent("about");

  const title = sections.hero_h1 || aboutHero.title;
  const rawSubtitle = sections.hero_body || aboutHero.subtitle;
  const subtitle = sections.hero_body ? plainTextFromHtml(rawSubtitle) : rawSubtitle;
  const imageSrc =
    (sections.hero_image && resolveMediaUrl(sections.hero_image)) ||
    aboutHero.imageUrl;

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <Image
        alt={aboutHero.imageAlt}
        className="object-cover object-center saturate-[1.08]"
        fill
        priority
        sizes="100vw"
        src={imageSrc}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-end px-4 pb-16 pt-32 md:px-8 md:pb-20 lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--brand-accent,#d81b60)]">
            {aboutHero.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-[color:var(--brand-accent,#d81b60)]" />
              {aboutHero.locationBadge}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-200 md:text-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              className="h-12 rounded-xl bg-[color:var(--brand-accent,#d81b60)] px-8 uppercase tracking-[0.14em] hover:brightness-110"
            >
              <Link href={ORDER_ONLINE_HREF}>View Menu</Link>
            </Button>
            <Button
              asChild
              className="h-12 rounded-xl border-white/30 bg-white/10 px-8 uppercase tracking-[0.14em] text-white backdrop-blur-sm hover:bg-white/20"
              variant="outline"
            >
              <Link href={ORDER_ONLINE_HREF}>Order Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
