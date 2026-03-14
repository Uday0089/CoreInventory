"use client";

import { forwardRef, useState } from "react";

// Eye icons are internal — they're part of the password toggle mechanism
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const defaultBorderClass =
  "border-zinc-300/80 bg-zinc-50/60 hover:border-zinc-400/70 focus:border-blue-500 focus:bg-background focus:ring-[3px] focus:ring-blue-500/12 dark:border-zinc-700/70 dark:bg-zinc-800/40 dark:hover:border-zinc-600 dark:focus:border-blue-400 dark:focus:bg-zinc-800/70 dark:focus:ring-blue-400/10";

const errorBorderClass =
  "border-red-400/70 bg-red-50/40 hover:border-red-400 focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 dark:border-red-500/40 dark:bg-red-900/10 dark:hover:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400/10";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  leftIcon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, labelRight, leftIcon, error, type = "text", id, className, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="space-y-1.5">
        {(label || labelRight) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={id}
                className="block text-sm font-medium text-foreground/80"
              >
                {label}
              </label>
            )}
            {labelRight}
          </div>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground/60">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            className={[
              "w-full rounded-xl border py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-200",
              error ? errorBorderClass : defaultBorderClass,
              leftIcon ? "pl-10" : "pl-4",
              isPassword ? "pr-11" : "pr-4",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3.5 flex items-center text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
