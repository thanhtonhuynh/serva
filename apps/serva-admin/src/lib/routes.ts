/** Centralized pathname builders for serva-admin. */

export const ROUTES = {
  home: "/",

  /** Companies */
  companies: "/companies",
  company: (id: string) => `/companies/${id}`,

  /** Identities */
  identities: "/identities",
  identity: (id: string) => `/identities/${id}`,
  identityEdit: (id: string) => `/identities/${id}/edit`,
} as const;

/** Append a query string from Next.js `searchParams`. */
export function routeWithSearchParams(
  path: string,
  searchParams?: Record<string, string | string[] | undefined>,
): string {
  if (!searchParams || Object.keys(searchParams).length === 0) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, value);
    }
  }

  const q = params.toString();
  return q ? `${path}?${q}` : path;
}
