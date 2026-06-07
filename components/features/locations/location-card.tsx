"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { LocationStatusBadge } from "@/components/features/locations/location-status-badge";
import { Button } from "@/components/ui/button";
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
  return (
    <article
      className={cn(
        "rounded-2xl border bg-white/70 p-6 backdrop-blur-md transition-all duration-150 ease-out hover:scale-[1.01] dark:bg-zinc-900/40",
        isActive
          ? "border-[#d81b60] shadow-lg shadow-[#d81b60]/15"
          : "border-zinc-200/60 hover:border-zinc-300/80 dark:border-white/10 dark:hover:border-white/20"
      )}
    >
      <button
        className="w-full text-left"
        onClick={() => onSelect(location.id)}
        type="button"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
            {location.name} — {location.suburb}
          </h2>
          <LocationStatusBadge isOpen={location.isOpen} />
        </div>

        <div className="space-y-3 text-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d81b60]" />
            {location.address}
          </p>
          <p className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-[#d81b60]" />
            {location.phone}
          </p>
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-[#d81b60]" />
            {location.email}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200/60 bg-zinc-50/80 p-4 transition-colors duration-150 ease-out dark:border-white/5 dark:bg-black/30">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Trading Hours
          </p>
          <div className="space-y-2">
            {location.tradingHours.map((entry) => (
              <div className="flex items-center justify-between text-sm" key={entry.label}>
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
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="flex-1 rounded-xl bg-[#d81b60] py-5 uppercase tracking-widest hover:bg-[#c2185b]"
          >
            <Link href="/">Order from this Store</Link>
          </Button>
          <Button
            asChild
            className="flex-1 rounded-xl border border-zinc-300 bg-transparent py-5 uppercase tracking-widest text-zinc-950 transition-colors duration-150 ease-out hover:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
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
