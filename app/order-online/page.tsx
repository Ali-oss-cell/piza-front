import { redirect } from "next/navigation";
import { getNextOrderUrl, isNextOrderOrderingEnabled, MENU_HREF } from "@/lib/nextorder";

export default function OrderOnlinePage(): never {
  if (isNextOrderOrderingEnabled()) {
    redirect(getNextOrderUrl());
  }
  redirect(MENU_HREF);
}
