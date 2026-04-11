"use server";

import { setCompanyIdCookie } from "@serva/auth/cookies";
import { getCurrentSession } from "@serva/auth/session";
import { getCompaniesByIdentityId } from "@serva/database/dal";
import { getAppBaseUrl } from "@serva/shared/config";
import { redirect } from "next/navigation";

export async function selectCompanyAction(companyId: string) {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");

  const companies = await getCompaniesByIdentityId(identity.id);
  if (!companies.some((c) => c.id === companyId)) {
    redirect("/select-company");
  }

  await setCompanyIdCookie(companyId);

  redirect(getAppBaseUrl("serva-hub"));
}
