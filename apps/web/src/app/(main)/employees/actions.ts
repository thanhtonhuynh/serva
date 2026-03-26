"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { createInvite, deleteInviteById, revokeInviteById } from "@/data-access/invite";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { generateInviteToken, getInviteExpiryDate, sendInviteEmail } from "@/lib/invite";
import prisma from "@/lib/prisma";
import { UpdateEmployeeJobInput, UpdateEmployeeJobSchema } from "@/lib/validations/employee";
import { CreateEmployeeInviteInput, CreateEmployeeInviteSchema } from "@/lib/validations/invite";
import type { EmployeeStatus } from "@/types";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Sets an employee row's `status` (not identity account status).
 */
export async function updateEmployeeStatusAction(
  employeeId: string,
  nextStatus: EmployeeStatus,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await prisma.employee.updateMany({
      where: { id: employeeId, companyId: companyCtx.companyId },
      data: { status: nextStatus },
    });

    if (result.count === 0) return { error: "Employee not found." };

    revalidatePath("/employees");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update failed. Please try again." };
  }
}

/**
 * Assign or clear an employee's job (`jobId`). Requires job to belong to the same company when set.
 */
export async function updateEmployeeJobAction(data: UpdateEmployeeJobInput): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const { employeeId, jobId: rawJobId } = UpdateEmployeeJobSchema.parse(data);
    const jobId = rawJobId === "__none__" ? null : rawJobId;

    if (jobId) {
      const job = await prisma.job.findFirst({
        where: { id: jobId, companyId: companyCtx.companyId },
        select: { id: true },
      });
      if (!job) return { error: "Job not found." };
    }

    const result = await prisma.employee.updateMany({
      where: { id: employeeId, companyId: companyCtx.companyId },
      data: { jobId },
    });

    if (result.count === 0) return { error: "Employee not found." };

    revalidatePath("/employees");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Could not update job. Please try again." };
  }
}

export async function createEmployeeInviteAction(
  data: CreateEmployeeInviteInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx, identity } = authResult;
    const parsed = CreateEmployeeInviteSchema.parse(data);
    const token = generateInviteToken();
    const expiresAt = getInviteExpiryDate();
    const jobId = parsed.jobId === "__none__" ? null : parsed.jobId;

    if (jobId) {
      const job = await prisma.job.findFirst({
        where: { id: jobId, companyId: companyCtx.companyId },
        select: { id: true },
      });
      if (!job) return { error: "Job not found." };
    }

    await createInvite({
      companyId: companyCtx.companyId,
      name: parsed.name,
      email: parsed.email,
      profileType: "employee",
      token,
      expiresAt,
      jobId,
    });

    const company = await prisma.company.findUnique({
      where: { id: companyCtx.companyId },
      select: { name: true },
    });
    await sendInviteEmail({
      to: parsed.email,
      inviterName: identity.name,
      companyName: company?.name ?? "your company",
      profileType: "employee",
      token,
    });

    revalidatePath("/employees");
    return {};
  } catch (error: unknown) {
    console.error(error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { error: "Invite token conflict. Please try again." };
    }
    return { error: "Could not create invite." };
  }
}

export async function revokeEmployeeInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await revokeInviteById(inviteId, companyCtx.companyId);
    if (result.count === 0) return { error: "Invite not found or already processed." };
    revalidatePath("/employees");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Could not revoke invite." };
  }
}

export async function deleteEmployeeInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await deleteInviteById(inviteId, companyCtx.companyId);
    if (result.count === 0) return { error: "Invite not found." };
    revalidatePath("/employees");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Could not delete invite." };
  }
}
