/**
 * Application error model. All repository failures are normalized into this
 * shape so UI, route handlers and (future) the Flutter BFF see one contract.
 */

export type AppErrorCode =
  | "unconfigured" // Supabase env vars missing
  | "unauthorized" // session missing / RLS blocked
  | "not_found"
  | "validation"
  | "network"
  | "conflict"
  | "unknown";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = statusFor(code);
    this.details = details;
  }
}

function statusFor(code: AppErrorCode): number {
  switch (code) {
    case "unauthorized":
      return 401;
    case "not_found":
      return 404;
    case "validation":
      return 422;
    case "conflict":
      return 409;
    default:
      return 500;
  }
}

/**
 * Normalizes an unknown thrown value into an AppError, preserving any
 * existing AppError and extracting a readable message from Supabase errors.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const msg = extractMessage(error);
  const code = extractCode(error);

  if (msg.includes("new row violates row-level security")) {
    return new AppError("unauthorized", "Access denied by row-level security.", error);
  }
  if (msg.includes("JWT") || msg.includes("Auth session missing")) {
    return new AppError("unauthorized", msg, error);
  }
  if (msg.includes("fetch failed") || msg.includes("Failed to fetch")) {
    return new AppError("network", "Network error reaching the database.", error);
  }
  if (code === "PGRST116") {
    return new AppError("not_found", "The requested record was not found.", error);
  }
  return new AppError("unknown", msg || "An unexpected error occurred.", error);
}

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      msg?: unknown;
      error_description?: unknown;
      hint?: unknown;
    };
    for (const key of ["message", "msg", "error_description"] as const) {
      if (typeof candidate[key] === "string") return candidate[key] as string;
    }
    if (typeof candidate.hint === "string") return candidate.hint;
  }
  return "";
}

function extractCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return "";
}
