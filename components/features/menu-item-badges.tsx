import { getMenuBadgeDefinition, sortMenuBadges, type MenuItemBadge } from "@/lib/menu-badges";
import { cn } from "@/lib/utils";

interface MenuItemBadgesProps {
  badges?: MenuItemBadge[] | null;
  size?: "sm" | "md";
  className?: string;
}

export function MenuItemBadges({
  badges,
  size = "sm",
  className,
}: MenuItemBadgesProps): React.ReactElement | null {
  if (!badges?.length) {
    return null;
  }

  const sorted = sortMenuBadges(badges);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {sorted.map((badgeId) => {
        const badge = getMenuBadgeDefinition(badgeId);
        const Icon = badge.icon;

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide",
              size === "sm" ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
              badge.className
            )}
            key={badgeId}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
