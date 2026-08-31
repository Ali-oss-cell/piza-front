import { pizzaImages } from "@/data/images";
import type {
  BulkMenuItem,
  CateringPackage,
  CateringPolicy,
  CateringRecommendation,
} from "@/types/catering";

export const CATERING_MIN_GUESTS = 10;
export const CATERING_MAX_GUESTS = 500;
export const INSTANT_CHECKOUT_MAX = 500;
export const MIN_LEAD_HOURS = 24;
export const MIN_LEAD_HOURS_LARGE = 48;
export const LARGE_EVENT_GUEST_THRESHOLD = 50;

export const cateringPackages: CateringPackage[] = [
  {
    id: "office-lunch",
    slug: "catering-office-lunch",
    name: "Office Lunch",
    tagline: "Feed the team without the fuss",
    guestRange: "15–25 guests",
    totalPrice: 210,
    perPerson: 14,
    items: [
      "5× Large pizzas (mix of supreme & classic)",
      "2× Garlic bread loaves",
      "2× 1.25L drinks",
      "Serviettes & plates included",
    ],
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
    imageUrl: pizzaImages[0].imageUrl,
    imageAlt: "Office lunch pizza spread",
  },
  {
    id: "game-day",
    slug: "catering-game-day",
    name: "Game Day Box",
    tagline: "Perfect for watch parties & casual gatherings",
    guestRange: "10–20 guests",
    totalPrice: 165,
    perPerson: 11,
    items: [
      "4× Large pizzas",
      "1× Seasoned potato wedges w/ sour cream",
      "1× Chips loaded w/ cheese & bacon",
      "2× 1.25L drinks",
    ],
    dietaryTags: ["Vegetarian"],
    imageUrl: pizzaImages[2].imageUrl,
    imageAlt: "Game day pizza boxes",
  },
  {
    id: "party-feast",
    slug: "catering-party-feast",
    name: "Party Feast",
    tagline: "Birthdays, celebrations & big family events",
    guestRange: "30–50 guests",
    totalPrice: 520,
    perPerson: 13,
    items: [
      "10× Large pizzas (your choice of flavours)",
      "3× Garlic bread loaves",
      "2× Pasta full trays",
      "4× 1.25L drinks",
      "Includes 2× vegetarian & 1× gluten-free option",
    ],
    dietaryTags: ["Vegetarian", "Gluten-Free Options", "Halal Friendly"],
    imageUrl: pizzaImages[1].imageUrl,
    imageAlt: "Large party pizza spread",
  },
];

export const bulkMenuItems: BulkMenuItem[] = [
  {
    id: "pizza-multipack",
    slug: "catering-pizza-multipack",
    name: "Large Pizza Multipack",
    category: "pizzas",
    description: "5× large pizzas — pick your flavours when you confirm.",
    unitPrice: 180,
    minQty: 1,
    maxQty: 10,
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
  },
  {
    id: "pasta-full",
    slug: "catering-pasta-full",
    name: "Pasta Full Tray",
    category: "pasta",
    description: "Feeds approx. 10–12 — Bolognese, Carbonara, or Vegetarian.",
    unitPrice: 45,
    minQty: 1,
    maxQty: 8,
    dietaryTags: ["Vegetarian"],
  },
  {
    id: "pasta-half",
    slug: "catering-pasta-half",
    name: "Pasta Half Tray",
    category: "pasta",
    description: "Feeds approx. 5–6 — great add-on for mixed menus.",
    unitPrice: 28,
    minQty: 1,
    maxQty: 10,
    dietaryTags: ["Vegetarian"],
  },
  {
    id: "garlic-bread-bundle",
    slug: "catering-garlic-bread-bundle",
    name: "Garlic Bread Bundle",
    category: "sides",
    description: "5× garlic bread loaves — crowd favourite side.",
    unitPrice: 18,
    minQty: 1,
    maxQty: 6,
    dietaryTags: ["Vegetarian"],
  },
  {
    id: "wedges-tray",
    slug: "catering-wedges-tray",
    name: "Potato Wedges Tray",
    category: "sides",
    description: "Large tray of seasoned wedges with sour cream.",
    unitPrice: 32,
    minQty: 1,
    maxQty: 6,
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
  },
  {
    id: "drinks-pack",
    slug: "catering-drinks-pack",
    name: "Drinks Pack (1.25L × 6)",
    category: "sides",
    description: "Mix of Pepsi, Solo, and Lemonade — 6 bottles.",
    unitPrice: 30,
    minQty: 1,
    maxQty: 8,
    dietaryTags: [],
  },
];

export const cateringPolicies: CateringPolicy[] = [
  {
    question: "What is the minimum order?",
    answer:
      "Catering starts at 10 guests. Pre-set packages are sized for 10–50 guests; larger events use our custom quote flow.",
  },
  {
    question: "How much notice do you need?",
    answer:
      "Standard catering requires 24 hours notice. Events for 50+ guests need 48 hours so we can prep properly.",
  },
  {
    question: "Is there a minimum spend?",
    answer: "Instant checkout packages start from $165. Custom events typically start from $300 depending on menu.",
  },
  {
    question: "Delivery & setup",
    answer:
      "We deliver across Wantirna South and surrounding suburbs. Large events may include setup — confirm in your quote request.",
  },
  {
    question: "Cancellation policy",
    answer:
      "Cancel or change 24+ hours before your event for a full refund. Within 24 hours, a 50% fee may apply for prep already started.",
  },
];

export function recommendForHeadcount(guests: number): CateringRecommendation {
  const safeGuests = Math.min(CATERING_MAX_GUESTS, Math.max(CATERING_MIN_GUESTS, guests));
  const largePizzas = Math.max(2, Math.ceil(safeGuests / 3));
  const sides = Math.max(1, Math.ceil(safeGuests / 10));
  const drinks = Math.max(1, Math.ceil(safeGuests / 8));
  const pizzaCost = largePizzas * 38;
  const sidesCost = sides * 22;
  const drinksCost = drinks * 5.5;
  const estimatedTotal = Math.round((pizzaCost + sidesCost + drinksCost) * 100) / 100;
  const perPerson = Math.round((estimatedTotal / safeGuests) * 100) / 100;

  return { largePizzas, sides, drinks, estimatedTotal, perPerson };
}
