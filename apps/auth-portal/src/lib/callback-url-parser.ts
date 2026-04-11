/**
 * Whether a parsed URL may be used as a post-login redirect target.
 * - `ongba.ca` and `*.ongba.ca` (http/https).
 * - `localhost`, `127.0.0.1`, `[::1]` with any port (http/https).
 */
export function isAllowedOrigin(url: URL): boolean {
  const { protocol, hostname } = url;
  if (protocol !== "http:" && protocol !== "https:") return false;

  // Local dev hosts
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") {
    return true;
  }

  // Serva production hosts
  if (hostname === "ongba.ca" || hostname.endsWith(".ongba.ca")) {
    return true;
  }

  return false;
}

/**
 * If `callbackUrl` is a valid allowed URL, returns it; otherwise `undefined`.
 * Use when optional `callbackUrl` query should not fall back to a default until post-login.
 */
export function parseCallbackUrl(callbackUrl: string | undefined | null): string | undefined {
  if (!callbackUrl || !callbackUrl.trim()) return undefined;

  let url: URL;
  try {
    url = new URL(callbackUrl.trim());
  } catch {
    return undefined;
  }

  if (!isAllowedOrigin(url)) return undefined;

  return url.href;
}
