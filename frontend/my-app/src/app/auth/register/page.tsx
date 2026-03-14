"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBackground } from "@/components/ui/auth-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import {
  mapApiError,
  passwordStrength,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validators";
import type { RegisterCredentials } from "@/types/auth";

type Field = keyof RegisterCredentials;

function getErrors(form: RegisterCredentials): Partial<Record<Field, string>> {
  return {
    firstName: validateName(form.firstName, "First name"),
    lastName: validateName(form.lastName, "Last name"),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: validateConfirmPassword(
      form.confirmPassword,
      form.password,
    ),
  };
}

const strengthLabel: Record<1 | 2 | 3, string> = {
  1: "Weak",
  2: "Fair",
  3: "Strong",
};
const strengthBarColor: Record<1 | 2 | 3, string> = {
  1: "bg-red-500",
  2: "bg-yellow-400",
  3: "bg-emerald-500",
};
const strengthTextColor: Record<1 | 2 | 3, string> = {
  1: "text-red-600 dark:text-red-400",
  2: "text-yellow-600 dark:text-yellow-400",
  3: "text-emerald-600 dark:text-emerald-400",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterCredentials>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const errors = getErrors(form);
  const fieldError = (name: Field) =>
    touched[name] ? errors[name] : undefined;
  const strength = passwordStrength(form.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setApiError(null);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);

    try {
      // TODO: call register API
      // await api.post("/auth/register", form);
      // router.push("/auth/login");
    } catch (err) {
      setApiError(mapApiError(err, "register"));
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
                <p className="text-sm text-center text-blue-700 dark:text-blue-300">
                  Get started for free
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sign up
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  label="First name"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John"
                  leftIcon={<UserIcon />}
                  error={fieldError("firstName")}
                />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  label="Last name"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Doe"
                  error={fieldError("lastName")}
                />
              </div>

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

              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={(e) => { handleBlur(e); setPasswordFocused(false); }}
                  placeholder="Create a password"
                  leftIcon={<LockIcon />}
                  error={fieldError("password")}
                />
                <div
                  className={[
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    (passwordFocused || !!fieldError("password")) && strength > 0
                      ? "max-h-12 opacity-100"
                      : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {([1, 2, 3] as const).map((level) => (
                        <div
                          key={level}
                          className={[
                            "h-1 flex-1 rounded-full transition-[background-color] duration-500 ease-in-out",
                            strength >= level
                              ? strengthBarColor[strength as 1 | 2 | 3]
                              : "bg-zinc-200 dark:bg-zinc-700",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <p
                      className={[
                        "text-xs font-medium transition-[color] duration-300 ease-in-out",
                        strength > 0
                          ? strengthTextColor[strength as 1 | 2 | 3]
                          : "text-transparent",
                      ].join(" ")}
                    >
                      {strength > 0
                        ? `${strengthLabel[strength as 1 | 2 | 3]} password`
                        : "\u00A0"}
                    </p>
                  </div>
                </div>
              </div>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Repeat your password"
                leftIcon={<LockIcon />}
                error={fieldError("confirmPassword")}
              />

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
                className="w-full rounded-2xl py-3 pt-3"
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </main>
    </AuthBackground>
  );
}
