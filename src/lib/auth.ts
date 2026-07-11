import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface SessionUser {
  userId: string;
  tenantId: string;
  role: Role;
  email: string | null;
  name: string | null;
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
 * Reads the Supabase session from cookies, extracts tenantId/role from the
 * JWT's app_metadata custom claims, and looks up the person's display name
 * from our own User table (Supabase Auth doesn't store it by default).
 *
 * IMPORTANT: this only works if User.id in Prisma equals the Supabase Auth
 * user's UID — when you create a Sales Manager/Booker's Supabase Auth
 * account, create their Prisma `User` row with that same id.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const supabase = await createClient();

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

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  return {
    userId: user.id,
    tenantId,
    role,
    email: user.email ?? null,
    name: profile?.name ?? null,
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