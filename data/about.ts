import { Flame, Leaf, Wheat } from "lucide-react";
import { generalImages, pizzaImages } from "@/data/images";
import { BENNY_BOYS_NAME, BENNY_BOYS_TAGLINE } from "@/types/brand";
import type { CraftPillar, ProcessStep } from "@/types/about";

export const aboutHero = {
  eyebrow: BENNY_BOYS_NAME,
  title: "Bold Flavours, Fresh Bites",
  subtitle:
    "Wantirna South pizza, pasta, deals and sides — made for pickup and delivery when you want it fast.",
  imageUrl: generalImages[1].imageUrl,
  imageAlt: generalImages[1].imageAlt,
};

export const aboutStory = {
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

export const processSteps: ProcessStep[] = [
  {
    id: "dough",
    step: 1,
    title: "Pick Your Favourites",
    description:
      "Browse pizzas, pasta, sides and drinks — add deals and extras in a few taps.",
    imageUrl: generalImages[1].imageUrl,
    imageAlt: "Menu selection",
  },
  {
    id: "sauce",
    step: 2,
    title: "Place Your Order",
    description:
      "Choose pickup or delivery, pay online, and we'll confirm your order straight away.",
    imageUrl: pizzaImages[2].imageUrl,
    imageAlt: "Online ordering",
  },
  {
    id: "fire",
    step: 3,
    title: "Enjoy Fresh Bites",
    description:
      "Collect from Coleman Rd or wait for delivery — hot food, bold flavours, done.",
    imageUrl: pizzaImages[0].imageUrl,
    imageAlt: "Fresh pizza ready",
  },
];
