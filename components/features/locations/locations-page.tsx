"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { LocationCard } from "@/components/features/locations/location-card";
import { LocationsMap } from "@/components/features/locations/locations-map";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { locations } from "@/data/locations";

export function LocationsPage(): React.ReactElement {
  const [activeLocationId, setActiveLocationId] = useState(locations[0].id);
  const mapRef = useRef<HTMLDivElement>(null);

  const activeLocation = useMemo(
    () => locations.find((location) => location.id === activeLocationId) ?? locations[0],
    [activeLocationId]
  );

  const handleSelect = useCallback((id: string) => {
    setActiveLocationId(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen bg-white pt-24 text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white">
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 lg:px-12">
        <MotionReveal as="div" className="mb-12 text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--brand-accent,#d81b60)]">
            Visit Us
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
            Our Location
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400 md:text-lg">
            Pick up from our Wantirna South store or order delivery online — bold flavours, fresh bites.
          </p>
        </MotionReveal>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="order-2 min-w-0 lg:order-1">
            <StaggerGrid className="space-y-4 md:space-y-5">
              {locations.map((location) => (
                <LocationCard
                  isActive={location.id === activeLocationId}
                  key={location.id}
                  location={location}
                  onSelect={handleSelect}
                />
              ))}
            </StaggerGrid>
          </div>

          <div
            className="order-1 min-w-0 scroll-mt-24 lg:order-2 lg:sticky lg:top-24"
            id="locations-map"
            ref={mapRef}
          >
            <LocationsMap activeLocation={activeLocation} />
          </div>
        </div>
      </section>
    </main>
  );
}
