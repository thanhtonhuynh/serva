"use server";

import { platformAdminGuardWithRateLimit } from "@serva/auth/authorize";
import { createCompany, updateCompany } from "@serva/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CompanySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export type CompanyInput = z.infer<typeof CompanySchema>;

export async function createCompanyAction(
  data: CompanyInput,
): Promise<{ error?: string }> {
  await platformAdminGuardWithRateLimit();

  const parsed = CompanySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const company = await createCompany(parsed.data.name, parsed.data.slug);
    redirect(`/companies/${company.id}`);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint"))
      return { error: "A company with this slug already exists." };
    throw err;
  }
}

export async function updateCompanyAction(
  companyId: string,
  data: CompanyInput,
): Promise<{ error?: string }> {
  await platformAdminGuardWithRateLimit();

  const parsed = CompanySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateCompany(companyId, parsed.data);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint"))
      return { error: "A company with this slug already exists." };
    throw err;
  }

  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/companies");
  redirect(`/companies/${companyId}`);
}
