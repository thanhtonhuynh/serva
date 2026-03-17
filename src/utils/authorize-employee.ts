import { getCurrentSession, type Identity } from "@/lib/auth/session";
import "server-only";
import { authenticatedRateLimit } from "./rate-limiter";

type AuthorizeResult = { identity: Identity } | { error: string };

/**
 * Shared authorization check for employee management actions.
 * Verifies session, account status, permission, and rate limit.
 * Returns the current identity if authorized, or an error result.
 */
export async function authorizeEmployeeAction(): Promise<AuthorizeResult> {
  const { identity } = await getCurrentSession();

  if (!identity || identity.accountStatus !== "active") return { error: "Unauthorized" };

  if (!(await authenticatedRateLimit(identity.id)))
    return { error: "Too many requests. Please try again later." };

  return { identity };
}
