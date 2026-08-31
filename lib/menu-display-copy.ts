import type { MenuItem } from "@/types/menu";

/** Rich storefront copy for Benny Boy's — used when API description repeats the title. */
const BENNY_BOYS_COPY: Record<string, string> = {
  "double-deal":
    "Choose any 2 large pizzas, 1 garlic bread loaf, and a 1.25L drink. Our most popular combo.",
  "family-deal":
    "2 large pizzas, 1 garlic bread loaf, and 2× 1.25L drinks — built for family dinner.",
  "party-deal":
    "4 large pizzas, 2 garlic bread loaves, and 3× 1.25L drinks. Ideal for parties and events.",
  "single-deal": "1 large pizza, 1 garlic bread loaf, and a 375mL drink. Perfect solo feed.",
  "margherita-pizza": "Tomato base, double mozzarella, and oregano — classic and simple.",
  "pepperoni-pizza": "Tomato base, mozzarella, and hot salami slices.",
  "hawaiian-pizza": "Ham, pineapple, and mozzarella on a tomato base.",
  "aussie-pizza": "Ham, fried egg, bacon, and mozzarella on tomato base.",
  "garlic-pizza": "Fresh garlic, mozzarella, and oregano on a tomato base.",
  "american-style-pizza": "Pepperoni, capsicum, onion, and mozzarella.",
  "mexicana-pizza": "Mince, onion, capsicum, chilli, and mozzarella.",
  "capricciosa-pizza": "Ham, mushrooms, olives, artichoke, and mozzarella.",
  "vegetarian-pizza": "Mushrooms, capsicum, onion, olives, and mozzarella.",
  "napolitana": "Anchovies, olives, capers, and mozzarella on tomato base.",
  "marinara-pizza": "Fresh tomato, garlic, oregano, and olive oil — no cheese.",
  "half-n-half-pizza": "Pick two halves from our traditional range on one large base.",
  "super-supreme-pizza":
    "Pepperoni, ham, bacon, capsicum, mushroom, onion, olive, and pineapple.",
  "meat-supreme": "Pepperoni, ham, bacon, mince, and mozzarella.",
  "benny-boys-supreme-pizza":
    "Pepperoni, ham, bacon, capsicum, mushroom, onion, and olive.",
  "tomato-supreme": "Fresh tomato, onion, capsicum, mushroom, and mozzarella.",
  "bbq-chicken-pizza": "BBQ sauce base, chicken, onion, capsicum, and mozzarella.",
  "tandoori-chicken": "Tandoori chicken, onion, capsicum, and mozzarella.",
  "pesto-chicken": "Pesto base, chicken, sun-dried tomato, and mozzarella.",
  "chicken-supreme-pizza": "Chicken, mushroom, capsicum, onion, and mozzarella.",
  "satay-chicken-pizza": "Satay sauce, chicken, onion, capsicum, and mozzarella.",
  "hot-and-spicy-chicken-pizza": "Spicy chicken, jalapeños, onion, and mozzarella.",
  "gourmet-vegetarian-pizza": "Roasted veg, feta, olives, and mozzarella.",
  "mediterranean-pizza": "Feta, olives, sun-dried tomato, spinach, and mozzarella.",
  "red-devil-pizza": "Pepperoni, jalapeños, chilli flakes, and mozzarella.",
  "bolognese-pasta": "Slow-cooked beef bolognese tossed through penne.",
  "marinara-pasta": "Fresh tomato, garlic, basil, and olive oil with penne.",
  "vegetarian-pasta": "Seasonal vegetables in a tomato or cream sauce.",
  "carbonara-pasta": "Bacon, egg, parmesan, and cream sauce with fettuccine.",
  "chicken-pollo-pasta": "Grilled chicken, mushroom, and cream sauce.",
  "lasagne": "Layers of pasta, beef ragù, béchamel, and baked cheese.",
  "matriciana-pasta": "Bacon, onion, chilli, and tomato sauce with penne.",
  "rose-pasta": "Cream and tomato blush sauce with parmesan.",
  "bbq-chicken-wings": "Crispy wings tossed in smoky BBQ sauce.",
  "chicken-parmigiana-with-chips": "Crumbed chicken breast, napoli, cheese, and chips.",
  "boneless-chicken-2-big-pcs-with-chips": "Two large boneless pieces with seasoned chips.",
  "boneless-chicken-1-pcs-with-chips": "One boneless piece with seasoned chips.",
  "seasoned-potato-wedges-w-sour-cream": "Crispy wedges with sour cream on the side.",
  "garlic-bread-loaf": "Fresh-baked loaf with garlic butter and herbs.",
  "chips-loaded-w-cheese-and-bacon": "Hot chips topped with cheese and bacon bits.",
  "hot-jam-donuts": "Warm jam-filled donuts — sweet finish.",
  gelato: "Creamy Italian gelato — ask for today's flavours.",
  "chocolate-pizza": "Nutella base with marshmallow and chocolate drizzle.",
  "chocolate-mousse": "Rich chocolate mousse, served chilled.",
  "cheese-cake": "Classic baked cheesecake slice.",
  "solo-1-25l": "Solo soft drink — 1.25L bottle.",
  "solo-375ml": "Solo soft drink — 375mL can.",
  "sunkist-375ml": "Sunkist orange — 375mL can.",
  "sunkist-1-25l": "Sunkist orange — 1.25L bottle.",
  "pepsi-max-375ml": "Pepsi Max — 375mL can.",
  "pepsi-max-1-25l": "Pepsi Max — 1.25L bottle.",
  "pepsi-375ml": "Pepsi — 375mL can.",
  "pepsi-1-25l": "Pepsi — 1.25L bottle.",
  "lemonade-375ml": "Lemonade — 375mL can.",
  "lemonade-1-25l": "Lemonade — 1.25L bottle.",
  "mountain-dew-375ml": "Mountain Dew — 375mL can.",
  "mountain-dew-1-25l": "Mountain Dew — 1.25L bottle.",
};

function isRedundantDescription(name: string, description: string): boolean {
  const trimmed = description.trim();
  if (!trimmed) {
    return true;
  }
  const normalized = trimmed.replace(/\.$/, "").toLowerCase();
  const nameNorm = name.trim().toLowerCase();
  return normalized === nameNorm || normalized === `${nameNorm}.`;
}

function isBennyBoysBrand(brandSlug?: string): boolean {
  const slug = brandSlug?.toLowerCase() ?? "";
  return slug.includes("benny") || slug.includes("bunny");
}

export function getMenuDisplayDescription(item: MenuItem, brandSlug?: string): string {
  const copyKey = item.slug ?? item.id;

  if (isBennyBoysBrand(brandSlug)) {
    const enriched = BENNY_BOYS_COPY[copyKey];
    if (enriched) {
      return enriched;
    }
  }

  if (!isRedundantDescription(item.name, item.description)) {
    return item.description;
  }

  return "Freshly prepared to order — tap Customize for size and extras.";
}

export function getBennyBoysDealHighlights(): string[] {
  return [
    BENNY_BOYS_COPY["double-deal"],
    BENNY_BOYS_COPY["family-deal"],
    BENNY_BOYS_COPY["single-deal"],
  ].filter(Boolean);
}
