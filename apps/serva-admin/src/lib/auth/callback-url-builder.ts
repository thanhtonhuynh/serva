import { ROUTES } from "@/lib/routes";
import { getAppBaseUrl } from "@serva/shared/config";

const ADMIN_BASE_URL = getAppBaseUrl("serva-admin");
const ADMIN_BASE_ORIGIN = new URL(ADMIN_BASE_URL).origin;
const FALLBACK_URL = new URL(ROUTES.home, ADMIN_BASE_URL).href;

/**
 * Builds the full `callbackUrl` for auth-portal login.
 * Accepts relative paths that resolve to the admin app origin; auth-portal enforces allowed origins on redirect.
 */
export function buildCallbackUrl(redirectPath?: string): string {
  const path = redirectPath?.trim();

  if (!path || !path.startsWith("/") || path.startsWith("//")) return FALLBACK_URL;

  let resolved: URL;
  try {
    resolved = new URL(path, ADMIN_BASE_URL);
  } catch {
    return FALLBACK_URL;
  }

  if (resolved.origin !== ADMIN_BASE_ORIGIN) return FALLBACK_URL;

  return resolved.href;
}
