import type { Location } from "@/types/location";
import { BENNY_BOYS_ADDRESS, BENNY_BOYS_NAME } from "@/types/brand";

export const locations: Location[] = [
  {
    id: "wantirna-south",
    name: BENNY_BOYS_NAME,
    suburb: "Wantirna South",
    isOpen: true,
    address: BENNY_BOYS_ADDRESS,
    phone: "",
    email: "",
    tradingHours: [
      { label: "Mon — Thu", hours: "4:00pm – 10:00pm" },
      { label: "Fri — Sun", hours: "11:00am – 11:00pm" },
    ],
    mapPosition: { x: 72, y: 58 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=100+Coleman+Rd,+Wantirna+South+VIC+3152,+Australia",
  },
];
