import { redirect } from "next/navigation";

interface CustomizePageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomizePage({
  params,
}: CustomizePageProps): Promise<never> {
  const { id } = await params;
  redirect(`/menu/${id}`);
}
