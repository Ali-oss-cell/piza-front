"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media-url";
import { PLATFORM_ACCENT } from "@/lib/store-theme";
import {
  BENNY_BOYS_HERO_LINE_1,
  BENNY_BOYS_HERO_LINE_2,
  BENNY_BOYS_TAGLINE,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";

const DEFAULT_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvLbch0jQ5PYw35jNjOwWrBuRd7eU_GlrTVGHvtPk_llIBerZFSgY2-RGO1dkxZpRa0FX5hKSYfkpRZWQRQksuFZZNgBNXgziC80aEEXAonKXkXEUYm4mwhAe2yXLjnYzXeQco1l4G3bHIp2nG1Qx7a-toviugVlrlrKmuQ3TJCB6mWpuKtKNdc6U62q70HyfIP3rarjnJI9-VWRee5BI3XwPb_CVeEzmfQrbaLax7OCoHPN4g82XSYhXqCFl6xZSnspMSAzb2QnU";

interface HeroSectionProps {
  onOpenCart: () => void;
  brandName?: string;
  brandSlug?: string;
  tagline?: string;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  primaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
}

export function HeroSection({
  onOpenCart,
  brandSlug,
  tagline,
  heroImageUrl,
  heroImageDarkUrl,
  primaryColor,
  backgroundLightColor,
  backgroundDarkColor,
}: HeroSectionProps): React.ReactElement {
  const { resolvedTheme } = useTheme();
  const slug = brandSlug?.toLowerCase() ?? DEFAULT_BRAND_SLUG;
  const isBennyBoys = slug.includes("benny") || slug.includes("bunny");

  const brandPrimary = primaryColor?.trim() || PLATFORM_ACCENT;
  const bgLight = backgroundLightColor?.trim() || "#ffffff";
  const bgDark = backgroundDarkColor?.trim() || "#000000";

  const lightHero = resolveMediaUrl(heroImageUrl) ?? DEFAULT_HERO;
  const darkHero =
    resolveMediaUrl(heroImageDarkUrl) ?? resolveMediaUrl(heroImageUrl) ?? DEFAULT_HERO;
  const isDark = resolvedTheme === "dark";
  const heroSrc = isDark ? darkHero : lightHero;

  const heroStyle = {
    "--brand-primary": brandPrimary,
    "--brand-accent": brandPrimary,
    "--brand-bg-light": bgLight,
    "--brand-bg-dark": bgDark,
  } as React.CSSProperties;

  const subtitle =
    tagline?.trim() ||
    (isBennyBoys
      ? `${BENNY_BOYS_TAGLINE} — order pickup & delivery online.`
      : "Artisanal sourdough foundations, heritage recipes, and contemporary culinary precision delivered to your urban doorstep.");

  return (
    <section
      className="relative flex min-h-[85vh] items-center overflow-hidden px-margin-mobile transition-colors duration-150 ease-out md:px-margin-desktop"
      style={heroStyle}
    >
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full scale-105 object-cover opacity-60"
          src={heroSrc}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r transition-colors duration-150 ease-out md:bg-gradient-to-r"
          style={{
            backgroundImage: isDark
              ? `linear-gradient(to right, ${bgDark}, ${bgDark}cc, transparent)`
              : `linear-gradient(to right, ${bgLight}, ${bgLight}cc, transparent)`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-container-max">
        <div className="max-w-2xl space-y-8">
          <h1 className="font-display text-headline-xl leading-none tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
            {isBennyBoys ? (
              <>
                {BENNY_BOYS_HERO_LINE_1} <br />
                <span className="text-[color:var(--brand-accent)]">{BENNY_BOYS_HERO_LINE_2}</span>
              </>
            ) : (
              <>
                PIZZA & <br />
                PASTA <span className="text-[color:var(--brand-accent)]">REFINED.</span>
              </>
            )}
          </h1>
          <p className="max-w-lg text-body-lg text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-300">
            {subtitle}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button className="uppercase tracking-[0.15em]" onClick={onOpenCart}>
              Order Online
            </Button>
            <Button
              asChild
              className="uppercase tracking-[0.15em] border-[color:var(--brand-accent)] text-[color:var(--brand-accent)] hover:bg-[color:var(--brand-accent)] hover:text-white dark:border-[color:var(--brand-accent)] dark:text-[color:var(--brand-accent)] dark:hover:bg-[color:var(--brand-accent)] dark:hover:text-white"
              variant="outline"
            >
              <Link href="/deals">View Specials</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
