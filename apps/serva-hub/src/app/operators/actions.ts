"use server";

import { authorizeAction, hasSessionPermission } from "@/libs/auth";
import { generateInviteToken, getInviteExpiryDate, sendInviteEmail } from "@/libs/invite";
import { UpdateOperatorRoleInput, UpdateOperatorRoleSchema } from "@/libs/validations/employee";
import { CreateOperatorInviteInput, CreateOperatorInviteSchema } from "@/libs/validations/invite";
import { hasAssignRolePermission } from "@/utils/permission";
import { prisma } from "@serva/database";
import {
  createInvite,
  deleteInviteById,
  getRoleById,
  revokeInviteById,
  updateOperatorRole,
} from "@serva/database/dal";
import { PERMISSIONS } from "@serva/shared";
import type { EmployeeStatus } from "@serva/shared/types";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Sets an operator row's `status` (not identity account status).
 */
export async function updateOperatorStatusAction(
  operatorId: string,
  nextStatus: EmployeeStatus,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await prisma.operator.updateMany({
      where: { id: operatorId, companyId: companyCtx.companyId },
      data: { status: nextStatus },
    });

    if (result.count === 0) return { error: "Operator not found." };

    revalidatePath("/operators");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Update failed. Please try again." };
  }
}

/**
 * Updates an operator's RBAC role (`Operator.roleId`) for the current company.
 */
export async function updateOperatorRoleAction(
  data: UpdateOperatorRoleInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity, companyCtx } = authResult;
    const { identityId, roleId } = UpdateOperatorRoleSchema.parse(data);

    const targetRole = await getRoleById(roleId);
    if (!targetRole) return { error: "Role not found" };

    if (!hasAssignRolePermission(identity, companyCtx, targetRole))
      return { error: "Unauthorized" };

    const { count } = await updateOperatorRole(identityId, companyCtx.companyId, roleId);
    if (count === 0) return { error: "Team member is not an operator in this company." };

    revalidatePath("/operators");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Role change failed. Please try again." };
  }
}

export async function createOperatorInviteAction(
  data: CreateOperatorInviteInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx, identity } = authResult;
    const parsed = CreateOperatorInviteSchema.parse(data);

    const role = await prisma.role.findFirst({
      where: { id: parsed.roleId, companyId: companyCtx.companyId },
      select: { id: true },
    });
    if (!role) return { error: "Role not found." };

    const token = generateInviteToken();
    const expiresAt = getInviteExpiryDate();

    await createInvite({
      companyId: companyCtx.companyId,
      name: parsed.name,
      email: parsed.email,
      profileType: "operator",
      token,
      expiresAt,
      roleId: parsed.roleId,
    });

    const company = await prisma.company.findUnique({
      where: { id: companyCtx.companyId },
      select: { name: true },
    });
    await sendInviteEmail({
      to: parsed.email,
      inviterName: identity.name,
      companyName: company?.name ?? "your company",
      profileType: "operator",
      token,
      inviteeName: parsed.name,
    });

    revalidatePath("/operators");
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

export async function revokeOperatorInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await revokeInviteById(inviteId, companyCtx.companyId);
    if (result.count === 0) return { error: "Invite not found or already processed." };
    revalidatePath("/operators");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Could not revoke invite." };
  }
}

export async function deleteOperatorInviteAction(inviteId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const { companyCtx } = authResult;
    const result = await deleteInviteById(inviteId, companyCtx.companyId);
    if (result.count === 0) return { error: "Invite not found." };
    revalidatePath("/operators");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Could not delete invite." };
  }
}
