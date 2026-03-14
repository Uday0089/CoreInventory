export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address";
}

export function validateName(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters`;
  if (!/^[\p{L}\s'\-]+$/u.test(value.trim()))
    return `${label} contains invalid characters`;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";
  if (value.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
  if (!/[\d\W]/.test(value)) return "Include at least one number or symbol";
}

export function validateLoginPassword(value: string): string | undefined {
  if (!value) return "Password is required";
}

export function validateConfirmPassword(
  value: string,
  password: string,
): string | undefined {
  if (!value) return "Please confirm your password";
  if (value !== password) return "Passwords do not match";
}

// ---------------------------------------------------------------------------
// Password strength — 0 = empty, 1 = weak, 2 = fair, 3 = strong
// ---------------------------------------------------------------------------

export function passwordStrength(value: string): 0 | 1 | 2 | 3 {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[\d\W]/.test(value)) score++;
  return score as 0 | 1 | 2 | 3;
}

// ---------------------------------------------------------------------------
// API error mapping — normalise raw HTTP/backend errors into user messages
// ---------------------------------------------------------------------------

export function mapApiError(
  err: unknown,
  context: "login" | "register" | "forgot-password" = "login",
): string {
  if (!(err instanceof Error)) return "Something went wrong. Please try again.";

  const msg = err.message.toLowerCase();

  if (
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    msg.includes("load failed")
  ) {
    return "Network error. Check your connection and try again.";
  }

  if (context === "login") {
    if (
      msg.includes("401") ||
      msg.includes("unauthorized") ||
      msg.includes("invalid") ||
      msg.includes("incorrect") ||
      msg.includes("wrong")
    ) {
      return "Incorrect email or password. Please try again.";
    }
    if (
      msg.includes("403") ||
      msg.includes("locked") ||
      msg.includes("disabled")
    ) {
      return "This account has been locked. Contact support for help.";
    }
    if (msg.includes("429") || msg.includes("too many")) {
      return "Too many sign-in attempts. Please wait a moment and try again.";
    }
  }

  if (context === "register") {
    if (
      msg.includes("409") ||
      msg.includes("conflict") ||
      msg.includes("already exists") ||
      msg.includes("duplicate")
    ) {
      return "An account with this email already exists. Try signing in instead.";
    }
    if (msg.includes("422") || msg.includes("validation")) {
      return "Please check your details and try again.";
    }
  }

  if (context === "forgot-password") {
    return "If that email is registered, you'll receive a reset link shortly.";
  }

  return err.message || "Something went wrong. Please try again.";
}
