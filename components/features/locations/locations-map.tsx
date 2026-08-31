"use client";

import type { Location } from "@/types/location";
import { buildMapEmbedUrl } from "@/types/location";

interface LocationsMapProps {
  activeLocation: Location;
}

export function LocationsMap({ activeLocation }: LocationsMapProps): React.ReactElement {
  const embedUrl = activeLocation.mapEmbedUrl ?? buildMapEmbedUrl(activeLocation.address);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-zinc-100 shadow-sm transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-950">
      <div className="relative aspect-[4/3] min-h-[280px] w-full sm:min-h-[360px] lg:aspect-auto lg:min-h-[560px]">
        <iframe
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          title={`Map showing ${activeLocation.name} — ${activeLocation.suburb}`}
        />
      </div>
      <div className="flex flex-col gap-3 border-t border-zinc-200/60 bg-white/90 px-4 py-4 dark:border-white/10 dark:bg-zinc-900/80 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Selected store
          </p>
          <p className="mt-1 truncate text-base font-semibold text-zinc-950 dark:text-white">
            {activeLocation.name} — {activeLocation.suburb}
          </p>
          <p className="mt-1 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            {activeLocation.address}
          </p>
        </div>
        <a
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-zinc-950 transition-colors hover:bg-zinc-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
          href={activeLocation.directionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
