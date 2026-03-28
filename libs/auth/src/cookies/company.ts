import { cookies } from "next/headers";
import "server-only";

const COMPANY_ID_COOKIE = "companyId";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

export async function getCompanyIdCookie(): Promise<string | null> {
  return (await cookies()).get(COMPANY_ID_COOKIE)?.value ?? null;
}

export async function setCompanyIdCookie(companyId: string) {
  (await cookies()).set(COMPANY_ID_COOKIE, companyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}

export async function deleteCompanyIdCookie() {
  (await cookies()).set(COMPANY_ID_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}
