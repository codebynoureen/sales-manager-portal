import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Role } from "@prisma/client";

export interface SessionUser {
  userId: string;
  tenantId: string;
  role: Role;
  email: string | null;
  assignedBeat: string | null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/**
 * Reads the Supabase session from cookies and extracts userId, tenantId,
 * and role from the JWT's app_metadata custom claims (RULE 6 — the JWT
 * must contain userId, tenantId, role).
 *
 * tenantId/role are expected to be set as Supabase Auth custom claims
 * (app_metadata) at user-creation time — never trust a client-supplied
 * tenantId/role from the request body.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // API routes are read-only w.r.t. auth cookies here; refresh is
        // handled by the Supabase middleware elsewhere in the app.
        setAll: () => {},
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError("Not authenticated", 401);
  }

  const tenantId = user.app_metadata?.tenantId as string | undefined;
  const role = user.app_metadata?.role as Role | undefined;

  if (!tenantId || !role) {
    throw new AuthError("Session is missing tenantId/role claims", 401);
  }

  return {
    userId: user.id,
    tenantId,
    role,
    email: user.email ?? null,
    assignedBeat: (user.app_metadata?.assignedBeat as string | undefined) ?? null,
  };
}

/**
 * Loads the session and enforces that the caller's role is one of `roles`.
 * Throws AuthError(403) otherwise. Use at the top of every route handler
 * per Section 6.1's "Only allow role X" rule.
 */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!roles.includes(session.role)) {
    throw new AuthError(`Role ${session.role} is not permitted to access this resource`, 403);
  }
  return session;
}
