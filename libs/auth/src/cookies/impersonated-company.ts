import { cookies } from "next/headers";
import "server-only";

const IMPERSONATED_COMPANY_ID_COOKIE = "impersonatedCompanyId";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

/** Short-lived platform-admin “open web app as this company” cookie (see session resolution). */
const MAX_AGE_SEC = 5 * 60 * 60; // 5 hours

export async function getImpersonatedCompanyCookie(): Promise<string | null> {
  return (await cookies()).get(IMPERSONATED_COMPANY_ID_COOKIE)?.value ?? null;
}

export async function setImpersonatedCompanyCookie(companyId: string) {
  (await cookies()).set(IMPERSONATED_COMPANY_ID_COOKIE, companyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}

export async function deleteImpersonatedCompanyCookie() {
  (await cookies()).set(IMPERSONATED_COMPANY_ID_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
    ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
  });
}
