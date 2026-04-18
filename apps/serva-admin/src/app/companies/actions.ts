"use server";

import { authWithRateLimit } from "@/lib/auth";
import { createPlatformCompanyEntryToken } from "@serva/auth/platform-company-entry-token";
import { createCompany, updateCompany } from "@serva/database/dal";
import { getAppBaseUrl } from "@serva/shared/config";
import { revalidatePath } from "next/cache";
import { companyFormSchema, type CompanyFormValues } from "./company-schema";

export type { CompanyFormValues as CompanyInput } from "./company-schema";

/** Generate signed impersonation URL (client opens in new tab). */
export async function getCompanyImpersonationUrl(companyId: string): Promise<string> {
  await authWithRateLimit();
  const token = createPlatformCompanyEntryToken(companyId);
  return `${getAppBaseUrl("auth-portal")}/platform/impersonate?token=${encodeURIComponent(token)}`;
}

export async function createCompanyAction(
  data: CompanyFormValues,
): Promise<{ error: string } | { companyId: string }> {
  await authWithRateLimit();

  const parsed = companyFormSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    const company = await createCompany(parsed.data.name, parsed.data.slug);
    revalidatePath("/companies");
    return { companyId: company.id };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint"))
      return { error: "A company with this slug already exists." };
    throw err;
  }
}

export async function updateCompanyAction(
  companyId: string,
  data: CompanyFormValues,
): Promise<{ error: string } | { ok: true }> {
  await authWithRateLimit();

  const parsed = companyFormSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  try {
    await updateCompany(companyId, parsed.data);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint"))
      return { error: "A company with this slug already exists." };
    throw err;
  }

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  return { ok: true };
}
