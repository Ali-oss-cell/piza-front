import type { CartItem } from "@/types/menu";
import { menuItems } from "@/data/menu";

const marguerita = menuItems.find((item) => item.id === "traditional-pizza-marguerita");
const bolognaise = menuItems.find((item) => item.id === "pasta-bolognaise");

if (!marguerita || !bolognaise) {
  throw new Error("Initial cart menu items are missing from menu data.");
}

export const initialCartItems: CartItem[] = [
  {
    id: "cart-marguerita",
    itemId: marguerita.id,
    name: marguerita.name,
    description: marguerita.description,
    price: marguerita.price,
    quantity: 1,
    imageUrl: marguerita.imageUrl,
    imageAlt: marguerita.imageAlt,
  },
  {
    id: "cart-bolognaise",
    itemId: bolognaise.id,
    name: bolognaise.name,
    description: bolognaise.description,
    price: bolognaise.price,
    quantity: 1,
    imageUrl: bolognaise.imageUrl,
    imageAlt: bolognaise.imageAlt,
  },
];
