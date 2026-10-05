import { generalImages, pastaImages, pizzaImages } from "@/data/images";
import type {
  BulkMenuItem,
  CateringPackage,
  CateringPolicy,
  CateringRecommendation,
} from "@/types/catering";

/** Aligned to Benny Boys Wantirna South menu (wantirnasouth.bbpizza.com.au / Word menu). */
export const MENU_LARGE_BASIC = 14.9;
export const MENU_LARGE_SUPREME = 16.9;
export const MENU_LARGE_AVG = 15.9;
export const MENU_GARLIC_BREAD = 4.9;
export const MENU_WEDGES = 9.9;
export const MENU_LOADED_CHIPS = 9.9;
export const MENU_PASTA = 18.9;
export const MENU_DRINK_1250 = 5.9;

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
    tagline: "Built from our Party Deal — easy team lunch, no fuss",
    guestRange: "15–25 guests",
    // Party Deal ($79.90) + serviettes buffer
    totalPrice: 89.9,
    perPerson: 4.5,
    items: [
      "5× Large pizzas (mix of basic & supreme)",
      "2× Garlic bread",
      "2× 1.25L drinks",
      "Serviettes included",
    ],
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
    imageUrl: pizzaImages[3].imageUrl,
    imageAlt: "Office lunch pizza spread",
  },
  {
    id: "game-day",
    slug: "catering-game-day",
    name: "Game Day Box",
    tagline: "Pizzas plus loaded sides — perfect for watch parties",
    guestRange: "10–20 guests",
    // 4× large basic + wedges + loaded chips + 2× 1.25L ≈ $91.20
    totalPrice: 94.9,
    perPerson: 6.3,
    items: [
      "4× Large pizzas",
      "1× Seasoned potato wedges w/ sour cream",
      "1× Chips loaded with cheese & bacon",
      "2× 1.25L drinks",
    ],
    dietaryTags: ["Vegetarian"],
    imageUrl: pizzaImages[1].imageUrl,
    imageAlt: "Game day pizza boxes",
  },
  {
    id: "family-feast",
    slug: "catering-family-feast",
    name: "Family Feast",
    tagline: "Birthdays, celebrations & big family events",
    guestRange: "25–40 guests",
    // 10× large avg + 3 garlic + 4 drinks ≈ $159 + $14.70 + $23.60 ≈ $197
    totalPrice: 189.9,
    perPerson: 5.9,
    items: [
      "10× Large pizzas (your choice of flavours)",
      "3× Garlic bread",
      "4× 1.25L drinks",
      "Vegetarian pizzas available on request",
      "Gluten-free base available (+$3 per pizza)",
    ],
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
    imageUrl: generalImages[0].imageUrl,
    imageAlt: "Large party pizza spread",
  },
];

export const bulkMenuItems: BulkMenuItem[] = [
  {
    id: "pizza-multipack",
    slug: "catering-pizza-multipack",
    name: "Large Pizza Multipack",
    category: "pizzas",
    description:
      "5× large pizzas — same value as our Party Deal pizzas. Confirm flavours when we call.",
    // 5 × $14.90 basic = $74.50; catering multipack at Party Deal pizza value
    unitPrice: 74.5,
    minQty: 1,
    maxQty: 10,
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
    imageUrl: pizzaImages[0].imageUrl,
    imageAlt: pizzaImages[0].imageAlt,
  },
  {
    id: "pasta-multipack",
    slug: "catering-pasta-multipack",
    name: "Pasta Multipack (6 plates)",
    category: "pasta",
    description:
      "6× pasta plates — Bolognese, Carbonara, Chicken Pollo, or Vegetarian. Same menu recipes.",
    // 6 × $18.90 = $113.40
    unitPrice: 113.4,
    minQty: 1,
    maxQty: 8,
    dietaryTags: ["Vegetarian"],
    imageUrl: pastaImages[0].imageUrl,
    imageAlt: pastaImages[0].imageAlt,
  },
  {
    id: "pasta-plate",
    slug: "catering-pasta-plate",
    name: "Pasta Plate",
    category: "pasta",
    description: "Single pasta serve from our menu — great add-on for mixed catering.",
    unitPrice: MENU_PASTA,
    minQty: 1,
    maxQty: 40,
    dietaryTags: ["Vegetarian"],
    imageUrl: pastaImages[1].imageUrl,
    imageAlt: pastaImages[1].imageAlt,
  },
  {
    id: "garlic-bread-bundle",
    slug: "catering-garlic-bread-bundle",
    name: "Garlic Bread Bundle",
    category: "sides",
    description: "5× garlic bread — crowd favourite side.",
    // 5 × $4.90 = $24.50
    unitPrice: 24.5,
    minQty: 1,
    maxQty: 6,
    dietaryTags: ["Vegetarian"],
    imageUrl: generalImages[1].imageUrl,
    imageAlt: "Garlic bread bundle",
  },
  {
    id: "wedges",
    slug: "catering-wedges",
    name: "Seasoned Potato Wedges",
    category: "sides",
    description: "Seasoned wedges with sour cream — same as our sides menu.",
    unitPrice: MENU_WEDGES,
    minQty: 1,
    maxQty: 12,
    dietaryTags: ["Vegetarian", "Gluten-Free Options"],
    imageUrl: pastaImages[2].imageUrl,
    imageAlt: "Seasoned potato wedges",
  },
  {
    id: "loaded-chips",
    slug: "catering-loaded-chips",
    name: "Loaded Chips",
    category: "sides",
    description: "Chips loaded with cheese & bacon.",
    unitPrice: MENU_LOADED_CHIPS,
    minQty: 1,
    maxQty: 12,
    dietaryTags: [],
    imageUrl: pastaImages[2].imageUrl,
    imageAlt: "Loaded chips with cheese and bacon",
  },
  {
    id: "drinks-pack",
    slug: "catering-drinks-pack",
    name: "Drinks Pack (1.25L × 6)",
    category: "sides",
    description: "Mix of Pepsi, Solo, Lemonade, and more — 6 bottles.",
    // 6 × $5.90 = $35.40
    unitPrice: 35.4,
    minQty: 1,
    maxQty: 8,
    dietaryTags: [],
    imageUrl: pizzaImages[2].imageUrl,
    imageAlt: "Drinks pack for catering",
  },
];

export const cateringPolicies: CateringPolicy[] = [
  {
    question: "What is the minimum order?",
    answer:
      "Catering starts at 10 guests. Pre-set packages cover roughly 10–40 guests; larger events use our custom quote flow.",
  },
  {
    question: "How much notice do you need?",
    answer:
      "Standard catering needs 24 hours notice. Events for 50+ guests need 48 hours so we can prep properly.",
  },
  {
    question: "Is there a minimum spend?",
    answer:
      "Instant checkout packages start from about $90. Custom events are quoted to your headcount and menu.",
  },
  {
    question: "Delivery & setup",
    answer:
      "We deliver across Wantirna South and nearby suburbs. Large events may include setup — confirm in your quote request.",
  },
  {
    question: "Cancellation policy",
    answer:
      "Cancel or change 24+ hours before your event for a full refund. Within 24 hours, a 50% fee may apply for prep already started.",
  },
];

export function recommendForHeadcount(guests: number): CateringRecommendation {
  const safeGuests = Math.min(
    CATERING_MAX_GUESTS,
    Math.max(CATERING_MIN_GUESTS, guests),
  );
  // ~3 guests per large pizza (same rule of thumb as before, real menu pricing)
  const largePizzas = Math.max(2, Math.ceil(safeGuests / 3));
  const sides = Math.max(1, Math.ceil(safeGuests / 10));
  const drinks = Math.max(1, Math.ceil(safeGuests / 8));
  const pizzaCost = largePizzas * MENU_LARGE_AVG;
  const sidesCost = sides * MENU_WEDGES;
  const drinksCost = drinks * MENU_DRINK_1250;
  const estimatedTotal =
    Math.round((pizzaCost + sidesCost + drinksCost) * 100) / 100;
  const perPerson = Math.round((estimatedTotal / safeGuests) * 100) / 100;

  return { largePizzas, sides, drinks, estimatedTotal, perPerson };
}
