import { authenticatedRateLimit } from "@serva/auth/rate-limiter";
import { getCurrentSession, type Identity } from "@serva/auth/session";
import { getAppBaseUrl } from "@serva/shared/config";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import "server-only";
import { buildCallbackUrl } from "./callback-url-builder";

/**
 * Auth guard for the current session.
 *
 * @param redirectPath use a string so `cache()` dedupes per request.
 */
export const auth = cache(async (redirectPath?: string): Promise<{ identity: Identity }> => {
  const { identity } = await getCurrentSession();

  if (!identity) {
    const callbackUrl = buildCallbackUrl(redirectPath);
    redirect(`${getAppBaseUrl("auth-portal")}/login?${new URLSearchParams({ callbackUrl })}`);
  }
  if (identity.accountStatus !== "active" || !identity.isPlatformAdmin) notFound();

  return { identity };
});

export async function authWithRateLimit(redirectPath?: string): Promise<{ identity: Identity }> {
  const { identity } = await auth(redirectPath);

  if (await authenticatedRateLimit(identity.id)) redirect("/rate-limit");

  return { identity };
}
