"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getNextOrderUrl, isNextOrderOrderingEnabled, MENU_HREF } from "@/lib/nextorder";

export default function OrderOnlinePage(): React.ReactElement {
  const router = useRouter();
  const useNextOrder = isNextOrderOrderingEnabled();
  const target = useNextOrder ? getNextOrderUrl() : MENU_HREF;

  useEffect(() => {
    if (useNextOrder) {
      window.location.assign(target);
      return;
    }
    router.replace(target);
  }, [router, target, useNextOrder]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand-accent,#d81b60)]" />
      <h1 className="text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
        Taking you to order…
      </h1>
      <p className="max-w-sm text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {useNextOrder
          ? "Opening the online ordering portal. If nothing happens, use the button below."
          : "Redirecting to our menu so you can order pickup or delivery."}
      </p>
      <a
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-[color:var(--brand-accent,#d81b60)] px-6 text-sm font-semibold text-white hover:brightness-110"
        href={target}
        rel={useNextOrder ? "noopener noreferrer" : undefined}
        target={useNextOrder ? "_blank" : undefined}
      >
        Continue
      </a>
    </main>
  );
}
