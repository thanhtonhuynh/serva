import {
  getCurrentSession,
  setImpersonatedCompanyCookie,
  verifyPlatformCompanyEntryToken,
} from "@serva/auth";
import { prisma } from "@serva/database";
import { getAdminUrl, getAuthUrl, getWebUrl } from "@serva/shared";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { identity } = await getCurrentSession();
  if (!identity) {
    redirect(`${getAuthUrl()}/login`);
  }
  if (!identity.isPlatformAdmin) {
    redirect(`${getAdminUrl()}/companies`);
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    redirect(`${getAdminUrl()}/companies`);
  }

  const companyId = verifyPlatformCompanyEntryToken(token);
  if (!companyId) {
    redirect(`${getAdminUrl()}/companies`);
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });
  if (!company) {
    redirect(`${getAdminUrl()}/companies`);
  }

  await setImpersonatedCompanyCookie(companyId);
  redirect(getWebUrl());
}
