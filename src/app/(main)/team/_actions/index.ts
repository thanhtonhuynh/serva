"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRoleById } from "@/data-access/roles";
import { getIdentityById, updateIdentity } from "@/data-access/user";
import { UpdateEmployeeRoleInput, UpdateEmployeeRoleSchema } from "@/lib/validations/employee";
import { hasAssignRolePermission, hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Activates a user account (used for both verification and reactivation).
 * @param identityId - The ID of the identity to activate
 */
export async function activateUserAction(identityId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;
    if (!hasPermission(identity.role, PERMISSIONS.TEAM_MANAGE_ACCESS))
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
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;
    if (!hasPermission(identity.role, PERMISSIONS.TEAM_MANAGE_ACCESS))
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
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { identity } = authResult;
    const { identityId, roleId } = UpdateEmployeeRoleSchema.parse(data);

    const targetRole = await getRoleById(roleId);
    if (!targetRole) return { error: "Role not found" };

    if (!hasAssignRolePermission(identity.role, targetRole)) return { error: "Unauthorized" };

    await updateIdentity(identityId, { roleId });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Role change failed. Please try again." };
  }
}
