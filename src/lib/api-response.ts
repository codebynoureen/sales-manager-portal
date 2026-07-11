import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

/** Matches ApiResponse<T> in src/types/sales.ts exactly. */
export function ok<T>(data: T, message: string | null = null) {
  return NextResponse.json({ data, error: null, message });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ data: null, error, message: null }, { status });
}

/**
 * Wraps a route handler: converts AuthError -> proper 401/403 JSON,
 * validation errors -> 400, and anything unexpected -> 500 without
 * leaking internals in production. In development, the real error
 * message is included so bugs are debuggable instead of showing a
 * generic "Internal server error" for everything.
 */
export function withErrorHandling(
  handler: (req: Request, ctx: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AuthError) {
        return fail(err.message, err.status);
      }
      if (err instanceof ValidationError) {
        return fail(err.message, 400);
      }
      console.error(err);
      const detail =
        process.env.NODE_ENV !== "production" && err instanceof Error
          ? `Internal server error: ${err.message}`
          : "Internal server error";
      return fail(detail, 500);
    }
  };
}

export class ValidationError extends Error {}

export function requireField<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new ValidationError(`Missing required field: ${name}`);
  }
  return value;
}