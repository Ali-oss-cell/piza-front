"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import { loginRequest } from "@/lib/admin-api";
import { persistAuthSession, getStoredToken, getStoredUser } from "@/lib/auth-storage";
import { canAccessSeoDashboard } from "@/types/auth";

export default function SeoLoginPage(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && canAccessSeoDashboard(user)) {
      router.replace("/seo-dashboard");
      return;
    }
    setChecking(false);
  }, [router]);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await loginRequest({ email: email.trim(), password });
      if (!canAccessSeoDashboard(session.user)) {
        setError("This account does not have SEO dashboard access.");
        return;
      }
      persistAuthSession(session);
      router.replace("/seo-dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">SEO Portal</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage page content, images, and blog posts per store and domain.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="seo-email">
              Email
            </label>
            <Input
              autoComplete="email"
              className="border-zinc-700 bg-zinc-800 text-white"
              id="seo-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="seo-password">
              Password
            </label>
            <Input
              autoComplete="current-password"
              className="border-zinc-700 bg-zinc-800 text-white"
              id="seo-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button className="w-full bg-[#d81b60] hover:brightness-110" disabled={loading} type="submit">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
