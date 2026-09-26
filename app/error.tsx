"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Something went wrong
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white md:text-4xl">
        Oven hiccup
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        We hit an unexpected error loading this page. Try again, or head home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button className="rounded-full px-8" onClick={reset} type="button" variant="pill">
          Try again
        </Button>
        <Button asChild className="rounded-full px-8" variant="secondary">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
