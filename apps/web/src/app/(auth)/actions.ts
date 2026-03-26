"use server";

import { getCurrentSession, invalidateSession } from "@/lib/auth/session";
import { deleteCompanyIdCookie, deleteSessionTokenCookie } from "@/lib/cookies";
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
