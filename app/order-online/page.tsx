import { redirect } from "next/navigation";
import { getNextOrderUrl } from "@/lib/nextorder";

export default function OrderOnlinePage(): never {
  redirect(getNextOrderUrl());
}
