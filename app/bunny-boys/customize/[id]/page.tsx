import { redirect } from "next/navigation";

interface BunnyCustomizePageProps {
  params: Promise<{ id: string }>;
}

export default async function BunnyCustomizePage({
  params,
}: BunnyCustomizePageProps): Promise<never> {
  const { id } = await params;
  redirect(`/menu/${id}`);
}
