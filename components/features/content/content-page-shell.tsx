"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContentPageShellProps {
  children: ReactNode;
  className?: string;
}

export function ContentPageShell({
  children,
  className = "",
}: ContentPageShellProps): React.ReactElement {
  return (
    <main
      className={cn(
        "bg-white text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white",
        className
      )}
    >
      {children}
    </main>
  );
}
