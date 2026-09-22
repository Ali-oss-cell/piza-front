import type { Metadata } from "next";
import Link from "next/link";
import { pageShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Linkly Cloud pinpad pairing | voro POS",
  description:
    "Pair a Linkly Cloud pinpad or Virtual Pinpad with voro POS for Marina Pizzas stores.",
  robots: { index: true, follow: true },
};

const STEPS = [
  {
    title: "Put the pinpad in Cloud Mode",
    body: "On a real Linkly terminal or Virtual Pinpad (VPP), ensure Cloud Mode is enabled (VPP: FUNC → 7410 if needed). Wait until the device shows READY.",
  },
  {
    title: "Start pairing on the pinpad",
    body: "Press FUNC → 8880 → OK. When prompted, confirm to generate a 6-digit pair code. Do not leave the pairing screen until the POS admin finishes the next step.",
  },
  {
    title: "Pair in Admin → Payments",
    body: "Sign in to the store admin at marinapizzas.com.au/admin. Open Payments. Enter your Linkly Cloud username, password, and the 6-digit pair code, then click Pair pinpad. For multi-site brands, you can pair a brand default and optionally override per location.",
  },
  {
    title: "Confirm on POS",
    body: "Open pos.marinapizzas.com.au, select the correct store and location. The header should show “Pinpad paired”. Card / EFTPOS is enabled for that location.",
  },
  {
    title: "Re-pair or troubleshoot",
    body: "If pairing fails with HTTP 400, get a fresh 8880 code (codes expire). Unpair in Admin before pairing a different device. Keep the VPP/terminal online during the first card sale after pairing.",
  },
] as const;

export default function LinklyPairingGuidePage(): React.ReactElement {
  return (
    <main className={cn("mx-auto max-w-3xl px-4 py-12 sm:px-6", pageShell)}>
      <p className={cn("text-sm font-semibold uppercase tracking-wide", secondaryText)}>
        voro POS · Linkly Cloud
      </p>
      <h1 className={cn("mt-2 font-display text-3xl font-bold sm:text-4xl", primaryText)}>
        Pinpad pairing guide
      </h1>
      <p className={cn("mt-3 text-base leading-relaxed", secondaryText)}>
        Use this guide to pair a Linkly Cloud pinpad (or Linkly Virtual Pinpad for testing)
        with <strong className={primaryText}>voro POS</strong> for Marina Pizzas / Benny Boy’s.
        Pairing secrets stay on the server — never enter them in the POS register app.
      </p>

      <ol className="mt-10 space-y-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                "bg-[var(--brand-accent,#E85D04)] text-white",
              )}
            >
              {index + 1}
            </span>
            <div>
              <h2 className={cn("text-lg font-semibold", primaryText)}>{step.title}</h2>
              <p className={cn("mt-1 text-sm leading-relaxed", secondaryText)}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={cn("mt-12 rounded-2xl border border-zinc-200/80 p-5 dark:border-white/10")}>
        <h2 className={cn("text-base font-semibold", primaryText)}>Accreditation note</h2>
        <p className={cn("mt-2 text-sm leading-relaxed", secondaryText)}>
          POS software name: <strong className={primaryText}>voro POS</strong>. Integration type:
          Linkly Cloud REST Sync. One shared API hosts all stores; each location may use the brand
          pinpad or its own paired override.
        </p>
      </div>

      <p className={cn("mt-8 text-sm", secondaryText)}>
        <Link className="underline underline-offset-2 hover:opacity-80" href="/">
          Back to storefront
        </Link>
      </p>
    </main>
  );
}
