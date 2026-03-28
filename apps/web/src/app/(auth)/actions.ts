"use server";

import { getCurrentSession, invalidateSession } from "@serva/auth/session";
import { deleteCompanyIdCookie, deleteSessionTokenCookie } from "@serva/auth/cookies";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const { session } = await getCurrentSession();
  if (!session) throw new Error("No session found");

  await Promise.all([
    invalidateSession(session.id),
    deleteSessionTokenCookie(),
    deleteCompanyIdCookie(),
  ]);

  redirect("/login");
}
