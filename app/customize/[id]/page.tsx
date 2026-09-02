import { redirect } from "next/navigation";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

interface CustomizePageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomizePage(_props: CustomizePageProps): Promise<never> {
  redirect(ORDER_ONLINE_HREF);
}
