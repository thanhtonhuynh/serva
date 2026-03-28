import type { Session } from "@serva/database";
import { getAuthUrl, type PermissionCode } from "@serva/shared";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { hasPermission } from "./permission";
import { authenticatedRateLimit } from "./rate-limiter";
import { getCurrentSession, type CompanyContext, type Identity } from "./session";

/**
 * Guard for platform-admin routes (apps/admin).
 * Does NOT require companyCtx — platform admins may have zero tenant memberships.
 */
export const platformAdminGuard = cache(async (): Promise<{ identity: Identity }> => {
  const { identity } = await getCurrentSession();

  if (!identity) redirect(`${getAuthUrl()}/login`);
  if (identity.accountStatus !== "active") notFound();
  if (!identity.isPlatformAdmin) notFound();

  return { identity };
});

export async function platformAdminGuardWithRateLimit(): Promise<{ identity: Identity }> {
  const { identity } = await platformAdminGuard();

  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  return { identity };
}

type AuthorizeActionResult =
  | { identity: Identity; companyCtx: CompanyContext; session: Session }
  | { error: string };

/**
 * Auth guard for the current session.
 * Redirects to the auth app if not authenticated, not found if account status is not active,
 * and redirects to select company (on the auth app) if no company context is found.
 */
export const authGuard = cache(
  async (): Promise<{ identity: Identity; companyCtx: CompanyContext }> => {
    const { identity, companyCtx } = await getCurrentSession();

    if (!identity) redirect(`${getAuthUrl()}/login`);
    if (identity.accountStatus !== "active") notFound();
    if (!companyCtx) redirect(`${getAuthUrl()}/select-company`);

    return { identity, companyCtx };
  },
);

/**
 * Auth guard with rate limiting for the current session.
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
