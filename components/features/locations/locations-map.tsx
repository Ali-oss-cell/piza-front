"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/location";

interface LocationsMapProps {
  activeLocation: Location;
}

export function LocationsMap({ activeLocation }: LocationsMapProps): React.ReactElement {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-50 transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-950 md:h-full md:min-h-[620px]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 via-white/70 to-white transition-colors duration-150 ease-out dark:from-zinc-900/30 dark:via-black/70 dark:to-black" />

      <div className="absolute left-6 top-6 rounded-full border border-zinc-200/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-700 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300">
        Melbourne Coverage Map
      </div>

      <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-zinc-200/60 bg-white/70 p-4 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Selected Store</p>
        <p className="mt-1 text-lg font-semibold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
          {activeLocation.name} — {activeLocation.suburb}
        </p>
        <p className="mt-1 text-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
          {activeLocation.address}
        </p>
      </div>

      <div
        className="absolute -translate-x-1/2 -translate-y-full"
        style={{
          left: `${activeLocation.mapPosition.x}%`,
          top: `${activeLocation.mapPosition.y}%`,
        }}
      >
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-mapPinPulse rounded-full bg-[#d81b60]/30" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#d81b60] shadow-lg shadow-[#d81b60]/40">
          <MapPin className="h-5 w-5 fill-white text-white" />
        </span>
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-150",
          "bg-[radial-gradient(circle_at_center,rgba(216,27,96,0.12),transparent_55%)]"
        )}
        style={{
          backgroundPosition: `${activeLocation.mapPosition.x}% ${activeLocation.mapPosition.y}%`,
        }}
      />
    </div>
  );
}
