"use server";

import { createPlatformCompanyEntryToken, platformAdminGuardWithRateLimit } from "@serva/auth";
import { createCompany, updateCompany } from "@serva/database/dal";
import { getAuthUrl } from "@serva/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { companyFormSchema, type CompanyFormValues } from "./company-schema";

export type { CompanyFormValues as CompanyInput } from "./company-schema";

/** Full navigation to auth → web (avoids client Link/RSC fetch + cross-origin redirect CORS). */
export async function openCompanyInWebAction(companyId: string) {
  await platformAdminGuardWithRateLimit();
  const token = createPlatformCompanyEntryToken(companyId);
  redirect(`${getAuthUrl()}/platform/impersonate?token=${encodeURIComponent(token)}`);
}

export async function createCompanyAction(
  data: CompanyFormValues,
): Promise<{ error: string } | { companyId: string }> {
  await platformAdminGuardWithRateLimit();

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
  await platformAdminGuardWithRateLimit();

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
