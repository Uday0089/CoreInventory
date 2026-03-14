"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBackground } from "@/components/ui/auth-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MailIcon } from "@/components/ui/icons";
import { mapApiError, validateEmail } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailError = emailTouched ? validateEmail(email) : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailTouched(true);

    if (validateEmail(email)) return;

    setApiError(null);
    setLoading(true);

    try {
      // TODO: call forgot-password API
      // await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      // mapApiError with "forgot-password" context always returns a neutral
      // message to avoid leaking whether an email is registered
      setApiError(mapApiError(err, "forgot-password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-300/70 bg-card/85 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-zinc-600/50 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center gap-5 py-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200/60 bg-blue-50 text-blue-600 shadow-[0_8px_24px_-6px_rgba(37,99,235,0.2)] dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    <path d="M7 15h.01M12 15h.01M17 15h.01" />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    We sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                    . It expires in 15 minutes.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setEmailTouched(false);
                      setApiError(null);
                    }}
                    className="text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
                  >
                    Try again
                  </button>{" "}
                  or check your spam folder.
                </p>
                <Link
                  href="/auth/login"
                  className="mt-1 text-sm font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
                >
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center justify-center">
                  <div>
                    <p className="text-sm text-center text-blue-700 dark:text-blue-300">
                      No worries
                    </p>
                    <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                      Reset password
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setApiError(null);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@company.com"
                    leftIcon={<MailIcon />}
                    error={emailError}
                  />

                  {apiError ? (
                    <p className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                      {apiError}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full rounded-2xl py-3"
                  >
                    {loading ? "Sending link..." : "Send reset link"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-300"
                  >
                    ← Back to sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </AuthBackground>
  );
}
