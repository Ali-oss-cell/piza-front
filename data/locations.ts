import type { Location } from "@/types/location";

export const locations: Location[] = [
  {
    id: "murrumbeena",
    name: "Leovorno",
    suburb: "Murrumbeena",
    isOpen: true,
    address: "231 Murrumbeena Rd, Melbourne VIC 3163",
    phone: "(03) 9570 4821",
    email: "murrumbeena@leovorno.com.au",
    tradingHours: [
      { label: "Mon — Thu", hours: "5:00pm – 10:00pm" },
      { label: "Fri — Sun", hours: "12:00pm – 11:00pm" },
    ],
    mapPosition: { x: 58, y: 72 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=231+Murrumbeena+Rd,+Murrumbeena+VIC+3163",
  },
  {
    id: "richmond",
    name: "Leovorno",
    suburb: "Richmond",
    isOpen: true,
    address: "84 Bridge Rd, Richmond VIC 3121",
    phone: "(03) 9428 1190",
    email: "richmond@leovorno.com.au",
    tradingHours: [
      { label: "Mon — Thu", hours: "5:00pm – 10:30pm" },
      { label: "Fri — Sun", hours: "12:00pm – 12:00am" },
    ],
    mapPosition: { x: 52, y: 48 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=84+Bridge+Rd,+Richmond+VIC+3121",
  },
  {
    id: "south-yarra",
    name: "Leovorno",
    suburb: "South Yarra",
    isOpen: false,
    address: "12 Toorak Rd, South Yarra VIC 3141",
    phone: "(03) 9826 4402",
    email: "southyarra@leovorno.com.au",
    tradingHours: [
      { label: "Mon — Thu", hours: "5:00pm – 10:00pm" },
      { label: "Fri — Sun", hours: "12:00pm – 11:00pm" },
    ],
    mapPosition: { x: 46, y: 55 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=12+Toorak+Rd,+South+Yarra+VIC+3141",
  },
  {
    id: "carlton",
    name: "Leovorno",
    suburb: "Carlton",
    isOpen: true,
    address: "201 Lygon St, Carlton VIC 3053",
    phone: "(03) 9347 8820",
    email: "carlton@leovorno.com.au",
    tradingHours: [
      { label: "Mon — Thu", hours: "5:00pm – 10:00pm" },
      { label: "Fri — Sun", hours: "12:00pm – 11:30pm" },
    ],
    mapPosition: { x: 48, y: 32 },
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=201+Lygon+St,+Carlton+VIC+3053",
  },
];
