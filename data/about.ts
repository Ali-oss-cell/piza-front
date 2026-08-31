import { ClipboardList, Flame, Leaf, ShoppingBag, Smile, Wheat } from "lucide-react";
import { generalImages, pizzaImages } from "@/data/images";
import { BENNY_BOYS_NAME, BENNY_BOYS_TAGLINE } from "@/types/brand";
import type { CraftPillar, ProcessStep } from "@/types/about";

export const aboutHero = {
  eyebrow: "Our Story",
  title: "About Benny Boy's",
  locationBadge: "Wantirna South",
  subtitle:
    "Serving Wantirna South's favourite pizza — generous portions, familiar favourites, and fast pickup or delivery when you need it.",
  imageUrl: pizzaImages[2].imageUrl,
  imageAlt: "Fresh pizza straight from the oven",
};

export const aboutStory = {
  heading: "Your Neighborhood Favorite",
  locationLine: "Serving Wantirna South with bold flavours and fresh bites.",
  imageUrl: generalImages[0].imageUrl,
  imageAlt: generalImages[0].imageAlt,
  paragraphs: [
    `${BENNY_BOYS_NAME} is built around generous portions, familiar favourites, and the kind of menu you can order for the family on a busy night.`,
    BENNY_BOYS_TAGLINE.charAt(0).toUpperCase() + BENNY_BOYS_TAGLINE.slice(1) +
      ". From classic pizzas and pastas to deals and sides, everything is geared toward quick service and consistent quality.",
    "Order online for pickup or delivery — we'll have your order ready when you need it.",
  ],
  highlightPhrases: ["Bold flavours", "Fresh bites"],
};

export const craftPillars: CraftPillar[] = [
  {
    id: "sourdough",
    title: "Classic Favourites",
    description:
      "Margherita, Hawaiian, supreme and more — the pizzas people actually order every week.",
    icon: Wheat,
  },
  {
    id: "sourced",
    title: "Family Deals",
    description:
      "Double, family and party deals built for sharing — better value when you're feeding a crowd.",
    icon: Leaf,
  },
  {
    id: "fire",
    title: "Fast Pickup & Delivery",
    description:
      "Order online from Wantirna South — pickup when you're nearby or delivery to your door.",
    icon: Flame,
  },
];

export const processSection = {
  eyebrow: "How to Order",
  title: "Simple as 1-2-3",
  description:
    "Browse the menu, place your order online, and enjoy fresh pizza from Coleman Rd — pickup or delivery.",
  imageUrl: pizzaImages[0].imageUrl,
  imageAlt: "Fresh Benny Boy's pizza ready to enjoy",
};

export const processSteps: ProcessStep[] = [
  {
    id: "pick",
    step: 1,
    title: "Pick Your Favourites",
    description:
      "Browse pizzas, pasta, sides and drinks — add deals and extras in a few taps.",
    imageUrl: generalImages[1].imageUrl,
    imageAlt: "Menu selection",
    icon: ClipboardList,
  },
  {
    id: "order",
    step: 2,
    title: "Place Your Order",
    description:
      "Choose pickup or delivery, pay online, and we'll confirm your order straight away.",
    imageUrl: pizzaImages[2].imageUrl,
    imageAlt: "Online ordering",
    icon: ShoppingBag,
  },
  {
    id: "enjoy",
    step: 3,
    title: "Enjoy Fresh Bites",
    description:
      "Collect from Coleman Rd or wait for delivery — hot food, bold flavours, done.",
    imageUrl: pizzaImages[0].imageUrl,
    imageAlt: "Fresh pizza ready",
    icon: Smile,
  },
];
