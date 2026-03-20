"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRoleById } from "@/data-access/roles";
import { getIdentityById, updateIdentity } from "@/data-access/user";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { hasAssignRolePermission } from "@/lib/auth/permission";
import { UpdateEmployeeRoleInput, UpdateEmployeeRoleSchema } from "@/lib/validations/employee";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Activates a user account (used for both verification and reactivation).
 */
export async function activateUserAction(identityId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const targetIdentity = await getIdentityById(identityId);
    if (!targetIdentity) return { error: "User not found" };

    if (targetIdentity.accountStatus === "active") return {};

    await updateIdentity(identityId, { accountStatus: "active" });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Activation failed. Please try again." };
  }
}

/**
 * Deactivates an identity.
 */
export async function deactivateUserAction(identityId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (!(await hasSessionPermission(PERMISSIONS.TEAM_MANAGE_ACCESS)))
      return { error: "Unauthorized" };

    const targetIdentity = await getIdentityById(identityId);
    if (!targetIdentity) return { error: "User not found" };

    if (targetIdentity.accountStatus === "deactivated") return {};

    await updateIdentity(identityId, { accountStatus: "deactivated" });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Deactivation failed. Please try again." };
  }
}

/**
 * Updates an identity's role.
 */
export async function updateIdentityRoleAction(
  data: UpdateEmployeeRoleInput,
): Promise<ActionResult> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    const { identity, companyCtx } = authResult;
    const { identityId, roleId } = UpdateEmployeeRoleSchema.parse(data);

    const targetRole = await getRoleById(roleId);
    if (!targetRole) return { error: "Role not found" };

    if (!hasAssignRolePermission(identity, companyCtx, targetRole))
      return { error: "Unauthorized" };

    // TODO: Phase 4/5 — update operator/employee roleId instead of identity
    // await updateIdentity(identityId, { roleId });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Role change failed. Please try again." };
  }
}
