"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { getRoleById } from "@/data-access/roles";
import { getUserById, updateUser } from "@/data-access/user";
import { UpdateEmployeeRoleInput, UpdateEmployeeRoleSchema } from "@/lib/validations/employee";
import { hasAssignRolePermission, hasPermission } from "@/utils/access-control";
import { authorizeEmployeeAction } from "@/utils/authorize-employee";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string };

/**
 * Activates a user account (used for both verification and reactivation).
 * @param userId - The ID of the user to activate
 */
export async function activateUserAction(userId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    if (!hasPermission(user.role, PERMISSIONS.TEAM_MANAGE_ACCESS)) return { error: "Unauthorized" };

    const targetUser = await getUserById(userId);
    if (!targetUser) return { error: "User not found" };

    if (targetUser.accountStatus === "active") return {};

    await updateUser(userId, { accountStatus: "active" });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Activation failed. Please try again." };
  }
}

/**
 * Deactivates a user account.
 */
export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    if (!hasPermission(user.role, PERMISSIONS.TEAM_MANAGE_ACCESS)) return { error: "Unauthorized" };

    const targetUser = await getUserById(userId);
    if (!targetUser) return { error: "User not found" };

    if (targetUser.accountStatus === "deactivated") return {};

    await updateUser(userId, { accountStatus: "deactivated" });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Deactivation failed. Please try again." };
  }
}

/**
 * Updates a user's role.
 */
export async function updateUserRoleAction(data: UpdateEmployeeRoleInput): Promise<ActionResult> {
  try {
    const authResult = await authorizeEmployeeAction();
    if ("error" in authResult) return authResult;

    const { user } = authResult;
    const { userId, roleId } = UpdateEmployeeRoleSchema.parse(data);

    const targetRole = await getRoleById(roleId);
    if (!targetRole) return { error: "Role not found" };

    if (!hasAssignRolePermission(user.role, targetRole)) return { error: "Unauthorized" };

    await updateUser(userId, { roleId });

    revalidatePath("/team");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Role change failed. Please try again." };
  }
}
