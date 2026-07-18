"use client";

import { useMemo, useState } from "react";
import { LocationCard } from "@/components/features/locations/location-card";
import { LocationsMap } from "@/components/features/locations/locations-map";
import { locations } from "@/data/locations";

export function LocationsPage(): React.ReactElement {
  const [activeLocationId, setActiveLocationId] = useState(locations[0].id);

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === activeLocationId) ?? locations[0],
    [activeLocationId]
  );

  return (
    <main className="min-h-screen bg-white pt-24 text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white">
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 lg:px-12">
        <header className="mb-12 text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
            Wood-Fired Network
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
            Our Locations
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400 md:text-lg">
            Discover Leovorno across Melbourne. Every store is built around wood-fired craft,
            premium ingredients, and fast urban delivery zones.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="max-h-[620px] space-y-4 overflow-y-auto pr-1 no-scrollbar md:space-y-5">
              {locations.map((location) => (
                <LocationCard
                  isActive={location.id === activeLocationId}
                  key={location.id}
                  location={location}
                  onSelect={setActiveLocationId}
                />
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            <LocationsMap activeLocation={activeLocation} />
          </div>
        </div>
      </section>
    </main>
  );
}
