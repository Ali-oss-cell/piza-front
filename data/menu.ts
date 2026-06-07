import { getGeneralImage, getPastaImage, getPizzaImage } from "@/data/images";
import type { MenuItemBadge } from "@/lib/menu-badges";
import type { MenuCategory, MenuItem, SizePricing } from "@/types/menu";

export const categories: { label: string; value: MenuCategory }[] = [
  { label: "Traditional Pizza", value: "traditional-pizza" },
  { label: "Gourmet Pizza", value: "gourmet-pizza" },
  { label: "Pasta", value: "pastas" },
  { label: "Sides", value: "sides" },
  { label: "Drinks", value: "drinks" },
  { label: "Desserts", value: "desserts" },
];

const TRADITIONAL_PRICING: SizePricing = { small: 14, large: 20, family: 24 };
const GOURMET_PRICING: SizePricing = { small: 16, large: 24, family: 28 };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createPizzaItem(
  category: "traditional-pizza" | "gourmet-pizza",
  number: number,
  name: string,
  description: string,
  imageIndex: number,
  sizePricing: SizePricing,
  badges?: MenuItemBadge[]
): MenuItem {
  const image = getPizzaImage(imageIndex);

  return {
    id: `${category}-${slugify(name)}`,
    number,
    name,
    description,
    price: sizePricing.large,
    category,
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt,
    badges,
    sizePricing,
  };
}

function createPastaItem(
  number: number,
  name: string,
  description: string,
  imageIndex: number,
  priceNote?: string
): MenuItem {
  const image = getPastaImage(imageIndex);

  return {
    id: `pasta-${slugify(name)}`,
    number,
    name,
    description,
    price: 17,
    category: "pastas",
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt,
    priceNote,
  };
}

function createSimpleItem(
  category: "sides" | "drinks" | "desserts",
  number: number,
  name: string,
  description: string,
  price: number,
  imageIndex: number
): MenuItem {
  const image = getGeneralImage(imageIndex);

  return {
    id: `${category}-${slugify(name)}`,
    number,
    name,
    description,
    price,
    category,
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt,
  };
}

const traditionalPizzaData: {
  name: string;
  description: string;
  badges?: MenuItemBadge[];
}[] = [
  { name: "Leovorno", description: "Ham, Hot Salami, Onion, Mushroom, Garlic", badges: ["SIGNATURE"] },
  { name: "Plain", description: "Ham" },
  { name: "Mexican", description: "Ham, Hot Salami, Capsicum, Onion", badges: ["SPICY"] },
  { name: "Americana", description: "Hot Salami, Capsicum, Chilli", badges: ["SPICY"] },
  { name: "Vegetarian", description: "Mushroom, Capsicum, Onion, Olives", badges: ["VEGAN"] },
  { name: "Vegetarian Special", description: "Sundried Tomato, Mushroom, Zucchini, Eggplant", badges: ["VEGAN"] },
  { name: "Hawaiian", description: "Ham, Pineapple" },
  { name: "Capriccioca", description: "Ham, Mushroom, Olives" },
  { name: "Pepperoni", description: "Pepperoni" },
  { name: "Seafood", description: "Prawns, Mixed Seafood, Anchovies" },
  { name: "Sicilian", description: "Hot Salami, Freshly Sliced Tomato, Onion, Bacon, Chilli", badges: ["SPICY"] },
  { name: "Chicken & Mushroom", description: "Chicken, Mushroom, BBQ Sauce" },
  { name: "Chicken & Pineapple", description: "Chicken, Pineapple, BBQ Sauce Optional" },
  { name: "Aussie", description: "Ham, Bacon, Egg" },
  {
    name: "The Lot",
    description: "Ham, Hot Salami, Mushroom, Capsicum, Onion, Pineapple, Prawns, Olives, Anchovies",
  },
  { name: "Marguerita", description: "Tomato Sauce, Herbs" },
  { name: "Napolitana", description: "Olives, Anchovies, Garlic" },
  { name: "Pescatore", description: "Hot Salami, Mushroom, Capsicum, Olives" },
  { name: "Mushroom", description: "Mushroom, Herbs" },
  {
    name: "Murrumbeena Special",
    description: "Sundried Tomato, Leg Ham, Hot Salami, Onion, Olives",
    badges: ["SIGNATURE"],
  },
  {
    name: "Meat Lovers",
    description: "Ham, Hot Salami, Pineapple, Bacon, Continental Sausage, BBQ Sauce",
  },
];

const traditionalPizzas: MenuItem[] = traditionalPizzaData.map((item, index) =>
  createPizzaItem(
    "traditional-pizza",
    index + 1,
    item.name,
    item.description,
    index,
    TRADITIONAL_PRICING,
    item.badges
  )
);

const gourmetPizzaData: { name: string; description: string; badges?: MenuItemBadge[] }[] = [
  { name: "Euro", description: "Spinach, Leg Ham, Onion, Charred Peppers, Eggplant, Herbs" },
  { name: "Tandoori", description: "Spinach, Marinated Chicken" },
  { name: "BBQ Grilled", description: "Spring Onion, Continental Sausage, Bacon, BBQ Sauce, Honey, Herbs" },
  { name: "Quattro Formaggi", description: "Blue Vein, Parmesan, Fetta, Mozzarella" },
  { name: "Bellissima", description: "Sundried Tomato, Spinach, Potato, Charred Peppers, Pesto, Olives, Fetta" },
  { name: "Michelino", description: "Sundried Tomato, Spring Onion, Salami, Charred Peppers, Olives, Goat Cheese" },
  { name: "Supervegie", description: "Spinach, Mushroom, Fresh Tomato, Zucchini, Eggplant, Olives", badges: ["VEGAN"] },
  {
    name: "Vegie Choice",
    description: "Sundried Tomato, Mushroom, Charred Peppers, Zucchini, Pesto, Olives, Goat Cheese",
    badges: ["VEGAN"],
  },
  { name: "Satay", description: "Chicken Satay, Onion, Pineapple" },
  { name: "Pumpkin", description: "Baby Spinach, Charred Peppers, Pumpkin, Fetta" },
  { name: "Primavera", description: "Mushroom, Zucchini, Pumpkin, Eggplant, Pesto, Goat Cheese" },
  {
    name: "Peri Peri",
    description: "Chicken, Charred Peppers, Pumpkin, Peri Peri Sauce, Fresh Rocket",
    badges: ["SPICY"],
  },
];

const gourmetPizzas: MenuItem[] = gourmetPizzaData.map((item, index) =>
  createPizzaItem(
    "gourmet-pizza",
    index + 22,
    item.name,
    item.description,
    index,
    GOURMET_PRICING,
    item.badges
  )
);

const pastaData: { name: string; description: string; priceNote?: string }[] = [
  { name: "Bolognaise", description: "Traditional Home Made Meat Sauce, Parmesan" },
  { name: "Carbonara", description: "Bacon, Cream, Parmesan" },
  { name: "Zingara", description: "Hot Salami, Onion, Garlic, Napoli Sauce" },
  { name: "Marinara", description: "Mixed Seafood, Garlic, Napoli Sauce" },
  { name: "Saltati", description: "Bacon, Garlic, Bolognaise Sauce" },
  { name: "Alla Roma", description: "Bacon, Onion, Mushroom, Cream Sauce" },
  { name: "Funghi", description: "Mushroom, Cream Sauce" },
  {
    name: "Gnocchi",
    description: "Gorgonzola With Creamy Sauce, Napoli Sauce",
    priceNote: "Gnocchi option add $2",
  },
  { name: "Napolitana", description: "Traditional Napoli Sauce" },
  { name: "Lazagna", description: "Traditional Meat Sauce" },
];

const pastas: MenuItem[] = pastaData.map((item, index) =>
  createPastaItem(index + 34, item.name, item.description, index, item.priceNote)
);

const sidesData: { name: string; description: string; price: number }[] = [
  { name: "Fresh Garden", description: "Seasonal greens", price: 10 },
  { name: "Greek", description: "Fetta, olives, cucumber, tomato", price: 12 },
  { name: "Chicken", description: "Grilled chicken salad", price: 14 },
  { name: "Garlic Bread", description: "Toasted with garlic butter", price: 6 },
  { name: "Garlic Pizza (S)", description: "Small garlic pizza", price: 12 },
  { name: "Garlic Pizza (L)", description: "Large garlic pizza", price: 16 },
  { name: "Garlic Pizza (F)", description: "Family garlic pizza", price: 20 },
];

const sides: MenuItem[] = sidesData.map((item, index) =>
  createSimpleItem("sides", index + 44, item.name, item.description, item.price, index)
);

const drinksData: { name: string; description: string; price: number }[] = [
  { name: "Cans", description: "Assorted soft drink cans", price: 3 },
  { name: "1.25 litre", description: "Assorted 1.25L soft drinks", price: 5 },
];

const drinks: MenuItem[] = drinksData.map((item, index) =>
  createSimpleItem("drinks", index + 51, item.name, item.description, item.price, index)
);

const desserts: MenuItem[] = [
  createSimpleItem(
    "desserts",
    53,
    "Ben & Jerry's Ice Cream",
    "Premium ice cream tub",
    15,
    0
  ),
];

export const menuItems: MenuItem[] = [
  ...traditionalPizzas,
  ...gourmetPizzas,
  ...pastas,
  ...sides,
  ...drinks,
  ...desserts,
];
