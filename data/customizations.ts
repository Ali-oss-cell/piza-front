import type { CrustOption, ToppingCategory } from "@/types/product-detail";

export const crustOptions: CrustOption[] = [
  { id: "classic", label: "Classic Wood-fired", priceDelta: 0 },
  { id: "thin", label: "Thin & Crispy", priceDelta: 0 },
  { id: "gluten-free", label: "Gluten-Free", priceDelta: 3 },
];

export const toppingCategories: ToppingCategory[] = [
  {
    id: "meats",
    label: "Meats",
    toppings: [
      { id: "pepperoni", label: "Pepperoni", priceDelta: 2.5 },
      { id: "ham", label: "Leg Ham", priceDelta: 2.5 },
      { id: "salami", label: "Hot Salami", priceDelta: 2.5 },
      { id: "bacon", label: "Bacon", priceDelta: 3 },
      { id: "chicken", label: "Chicken", priceDelta: 3.5 },
    ],
  },
  {
    id: "cheeses",
    label: "Cheeses",
    toppings: [
      { id: "mozzarella", label: "Extra Mozzarella", priceDelta: 2.5 },
      { id: "parmesan", label: "Parmesan", priceDelta: 2 },
      { id: "fetta", label: "Fetta", priceDelta: 2.5 },
      { id: "goat-cheese", label: "Goat Cheese", priceDelta: 3 },
    ],
  },
  {
    id: "veggies",
    label: "Veggies",
    toppings: [
      { id: "mushroom", label: "Mushroom", priceDelta: 2 },
      { id: "capsicum", label: "Capsicum", priceDelta: 1.5 },
      { id: "olives", label: "Olives", priceDelta: 2 },
      { id: "basil", label: "Fresh Basil", priceDelta: 1.5 },
      { id: "rocket", label: "Rocket", priceDelta: 2 },
    ],
  },
];
