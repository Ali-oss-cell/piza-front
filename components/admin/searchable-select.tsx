"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
  emptyLabel = "No matches",
  searchPlaceholder = "Search…",
  className,
}: SearchableSelectProps): React.ReactElement {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.hint?.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          className="h-9 pl-9 text-sm"
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={query}
        />
      </div>
      <select
        className={cn(
          "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition-colors",
          "focus-visible:border-[color:var(--brand-accent,#d81b60)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent,#d81b60)]/25",
          "dark:border-zinc-600 dark:bg-zinc-900",
          primaryText,
        )}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {filtered.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.hint ? `${opt.label} (${opt.hint})` : opt.label}
          </option>
        ))}
      </select>
      {filtered.length === 0 ? (
        <p className={cn("text-xs", secondaryText)}>{emptyLabel}</p>
      ) : query.trim() ? (
        <p className={cn("text-xs", secondaryText)}>
          {filtered.length} match{filtered.length === 1 ? "" : "es"}
        </p>
      ) : null}
    </div>
  );
}
