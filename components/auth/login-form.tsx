"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { useAuth } from "@/providers/auth-provider";
import { canAccessAdminDashboard } from "@/types/auth";
import { cn } from "@/lib/utils";

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
}

function validateForm(values: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const { login } = useAuth();
  const [values, setValues] = useState<LoginFormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
      });

      if (canAccessAdminDashboard(user)) {
        router.push("/admin/dashboard");
        return;
      }

      router.push("/");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to sign in. Please check your connection and try again.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-md p-8", dashboardGlass)}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d81b60]">Leovorno</p>
        <h1 className={cn("mt-3 font-display text-3xl font-bold", primaryText)}>Welcome back</h1>
        <p className={cn("mt-2 text-sm", secondaryText)}>Sign in to manage orders and your store.</p>
      </div>

      <form className="space-y-5" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label className={cn("mb-2 block text-sm font-medium", primaryText)} htmlFor="email">
            Email
          </label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            placeholder="admin@leovorno.com"
            type="email"
            value={values.email}
          />
          {errors.email ? <p className="mt-2 text-sm text-[#d81b60]">{errors.email}</p> : null}
        </div>

        <div>
          <label className={cn("mb-2 block text-sm font-medium", primaryText)} htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Input
              autoComplete="current-password"
              className="pr-11"
              id="password"
              onChange={(event) =>
                setValues((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={values.password}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-[#d81b60]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <p className="mt-2 text-sm text-[#d81b60]">{errors.password}</p> : null}
        </div>

        {errors.form ? (
          <p className="rounded-xl border border-[#d81b60]/20 bg-[#d81b60]/10 px-4 py-3 text-sm text-[#d81b60]">
            {errors.form}
          </p>
        ) : null}

        <Button className="w-full rounded-xl py-6" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
