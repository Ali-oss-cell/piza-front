"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  getMobileNavLinkClass,
  isNavLinkActive,
  MOBILE_NAV_ITEMS,
} from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { themeTransition } from "@/lib/theme-classes";

interface MenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuSheet({ open, onOpenChange }: MenuSheetProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          "flex w-80 flex-col border-l border-zinc-200/60 bg-white p-8 dark:border-white/10 dark:bg-zinc-950",
          themeTransition
        )}
      >
        <nav className="mt-10 space-y-8">
          {MOBILE_NAV_ITEMS.map((item) => (
            <Link
              className={getMobileNavLinkClass(isNavLinkActive(pathname, item.href))}
              href={item.href}
              key={item.href}
              onClick={() => onOpenChange(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div
          className={cn(
            "mt-auto border-t border-zinc-200/60 pt-8 dark:border-white/10",
            themeTransition
          )}
        >
          <Button className="w-full uppercase tracking-widest">Order Now</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
