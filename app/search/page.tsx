"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { fetchMenuItems } from "@/lib/menu-api";
import { mapApiMenuItem } from "@/lib/menu-mappers";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatCurrency } from "@/lib/pricing";
import { cardShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

export default function SearchPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const slug = getSiteBrandSlug();
    void fetchMenuItems(slug)
      .then((apiItems) => {
        if (!cancelled) {
          setItems(apiItems.map(mapApiMenuItem));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <main className="min-h-[70vh] px-margin-mobile py-24 md:px-margin-desktop md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--brand-accent,#d81b60)]">
          Search
        </p>
        <h1 className={cn("mt-2 font-display text-3xl font-bold md:text-4xl", primaryText)}>
          Find a dish
        </h1>
        <p className={cn("mt-2 text-[15px]", secondaryText)}>
          Search the menu by name, topping, or category.
        </p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            aria-label="Search menu"
            className="pl-11"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. pepperoni, garlic bread, deals…"
            type="search"
            value={query}
          />
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className={cn("text-sm", secondaryText)}>Loading menu…</p>
          ) : null}
          {!loading && query.trim() && filtered.length === 0 ? (
            <EmptyState
              actionHref="/menu"
              actionLabel="Browse full menu"
              description="Try a different spelling or browse categories."
              icon={<Search className="h-7 w-7" />}
              title="No matches"
            />
          ) : null}
          {filtered.map((item) => {
            const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
            return (
              <Link
                className={cn(
                  cardShell,
                  "flex items-center gap-4 p-3 transition hover:border-[color:var(--brand-accent,#d81b60)]/30 md:p-4"
                )}
                href={`/menu/${item.id}`}
                key={item.id}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Image alt={item.imageAlt} className="object-cover" fill sizes="64px" src={src} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate font-semibold", primaryText)}>{item.name}</p>
                  <p className={cn("truncate text-sm", secondaryText)}>{item.description}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[color:var(--brand-accent,#d81b60)]">
                  {formatCurrency(item.sizePricing?.small ?? item.price)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
