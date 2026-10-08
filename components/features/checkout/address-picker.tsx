"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AU_STATES,
  DEFAULT_MAP_CENTER,
  reverseGeocode,
  searchAddresses,
  type AddressSuggestion,
  type LatLng,
} from "@/lib/geocoding";
import { fieldControl, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { CheckoutAddress } from "@/types/checkout";

const DeliveryMap = dynamic(() => import("./delivery-map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-100 sm:h-72 dark:bg-zinc-900" />
  ),
});

interface AddressPickerProps {
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
  /** Store address, used to centre the map and bias search results. */
  storeAddress?: string | null;
}

export function AddressPicker({
  address,
  onChange,
  storeAddress,
}: AddressPickerProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [center, setCenter] = useState<LatLng>(DEFAULT_MAP_CENTER);
  const [pin, setPin] = useState<LatLng | null>(null);
  const reverseAbort = useRef<AbortController | null>(null);

  // Keep the latest address/onChange for async callbacks without re-subscribing.
  const latest = useRef({ address, onChange });
  latest.current = { address, onChange };

  useEffect(() => {
    if (!storeAddress) {
      return;
    }

    const controller = new AbortController();
    searchAddresses(storeAddress, undefined, controller.signal)
      .then((results) => {
        if (results[0]) {
          setCenter(results[0].position);
        }
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [storeAddress]);

  useEffect(() => {
    const text = query.trim();

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      searchAddresses(text, pin ?? center, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setLookupError(null);
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") {
            setLookupError("Address search is unavailable. Please type your address below.");
          }
        })
        .finally(() => setSearching(false));
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // Only re-run when the text changes; the bias point is a soft hint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function applySuggestion(suggestion: AddressSuggestion): void {
    const { address: current, onChange: emit } = latest.current;
    emit({
      ...current,
      ...suggestion.address,
      deliveryState: suggestion.address.deliveryState || current.deliveryState,
      deliveryLatitude: suggestion.position.lat,
      deliveryLongitude: suggestion.position.lng,
    });
    setPin(suggestion.position);
  }

  function selectSuggestion(suggestion: AddressSuggestion): void {
    applySuggestion(suggestion);
    setQuery(suggestion.label);
    setShowSuggestions(false);
  }

  async function pickOnMap(position: LatLng): Promise<void> {
    setPin(position);
    setLookupError(null);
    latest.current.onChange({
      ...latest.current.address,
      deliveryLatitude: position.lat,
      deliveryLongitude: position.lng,
    });
    reverseAbort.current?.abort();
    const controller = new AbortController();
    reverseAbort.current = controller;

    try {
      const result = await reverseGeocode(position, controller.signal);
      if (result) {
        applySuggestion(result);
        setQuery(result.label);
      } else {
        setLookupError("We couldn't find an address there. Please check the fields below.");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setLookupError("Couldn't look up that spot. Please check the fields below.");
      }
    }
  }

  function useMyLocation(): void {
    if (!("geolocation" in navigator)) {
      setLookupError("Your browser doesn't support location. Search or tap the map instead.");
      return;
    }

    setLocating(true);
    setLookupError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        void pickOnMap({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setLookupError("Location access was blocked. Search or tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function updateField(field: keyof CheckoutAddress, value: string): void {
    onChange({ ...address, [field]: value });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Label className="sr-only" htmlFor="addressSearch">
            Search for your address
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            autoComplete="off"
            className="pl-9 pr-9"
            id="addressSearch"
            placeholder="Start typing your address…"
            value={query}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searching ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />
          ) : null}
          {showSuggestions && suggestions.length > 0 ? (
            <ul className="absolute z-[1000] mt-1 max-h-72 w-full overflow-auto rounded-xl border border-zinc-200/70 bg-white py-1 shadow-lg dark:border-white/[0.08] dark:bg-zinc-950">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-white/10"
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Button
          disabled={locating}
          type="button"
          variant="outline"
          onClick={useMyLocation}
        >
          {locating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="mr-2 h-4 w-4" />
          )}
          Use my location
        </Button>
      </div>

      <div className="relative z-0 overflow-hidden rounded-xl border border-zinc-200/70 dark:border-white/[0.08]">
        <DeliveryMap center={center} pin={pin} onPick={(position) => void pickOnMap(position)} />
      </div>
      <p className={cn("text-xs", secondaryText)}>
        Tap the map or drag the pin to your exact door. Check the details below.
      </p>
      {lookupError ? <p className="text-sm text-amber-600 dark:text-amber-400">{lookupError}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addressLine1">Street address</Label>
          <Input
            autoComplete="address-line1"
            id="addressLine1"
            placeholder="12 Brunswick Street"
            value={address.deliveryAddressLine1}
            onChange={(event) => updateField("deliveryAddressLine1", event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="addressLine2">Unit / apartment (optional)</Label>
          <Input
            autoComplete="address-line2"
            id="addressLine2"
            placeholder="Unit 4"
            value={address.deliveryAddressLine2}
            onChange={(event) => updateField("deliveryAddressLine2", event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="suburb">Suburb</Label>
          <Input
            autoComplete="address-level2"
            id="suburb"
            value={address.deliverySuburb}
            onChange={(event) => updateField("deliverySuburb", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <select
            autoComplete="address-level1"
            className={cn(fieldControl, "h-11")}
            id="state"
            value={address.deliveryState}
            onChange={(event) => updateField("deliveryState", event.target.value)}
          >
            {AU_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.value}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            autoComplete="postal-code"
            id="postcode"
            inputMode="numeric"
            maxLength={4}
            placeholder="3000"
            value={address.deliveryPostcode}
            onChange={(event) =>
              updateField("deliveryPostcode", event.target.value.replace(/\D/g, ""))
            }
          />
        </div>
      </div>
    </div>
  );
}
