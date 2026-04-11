/** App keys */
export type AppName = "serva-hub" | "auth-portal" | "serva-admin";

const APP_BASE_URLS: Record<AppName, string> = {
  "auth-portal": process.env.NEXT_PUBLIC_AUTH_PORTAL_URL ?? "http://localhost:3100",
  "serva-hub": process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:4100",
  "serva-admin": process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:5100",
};

/** Get the base URL for a given app */
export function getAppBaseUrl(app: AppName): string {
  return APP_BASE_URLS[app];
}
