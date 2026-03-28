"use server";

import { getCurrentSession } from "@serva/auth/session";
import { setCompanyIdCookie } from "@serva/auth/cookies";
import { redirect } from "next/navigation";

export async function selectCompanyAction(companyId: string) {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");

  await setCompanyIdCookie(companyId);
  redirect("/");
}
