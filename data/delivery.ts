import { Clock, MapPin, Truck } from "lucide-react";
import type { InfoCard } from "@/components/features/content/info-cards";

export const deliveryHero = {
  eyebrow: "Delivery & Pickup",
  title: "We Come to You — Or You Come to Us",
  subtitle:
    "Hot pizza, pasta, and sides delivered across Wantirna South and nearby suburbs, or ready for pickup at Coleman Rd.",
};

export const deliveryOptions: InfoCard[] = [
  {
    title: "Delivery",
    description:
      "Flat-rate delivery to homes and offices in our local delivery zone. Track your order and get updates until it arrives.",
    icon: Truck,
  },
  {
    title: "Pickup",
    description:
      "Order online and collect from 100 Coleman Rd when it's ready — skip the delivery fee and grab it fresh from the counter.",
    icon: MapPin,
  },
  {
    title: "Scheduled orders",
    description:
      "Planning ahead? Schedule pickup or delivery for a specific time — perfect for lunch meetings and family dinners.",
    icon: Clock,
  },
];

export const deliveryZones = [
  "Wantirna South",
  "Wantirna",
  "Knoxfield",
  "Bayswater",
  "Scoresby",
  "Rowville (selected areas)",
];

export const deliveryNotes = [
  "Delivery fees and minimum order amounts are confirmed at checkout.",
  "Delivery times vary with distance and kitchen volume — typically 30–45 minutes.",
  "Unsure if we deliver to your address? Enter your postcode at checkout or contact us.",
];
