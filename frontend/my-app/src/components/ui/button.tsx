"use client";

import { forwardRef } from "react";

const SpinnerIcon = () => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

type Variant = "primary" | "secondary" | "ghost" | "danger" | "neutral";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-600 text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.65)] hover:bg-blue-500 hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.5)] active:bg-blue-700 dark:bg-blue-500 dark:shadow-[0_8px_24px_-6px_rgba(59,130,246,0.4)] dark:hover:bg-blue-400",
  secondary:
    "border border-zinc-300/80 bg-zinc-50/60 text-foreground hover:bg-zinc-100 hover:border-zinc-400/70 active:bg-zinc-200/60 dark:border-zinc-700/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-700/60 dark:hover:border-zinc-600",
  ghost:
    "text-foreground hover:bg-zinc-100 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700",
  danger:
    "bg-red-600 text-white shadow-[0_8px_24px_-6px_rgba(220,38,38,0.55)] hover:bg-red-500 active:bg-red-700",
  neutral: "bg-foreground text-background hover:opacity-85 active:opacity-70",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-5 text-sm rounded-xl gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? <SpinnerIcon /> : (leftIcon ?? null)}
        {children}
        {!loading && rightIcon ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };
