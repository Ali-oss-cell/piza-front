import { eyebrowLabel, primaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  highlight = false,
  className,
}: StatCardProps): React.ReactElement {
  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-5 text-center md:px-6 md:py-6",
        highlight
          ? "border-[color:var(--brand-accent,#d81b60)]/30 bg-[color:var(--brand-accent,#d81b60)]/5"
          : "border-zinc-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:border-white/[0.08] dark:bg-zinc-950/50 dark:shadow-none",
        className
      )}
    >
      <p className={cn(eyebrowLabel, highlight && "text-[color:var(--brand-accent,#d81b60)]")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-[28px] font-bold leading-none tracking-tight md:text-[32px]",
          highlight ? "text-[color:var(--brand-accent,#d81b60)]" : primaryText
        )}
      >
        {value}
      </p>
    </div>
  );
}
