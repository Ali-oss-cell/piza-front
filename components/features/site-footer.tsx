"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { formatOpeningHoursLines } from "@/lib/opening-hours";
import { BENNY_BOYS_ADDRESS, BENNY_BOYS_NAME, BENNY_BOYS_TAGLINE } from "@/types/brand";

interface SiteFooterProps {
  brandName?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  tagline?: string | null;
  address?: string | null;
  deliveryFee?: string;
  openingHours?: unknown;
}

const FALLBACK_HOURS = ["Mon — Fri: 5pm – 11pm", "Sat — Sun: 12pm – 12am"];

const FOOTER_LINKS = {
  order: [
    { label: "Menu", href: "/menu" },
    { label: "Deals", href: "/deals" },
    { label: "Catering", href: "/catering" },
    { label: "Delivery", href: "/delivery" },
    { label: "Track Order", href: "/track-order" },
  ],
  help: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Allergens", href: "/allergens" },
    { label: "Nutrition", href: "/nutrition" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Reviews", href: "/reviews" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Functions", href: "/functions" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

export function SiteFooter({
  brandName = BENNY_BOYS_NAME,
  logoUrl = null,
  logoDarkUrl = null,
  tagline = BENNY_BOYS_TAGLINE,
  address = BENNY_BOYS_ADDRESS,
  deliveryFee = "5",
  openingHours = null,
}: SiteFooterProps): React.ReactElement {
  const hasLogo = Boolean(logoUrl || logoDarkUrl);
  const resolvedTagline = tagline?.trim() || BENNY_BOYS_TAGLINE;
  const resolvedAddress = address?.trim() || BENNY_BOYS_ADDRESS;
  const hourLines = formatOpeningHoursLines(openingHours);
  const displayHours = hourLines.length > 0 ? hourLines : FALLBACK_HOURS;

  return (
    <footer className="w-full border-t border-zinc-200/70 bg-zinc-50 px-margin-mobile py-16 transition-colors duration-150 ease-out dark:border-white/5 dark:bg-zinc-950 md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            {hasLogo ? (
              <div className="mb-6">
                <BrandLogo
                  brandName={brandName}
                  imageClassName="h-12 w-auto"
                  logoDarkUrl={logoDarkUrl}
                  logoUrl={logoUrl}
                />
              </div>
            ) : (
              <h2 className="mb-6 font-display text-headline-md font-bold uppercase tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
                {brandName}
              </h2>
            )}
            <p className="mb-4 max-w-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              {resolvedTagline}
            </p>
            <p className="whitespace-pre-line text-sm leading-loose text-zinc-600 dark:text-zinc-400">
              {resolvedAddress}
            </p>
            <p className="mt-4 font-bold text-[color:var(--brand-accent,#d81b60)]">
              ${deliveryFee} Flat Delivery
            </p>
          </div>

          <FooterColumn links={FOOTER_LINKS.order} title="Order" />
          <FooterColumn links={FOOTER_LINKS.help} title="Help" />
          <FooterColumn links={FOOTER_LINKS.company} title="Company" />
          <div>
            <FooterColumn links={FOOTER_LINKS.legal} title="Legal" />
            <h4 className="mb-4 mt-8 text-label-md uppercase tracking-widest text-zinc-950 dark:text-white">
              Hours
            </h4>
            <p className="leading-loose text-zinc-600 dark:text-zinc-400">
              {displayHours.map((line) => (
                <span className="block text-sm" key={line}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}): React.ReactElement {
  return (
    <div>
      <h4 className="mb-4 text-label-md uppercase tracking-widest text-zinc-950 dark:text-white">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="text-sm text-zinc-600 transition-colors hover:text-[color:var(--brand-accent,#d81b60)] dark:text-zinc-400"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
