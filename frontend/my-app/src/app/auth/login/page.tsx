"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBackground } from "@/components/ui/auth-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon, MailIcon } from "@/components/ui/icons";
import { api } from "@/lib/api";
import {
  mapApiError,
  validateEmail,
  validateLoginPassword,
} from "@/lib/validators";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

type Field = keyof LoginCredentials;

function getErrors(form: LoginCredentials): Partial<Record<Field, string>> {
  return {
    email: validateEmail(form.email),
    password: validateLoginPassword(form.password),
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [rememberSession, setRememberSession] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errors = getErrors(form);
  const fieldError = (name: Field) =>
    touched[name] ? errors[name] : undefined;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (errors.email || errors.password) return;

    setApiError(null);
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", form);
      const storage = rememberSession
        ? window.localStorage
        : window.sessionStorage;
      const other = rememberSession
        ? window.sessionStorage
        : window.localStorage;

      other.removeItem("access_token");
      other.removeItem("token_type");
      storage.setItem("access_token", response.access_token);
      storage.setItem("token_type", response.token_type);

      router.push("/");
    } catch (err) {
      setApiError(mapApiError(err, "login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-300/70 bg-card/85 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-zinc-600/50 sm:p-8">
            <div className="mb-8 flex items-center justify-center">
              <div>
                <p className="text-sm item-center justify-center text-center text-blue-700 dark:text-blue-300">
                  Welcome back
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sign in
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@company.com"
                leftIcon={<MailIcon />}
                error={fieldError("email")}
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                labelRight={
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                }
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                leftIcon={<LockIcon />}
                error={fieldError("password")}
              />

              <label className="flex items-center justify-between gap-3 rounded-2xl px-1 py-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(event) =>
                      setRememberSession(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                  />
                  Keep me signed in on this device
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  Secure
                </span>
              </label>

              {apiError ? (
                <p className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  {apiError}
                </p>
              ) : null}

              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-2xl py-3"
              >
                {loading ? "Signing in..." : "Sign in to CoreInventory"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthBackground>
  );
}
