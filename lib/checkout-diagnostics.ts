/** Shared helpers for detailed checkout / order error reports (safe for client). */

export type CheckoutStep =
  | "parse_body"
  | "validate_fields"
  | "stripe_config"
  | "speedy_config"
  | "validate_cart"
  | "speedy_calculate"
  | "db_insert"
  | "unknown";

export type CheckoutErrorReport = {
  ok: false;
  error: string;
  step: CheckoutStep;
  hint?: string;
  details?: Record<string, unknown>;
  at: string;
};

export function checkoutError(
  step: CheckoutStep,
  error: string,
  opts?: { hint?: string; details?: Record<string, unknown> },
): CheckoutErrorReport {
  return {
    ok: false,
    error,
    step,
    hint: opts?.hint,
    details: opts?.details,
    at: new Date().toISOString(),
  };
}

export function serializeUnknownError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const out: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };
    if (error.stack) out.stack = error.stack.split("\n").slice(0, 8);
    const anyErr = error as Error & {
      code?: string;
      cause?: unknown;
      digest?: string;
    };
    if (anyErr.code) out.code = anyErr.code;
    if (anyErr.digest) out.digest = anyErr.digest;
    if (anyErr.cause) out.cause = serializeUnknownError(anyErr.cause);
    return out;
  }
  if (typeof error === "object" && error !== null) {
    try {
      return JSON.parse(JSON.stringify(error));
    } catch {
      return { message: String(error) };
    }
  }
  return { message: String(error) };
}

/** Env presence only — never return secret values. */
export function envPresenceReport() {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "SPEEDY_USERNAME",
    "SPEEDY_PASSWORD",
    "NEXT_PUBLIC_SITE_URL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "RESEND_TO_EMAIL",
    "ADMIN_PASSWORD",
    "CRON_SECRET",
  ] as const;

  const present: Record<string, boolean> = {};
  for (const key of keys) {
    present[key] = Boolean(process.env[key]?.trim());
  }

  return {
    present,
    nodeEnv: process.env.NODE_ENV || null,
    vercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV || null,
    vercelUrl: process.env.VERCEL_URL || null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    supabaseHost: (() => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
        return url ? new URL(url).host : null;
      } catch {
        return "invalid_url";
      }
    })(),
  };
}
