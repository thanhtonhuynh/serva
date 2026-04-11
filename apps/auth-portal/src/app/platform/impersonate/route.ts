import {
  getCurrentSession,
  setImpersonatedCompanyCookie,
  verifyPlatformCompanyEntryToken,
} from "@serva/auth";
import { prisma } from "@serva/database";
import { getAppBaseUrl } from "@serva/shared/config";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { identity } = await getCurrentSession();
  if (!identity) {
    redirect(`${getAppBaseUrl("auth-portal")}/login`);
  }
  if (!identity.isPlatformAdmin) {
    redirect(`${getAppBaseUrl("serva-admin")}/companies`);
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    redirect(`${getAppBaseUrl("serva-admin")}/companies`);
  }

  const companyId = verifyPlatformCompanyEntryToken(token);
  if (!companyId) {
    redirect(`${getAppBaseUrl("serva-admin")}/companies`);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });
  if (!company) {
    redirect(`${getAppBaseUrl("serva-admin")}/companies`);
  }

  await setImpersonatedCompanyCookie(companyId);
  redirect(getAppBaseUrl("serva-hub"));
}
