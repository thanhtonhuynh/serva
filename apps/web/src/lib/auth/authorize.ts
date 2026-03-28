import { hasPermission } from "@/lib/auth/permission";
import { getCurrentSession, type CompanyContext, type Identity } from "@/lib/auth/session";
import type { PermissionCode } from "@/types/rbac";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import type { Session } from "@serva/database";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

type AuthorizeActionResult =
  | { identity: Identity; companyCtx: CompanyContext; session: Session }
  | { error: string };

/**
 * Auth guard for the current session.
 * Redirects to login if not authenticated, not found if account status is not active,
 * and redirects to select company if no company context is found.
 * Returns the identity and company context.
 */
export const authGuard = cache(
  async (): Promise<{ identity: Identity; companyCtx: CompanyContext }> => {
    const { identity, companyCtx } = await getCurrentSession();

    if (!identity) redirect("/login");
    if (identity.accountStatus !== "active") notFound();
    if (!companyCtx) redirect("/select-company");

    return { identity, companyCtx };
  },
);

/**
 * Auth guard with rate limiting for the current session.
 * Redirects to login if not authenticated, not found if account status is not active,
 * and redirects to select company if no company context is found, and redirects to rate limit if the user is rate limited.
 * Returns the identity and company context.
 */
export async function authGuardWithRateLimit(): Promise<{
  identity: Identity;
  companyCtx: CompanyContext;
}> {
  const { identity, companyCtx } = await authGuard();

  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  return { identity, companyCtx };
}

/**
 * Check if the current session has a specific permission.
 * Returns true if the session has the permission, false otherwise.
 * Used in server components.
 */
export async function hasSessionPermission(permissionCode: PermissionCode): Promise<boolean> {
  const { identity, companyCtx } = await getCurrentSession();
  return hasPermission(identity, companyCtx, permissionCode);
}

/**
 * Shared authorization check for server actions.
 * Verifies identity, account status, and rate limit.
 * Returns the current identity if authorized, or an error result.
 */
export async function authorizeAction(): Promise<AuthorizeActionResult> {
  const { identity, companyCtx, session } = await getCurrentSession();

  if (!identity || identity.accountStatus !== "active" || !companyCtx)
    return { error: "Unauthorized" };

  if (await authenticatedRateLimit(identity.id))
    return { error: "Too many requests. Please try again later." };

  return { identity, companyCtx, session };
}
