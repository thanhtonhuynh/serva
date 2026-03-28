import { deleteCompanyIdCookie, deleteSessionTokenCookie } from "@serva/auth/cookies";
import { getCurrentSession, invalidateSession } from "@serva/auth/session";
import { redirect } from "next/navigation";

export async function GET() {
  const { session } = await getCurrentSession();

  if (session) {
    await Promise.all([
      invalidateSession(session.id),
      deleteSessionTokenCookie(),
      deleteCompanyIdCookie(),
    ]);
  }

  redirect("/login");
}
