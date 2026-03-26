"use server";

import { getCurrentSession } from "@/lib/auth/session";
import { setCompanyIdCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";

export async function selectCompanyAction(companyId: string) {
  const { identity } = await getCurrentSession();
  if (!identity) redirect("/login");

  await setCompanyIdCookie(companyId);
  redirect("/");
}
