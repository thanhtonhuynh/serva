import { getCurrentSession, User } from "@/lib/auth/session";
import "server-only";
import { authenticatedRateLimit } from "./rate-limiter";

type AuthorizeResult = { user: User } | { error: string };

/**
 * Shared authorization check for employee management actions.
 * Verifies session, account status, permission, and rate limit.
 * Returns the current user if authorized, or an error result.
 */
export async function authorizeEmployeeAction(): Promise<AuthorizeResult> {
  const { user } = await getCurrentSession();

  if (!user || user.accountStatus !== "active") return { error: "Unauthorized" };

  if (!(await authenticatedRateLimit(user.id)))
    return { error: "Too many requests. Please try again later." };

  return { user };
}
