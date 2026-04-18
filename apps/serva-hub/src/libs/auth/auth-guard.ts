import { hasPermission } from "@/utils/permission";
import { authenticatedRateLimit } from "@serva/auth/rate-limiter";
import { getCurrentSession } from "@serva/auth/session";
import type { Session } from "@serva/database";
import { getAppBaseUrl } from "@serva/shared/config";
import type { CompanyContext, Identity, PermissionCode } from "@serva/shared/types";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";

type AuthorizeActionResult =
  | { identity: Identity; companyCtx: CompanyContext; session: Session }
  | { error: string };

/**
 * Auth guard for the current session.
 * Redirects to the auth app if not authenticated, not found if account status is not active,
 * and redirects to select-company (on the auth app) if no company context is found.
 */
export const auth = cache(async (): Promise<{ identity: Identity; companyCtx: CompanyContext }> => {
  const { identity, companyCtx } = await getCurrentSession();

  if (!identity) redirect(`${getAppBaseUrl("auth-portal")}/login`);
  if (identity.accountStatus !== "active") notFound();
  if (!companyCtx) redirect(`${getAppBaseUrl("auth-portal")}/select-company`);

  return { identity, companyCtx };
});

/**
 * Auth guard with rate limiting for the current session.
 */
export async function authWithRateLimit(): Promise<{
  identity: Identity;
  companyCtx: CompanyContext;
}> {
  const { identity, companyCtx } = await auth();

  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  return { identity, companyCtx };
}

/**
 * Check if the current session has a specific permission.
 */
export async function hasSessionPermission(permissionCode: PermissionCode): Promise<boolean> {
  const { identity, companyCtx } = await getCurrentSession();
  return hasPermission(identity, companyCtx, permissionCode);
}

/**
 * Shared authorization check for server actions.
 * Verifies identity, account status, and rate limit.
 */
export async function authorizeAction(): Promise<AuthorizeActionResult> {
  const { identity, companyCtx, session } = await getCurrentSession();

  if (!identity || identity.accountStatus !== "active" || !companyCtx)
    return { error: "Unauthorized" };

  if (await authenticatedRateLimit(identity.id))
    return { error: "Too many requests. Please try again later." };

  return { identity, companyCtx, session };
}
