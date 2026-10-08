import type { CheckoutAddress } from "@/types/checkout";

/**
 * Address lookup backed by Photon (OpenStreetMap data, no API key).
 * Results are restricted to Australia.
 */
const PHOTON_URL = "https://photon.komoot.io";
const AUSTRALIA_BBOX = "112,-44,154,-10";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  position: LatLng;
  address: Pick<
    CheckoutAddress,
    "deliveryAddressLine1" | "deliverySuburb" | "deliveryState" | "deliveryPostcode"
  >;
}

export const AU_STATES = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
] as const;

/** Melbourne CBD — used until we know where the customer or store is. */
export const DEFAULT_MAP_CENTER: LatLng = { lat: -37.8136, lng: 144.9631 };

interface PhotonProperties {
  osm_type?: string;
  osm_id?: number;
  name?: string;
  housenumber?: string;
  street?: string;
  district?: string;
  locality?: string;
  city?: string;
  state?: string;
  postcode?: string;
  countrycode?: string;
}

interface PhotonFeature {
  properties: PhotonProperties;
  geometry: { coordinates: [number, number] };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

function toStateCode(state?: string): string {
  if (!state) {
    return "";
  }

  const match = AU_STATES.find(
    (entry) =>
      entry.label.toLowerCase() === state.toLowerCase() ||
      entry.value === state.toUpperCase(),
  );

  return match?.value ?? "";
}

function toSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const props = feature.properties;

  if (props.countrycode !== "AU") {
    return null;
  }

  const [lng, lat] = feature.geometry.coordinates;
  const street = props.street ?? props.name ?? "";
  const line1 = [props.housenumber, street].filter(Boolean).join(" ");
  // In Australian OSM data the suburb is usually the "district"; "city" is the metro area.
  const suburb = props.district ?? props.locality ?? props.city ?? "";
  const state = toStateCode(props.state);

  if (!line1 && !suburb) {
    return null;
  }

  const label = [line1, suburb, [state, props.postcode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return {
    id: `${props.osm_type ?? ""}${props.osm_id ?? `${lat},${lng}`}`,
    label,
    position: { lat, lng },
    address: {
      deliveryAddressLine1: line1,
      deliverySuburb: suburb,
      deliveryState: state,
      deliveryPostcode: props.postcode ?? "",
    },
  };
}

async function fetchPhoton(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  const query = new URLSearchParams({ lang: "en", ...params });
  const response = await fetch(`${PHOTON_URL}${path}?${query}`, { signal });

  if (!response.ok) {
    throw new Error("Address lookup is unavailable right now.");
  }

  const data = (await response.json()) as PhotonResponse;
  const seen = new Set<string>();

  return (data.features ?? [])
    .map(toSuggestion)
    .filter((suggestion): suggestion is AddressSuggestion => {
      if (!suggestion || seen.has(suggestion.label)) {
        return false;
      }
      seen.add(suggestion.label);
      return true;
    });
}

export function searchAddresses(
  text: string,
  near?: LatLng,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  return fetchPhoton(
    "/api/",
    {
      q: text,
      limit: "6",
      bbox: AUSTRALIA_BBOX,
      ...(near ? { lat: String(near.lat), lon: String(near.lng) } : {}),
    },
    signal,
  );
}

export async function reverseGeocode(
  position: LatLng,
  signal?: AbortSignal,
): Promise<AddressSuggestion | null> {
  const results = await fetchPhoton(
    "/reverse",
    { lat: String(position.lat), lon: String(position.lng), limit: "1" },
    signal,
  );

  // Keep the exact pin the customer chose rather than the snapped OSM feature.
  return results[0] ? { ...results[0], position } : null;
}

export function isValidAuPostcode(postcode: string): boolean {
  return /^\d{4}$/.test(postcode.trim());
}
