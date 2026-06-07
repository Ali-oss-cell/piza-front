import { Flame, Leaf, Wheat } from "lucide-react";
import { generalImages, pizzaImages } from "@/data/images";
import type { CraftPillar, ProcessStep } from "@/types/about";

export const aboutHero = {
  eyebrow: "Leovorno Heritage",
  title: "The Art of Wood-Fired Perfection",
  subtitle:
    "A Melbourne-born pizzeria shaped by fire, patience, and the belief that extraordinary food should feel effortless.",
  imageUrl: generalImages[1].imageUrl,
  imageAlt: generalImages[1].imageAlt,
};

export const aboutStory = {
  imageUrl: generalImages[0].imageUrl,
  imageAlt: generalImages[0].imageAlt,
  paragraphs: [
    "Leovorno began with a simple conviction: pizza is not fast food when it is made with reverence. Our kitchens were built around the rhythm of wood-fired ovens, hand-stretched dough, and ingredients chosen for character rather than convenience.",
    "Every service is guided by a culinary philosophy rooted in Italian tradition and contemporary precision. We ferment our dough for 48-hour slow fermentation, source produce from trusted local growers, and finish each pizza at the exact moment the crust achieves its signature leopard char.",
    "The result is a dining experience that feels cinematic yet intimate — refined enough for date night, fast enough for the city, and honest enough to taste the craft in every bite.",
  ],
  highlightPhrases: ["48-hour slow fermentation", "signature leopard char"],
};

export const craftPillars: CraftPillar[] = [
  {
    id: "sourdough",
    title: "Sourdough Tradition",
    description:
      "Naturally leavened dough rested for two days to develop depth, elasticity, and a delicate chew.",
    icon: Wheat,
  },
  {
    id: "sourced",
    title: "Locally Sourced",
    description:
      "Seasonal produce and specialty imports selected for purity, provenance, and vibrant flavor.",
    icon: Leaf,
  },
  {
    id: "fire",
    title: "The Wood-Fired Secret",
    description:
      "Blistering oak and fruitwood heat creates the aroma, char, and soul no conventional oven can replicate.",
    icon: Flame,
  },
];

export const processSteps: ProcessStep[] = [
  {
    id: "dough",
    step: 1,
    title: "The Dough",
    description:
      "Flour, water, salt, and time. Our dough is folded, rested, and brought to room temperature before every service for a light, digestible crust.",
    imageUrl: generalImages[1].imageUrl,
    imageAlt: "Artisan dough preparation",
  },
  {
    id: "sauce",
    step: 2,
    title: "The Sauce",
    description:
      "Vine-ripened tomatoes are seasoned simply and cooked down to preserve brightness — never masked, always celebrated.",
    imageUrl: pizzaImages[2].imageUrl,
    imageAlt: "Fresh ingredients for sauce",
  },
  {
    id: "fire",
    step: 3,
    title: "The Fire",
    description:
      "At nearly 400°C, each pizza spends under two minutes in the oven. The result: a blistered cornicione and molten, balanced toppings.",
    imageUrl: pizzaImages[0].imageUrl,
    imageAlt: "Wood-fired pizza finish",
  },
];
