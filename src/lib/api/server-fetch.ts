import { cookies, headers } from "next/headers";
import type { ApiResponse } from "@/types/sales";

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
    return { data: null, error: "unreachable", message: null };
  }
}