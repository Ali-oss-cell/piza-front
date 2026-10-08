"use client";

import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/geocoding";

/**
 * Leaflet is loaded from a CDN at runtime so the checkout doesn't need an
 * npm dependency for it. Only the small slice of the API we use is typed.
 */
const LEAFLET_VERSION = "1.9.4";
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;

interface LeafletLatLng {
  lat: number;
  lng: number;
}

interface LeafletMarker {
  setLatLng(position: [number, number]): LeafletMarker;
  getLatLng(): LeafletLatLng;
  addTo(map: LeafletMap): LeafletMarker;
  on(event: "dragend", handler: () => void): LeafletMarker;
}

interface LeafletMap {
  setView(center: [number, number], zoom: number): LeafletMap;
  getZoom(): number;
  on(event: "click", handler: (event: { latlng: LeafletLatLng }) => void): LeafletMap;
  remove(): void;
}

interface LeafletGlobal {
  map(
    element: HTMLElement,
    options: { center: [number, number]; zoom: number; scrollWheelZoom: boolean },
  ): LeafletMap;
  tileLayer(
    url: string,
    options: { attribution: string; maxZoom: number },
  ): { addTo(map: LeafletMap): void };
  marker(
    position: [number, number],
    options: { draggable: boolean; icon: unknown },
  ): LeafletMarker;
  divIcon(options: {
    className: string;
    html: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
  }): unknown;
}

declare global {
  interface Window {
    L?: LeafletGlobal;
  }
}

let leafletPromise: Promise<LeafletGlobal> | null = null;

function loadLeaflet(): Promise<LeafletGlobal> {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LEAFLET_CSS;
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.async = true;
      script.onload = () =>
        window.L ? resolve(window.L) : reject(new Error("Leaflet failed to load"));
      script.onerror = () => {
        leafletPromise = null;
        reject(new Error("Leaflet failed to load"));
      };
      document.head.appendChild(script);
    });
  }

  return leafletPromise;
}

// Inline SVG pin so we don't depend on Leaflet's bundled marker images.
const PIN_HTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="var(--brand-accent,#d81b60)" stroke="white" stroke-width="1.5"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5" fill="white"/></svg>`;

interface DeliveryMapProps {
  center: LatLng;
  pin: LatLng | null;
  onPick: (position: LatLng) => void;
}

export default function DeliveryMap({
  center,
  pin,
  onPick,
}: DeliveryMapProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletGlobal | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        leafletRef.current = L;
        const map = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom: 13,
          scrollWheelZoom: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
        map.on("click", (event) =>
          onPickRef.current({ lat: event.latlng.lat, lng: event.latlng.lng }),
        );
        mapRef.current = map;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; later centre/pin changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;

    if (!ready || !map || !L) {
      return;
    }

    if (!pin) {
      map.setView([center.lat, center.lng], Math.max(map.getZoom(), 13));
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([pin.lat, pin.lng]);
    } else {
      const marker = L.marker([pin.lat, pin.lng], {
        draggable: true,
        icon: L.divIcon({
          className: "",
          html: PIN_HTML,
          iconSize: [36, 36],
          iconAnchor: [18, 34],
        }),
      }).addTo(map);
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onPickRef.current({ lat, lng });
      });
      markerRef.current = marker;
    }

    map.setView([pin.lat, pin.lng], Math.max(map.getZoom(), 17));
  }, [ready, center.lat, center.lng, pin]);

  if (failed) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-zinc-100 px-4 text-center text-sm text-zinc-500 sm:h-72 dark:bg-zinc-900">
        The map couldn&apos;t load. You can still search or type your address.
      </div>
    );
  }

  return <div className="h-64 w-full rounded-xl sm:h-72" ref={containerRef} />;
}
