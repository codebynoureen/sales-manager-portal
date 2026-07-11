import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server component / API route client. Reads cookies via next/headers.
 * setAll is a no-op here (API routes are read-only w.r.t. auth cookies) —
 * session refresh is handled by middleware.ts instead.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}
