"use client";

import { LoginForm } from "@/components/auth/login-form";
import { pageShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export default function LoginPage(): React.ReactElement {
  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center px-4 py-16",
        pageShell
      )}
    >
      <LoginForm />
    </main>
  );
}
