import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cardShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        cardShell,
        "mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center md:px-8 md:py-16",
        className
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {icon}
        </div>
      ) : null}
      <h3 className={cn("text-lg font-bold md:text-xl", primaryText)}>{title}</h3>
      {description ? (
        <p className={cn("mt-2 text-[15px] leading-relaxed", secondaryText)}>{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6 rounded-full px-8" variant="pill">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction && !actionHref ? (
        <Button className="mt-6 rounded-full px-8" onClick={onAction} type="button" variant="pill">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
