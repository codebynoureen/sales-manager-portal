import { cookies, headers } from "next/headers";
import type { ApiResponse } from "@/types/sales";

/**
 * Calls our own API routes from a server component, forwarding the
 * Supabase auth cookie so requireRole() on the route sees the session.
 * On any failure (route not built yet, network error, 401 because the
 * dev hasn't set up Supabase claims yet, etc.) it returns a null-data
 * response so callers can fall back to mock data instead of crashing
 * the page during development.
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = await cookies();
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(`${protocol}://${host}${path}`, {
      ...init,
      headers: { cookie: cookieStore.toString(), ...(init?.headers ?? {}) },
      cache: "no-store",
    });

    if (!res.ok) return { data: null, error: `Request failed (${res.status})`, message: null };
    return res.json();
  } catch {
    // Backend route not built/reachable yet — caller falls back to mock data
    return { data: null, error: "unreachable", message: null };
  }
}
