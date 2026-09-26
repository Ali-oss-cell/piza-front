import Link from "next/link";
import { Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--brand-accent,#d81b60)]/10 text-[color:var(--brand-accent,#d81b60)]">
        <Pizza className="h-8 w-8" />
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Error 404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white md:text-4xl">
        This slice went missing
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        We couldn&apos;t find that page. Head back to the menu and grab something better.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-full px-8" variant="pill">
          <Link href="/menu">Browse menu</Link>
        </Button>
        <Button asChild className="rounded-full px-8" variant="secondary">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
