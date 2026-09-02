import { redirect } from "next/navigation";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export default function MenuItemRedirectPage(): never {
  redirect(ORDER_ONLINE_HREF);
}
