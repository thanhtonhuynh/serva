"use server";

import { deleteImpersonatedCompanyCookie } from "@serva/auth/cookies";
import { redirect } from "next/navigation";

export async function exitImpersonatedCompany() {
  await deleteImpersonatedCompanyCookie();
  redirect("/");
}
