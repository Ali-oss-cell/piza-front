"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle(): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative rounded-full text-zinc-950 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10",
        !mounted && "pointer-events-none opacity-0"
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          aria-hidden
          className={cn(
            "absolute h-5 w-5 shrink-0 text-[#d81b60] transition-opacity duration-100",
            isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
          strokeWidth={1.75}
        />
        <Moon
          aria-hidden
          className={cn(
            "absolute h-5 w-5 shrink-0 transition-opacity duration-100",
            isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
          strokeWidth={1.75}
        />
      </span>
    </Button>
  );
}
