"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { LocationStatusBadge } from "@/components/features/locations/location-status-badge";
import { Button } from "@/components/ui/button";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/location";

interface LocationCardProps {
  location: Location;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function LocationCard({
  location,
  isActive,
  onSelect,
}: LocationCardProps): React.ReactElement {
  const showPhone = Boolean(location.phone.trim());
  const showEmail = Boolean(location.email.trim());

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border bg-white/70 p-5 backdrop-blur-md transition-all duration-150 ease-out dark:bg-zinc-900/40 sm:p-6",
        isActive
          ? "border-[color:var(--brand-accent,#d81b60)] shadow-lg shadow-[color:var(--brand-accent,#d81b60)]/15"
          : "border-zinc-200/60 hover:border-zinc-300/80 dark:border-white/10 dark:hover:border-white/20"
      )}
    >
      <button
        className="w-full min-w-0 text-left"
        onClick={() => onSelect(location.id)}
        type="button"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-lg font-bold leading-snug text-zinc-950 transition-colors duration-150 ease-out dark:text-white sm:text-xl">
            {location.name} — {location.suburb}
          </h2>
          <LocationStatusBadge isOpen={location.isOpen} />
        </div>

        <div className="space-y-3 text-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
          <p className="flex items-start gap-3 break-words">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-accent,#d81b60)]" />
            <span>{location.address}</span>
          </p>
          {showPhone ? (
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[color:var(--brand-accent,#d81b60)]" />
              <span>{location.phone}</span>
            </p>
          ) : null}
          {showEmail ? (
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[color:var(--brand-accent,#d81b60)]" />
              <span>{location.email}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200/60 bg-zinc-50/80 p-4 transition-colors duration-150 ease-out dark:border-white/5 dark:bg-black/30">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Trading Hours
          </p>
          <div className="space-y-2">
            {location.tradingHours.map((entry) => (
              <div
                className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                key={entry.label}
              >
                <span className="text-zinc-500">{entry.label}</span>
                <span className="text-zinc-700 transition-colors duration-150 ease-out dark:text-zinc-300">
                  {entry.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </button>

      {isActive ? (
        <div className="mt-5 flex flex-col gap-3">
          <Button
            asChild
            className="h-auto w-full rounded-xl bg-[color:var(--brand-accent,#d81b60)] px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:brightness-110"
          >
            <Link href={ORDER_ONLINE_HREF}>Order Online</Link>
          </Button>
          <Button
            asChild
            className="h-auto w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-950 transition-colors duration-150 ease-out hover:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
            variant="outline"
          >
            <a href={location.directionsUrl} rel="noopener noreferrer" target="_blank">
              Get Directions
            </a>
          </Button>
        </div>
      ) : null}
    </article>
  );
}
