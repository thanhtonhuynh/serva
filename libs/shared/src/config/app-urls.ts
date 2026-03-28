/** Local dev defaults when env vars are unset */
const DEFAULT_WEB_URL = "http://localhost:3000";
const DEFAULT_AUTH_URL = "http://localhost:3001";

/**
 * Main app (consumer) base URL — used after login, signup, company selection.
 */
export function getWebUrl(): string {
  return process.env.WEB_URL ?? DEFAULT_WEB_URL;
}

/**
 * Auth portal base URL — server-side redirects to login / select-company.
 */
export function getAuthUrl(): string {
  return process.env.AUTH_URL ?? DEFAULT_AUTH_URL;
}

/**
 * Auth portal base URL for client components and links (logout, switch company).
 * Uses `NEXT_PUBLIC_AUTH_URL` in the browser; falls back to `AUTH_URL` on the server.
 */
export function getPublicAuthUrl(): string {
  return process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.AUTH_URL ?? DEFAULT_AUTH_URL;
}
