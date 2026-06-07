import { cn } from "@/lib/utils";

interface LocationStatusBadgeProps {
  isOpen: boolean;
}

export function LocationStatusBadge({ isOpen }: LocationStatusBadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]",
        isOpen
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-zinc-300/60 bg-zinc-100/80 text-zinc-600 dark:border-zinc-600/50 dark:bg-zinc-800/60 dark:text-zinc-400"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isOpen ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-500"
        )}
      />
      {isOpen ? "Open Now" : "Closed"}
    </span>
  );
}
