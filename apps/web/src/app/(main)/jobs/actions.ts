"use server";

import { PERMISSIONS } from "@serva/shared";
import { createJob, updateJobName } from "@serva/database";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { CreateJobInput, CreateJobSchema, UpdateJobInput, UpdateJobSchema } from "@/lib/validations/job";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

export async function createJobAction(data: CreateJobInput): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { name } = CreateJobSchema.parse(data);
    const { companyCtx } = authResult;

    await createJob(companyCtx.companyId, name);
    revalidatePath("/jobs");
    revalidatePath("/employees");
    return {};
  } catch (error: unknown) {
    console.error(error);
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "A job with this name already exists." };
    }
    return { error: "Could not create job." };
  }
}

export async function updateJobAction(data: UpdateJobInput): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const parsed = UpdateJobSchema.parse(data);
    const { companyCtx } = authResult;

    const result = await updateJobName(parsed.jobId, companyCtx.companyId, parsed.name);
    if (result.count === 0) return { error: "Job not found." };

    revalidatePath("/jobs");
    revalidatePath("/employees");
    return {};
  } catch (error: unknown) {
    console.error(error);
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
      return { error: "A job with this name already exists." };
    }
    return { error: "Could not update job." };
  }
}
