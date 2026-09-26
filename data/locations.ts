import type { Location } from "@/types/location";
import { BENNY_BOYS_ADDRESS, BENNY_BOYS_NAME } from "@/types/brand";
import { buildMapEmbedUrl } from "@/types/location";
import { isOpenNow } from "@/lib/opening-hours";
import {
  suburbFromAddress,
  tradingHoursFromOpeningHours,
} from "@/lib/store-contact";

/** Static fallback when settings API is unreachable — hours intentionally empty so we never invent them. */
export const locationsFallback: Location[] = [
  {
    id: "wantirna-south",
    name: BENNY_BOYS_NAME,
    suburb: "Wantirna South",
    isOpen: false,
    address: BENNY_BOYS_ADDRESS,
    phone: "",
    email: "",
    tradingHours: [],
    mapPosition: { x: 50, y: 50 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=100+Coleman+Rd,+Wantirna+South+VIC+3152,+Australia",
    mapEmbedUrl: buildMapEmbedUrl(BENNY_BOYS_ADDRESS),
  },
];

/** @deprecated Prefer buildLocationsFromSettings — kept for map tooling imports. */
export const locations = locationsFallback;

export function buildLocationsFromSettings(input: {
  storeName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: unknown;
}): Location[] {
  const address = input.address?.trim() || BENNY_BOYS_ADDRESS;
  const suburb = suburbFromAddress(address) ?? "Wantirna South";
  const tradingHours = tradingHoursFromOpeningHours(input.openingHours);
  const phone = input.phone?.trim() || "";

  return [
    {
      id: suburb.toLowerCase().replace(/\s+/g, "-"),
      name: input.storeName || BENNY_BOYS_NAME,
      suburb,
      isOpen: isOpenNow(input.openingHours),
      address,
      phone,
      email: input.email?.trim() || "",
      tradingHours,
      mapPosition: { x: 50, y: 50 },
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      mapEmbedUrl: buildMapEmbedUrl(address),
    },
  ];
}
