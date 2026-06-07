import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pageShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export default function TrackOrderPage(): React.ReactElement {
  return (
    <main className={cn("flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center", pageShell)}>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d81b60]">Coming Soon</p>
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Track Order</h1>
      <p className="mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
        Real-time order tracking will live here. For now, contact your local Leovorno store for updates.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to Menu</Link>
      </Button>
    </main>
  );
}
