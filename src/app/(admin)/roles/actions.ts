"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { createRole, deleteRole, roleNameExists, updateRole } from "@/data-access/roles";
import { getCurrentSession } from "@/lib/auth/session";
import {
  CreateRoleInput,
  CreateRoleSchema,
  UpdateRoleInput,
  UpdateRoleSchema,
} from "@/lib/validations/roles";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { revalidatePath } from "next/cache";

export async function createRoleAction(data: CreateRoleInput) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.ROLES_MANAGE)
    ) {
      return { error: "Unauthorized" };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const parsedData = CreateRoleSchema.parse(data);

    // Check if role name already exists
    if (await roleNameExists(parsedData.name)) {
      return { error: "A role with this name already exists" };
    }

    await createRole(parsedData);

    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create role. Please try again." };
  }
}

export async function updateRoleAction(data: UpdateRoleInput) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.ROLES_MANAGE)
    ) {
      return { error: "Unauthorized" };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const parsedData = UpdateRoleSchema.parse(data);

    // Check if role name already exists (excluding current role)
    if (await roleNameExists(parsedData.name, parsedData.id)) {
      return { error: "A role with this name already exists" };
    }

    await updateRole(parsedData.id, {
      name: parsedData.name,
      description: parsedData.description,
      permissionIds: parsedData.permissionIds,
    });

    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update role. Please try again." };
  }
}

export async function deleteRoleAction(id: string) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.ROLES_MANAGE)
    ) {
      return { error: "Unauthorized" };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    await deleteRole(id);

    revalidatePath("/roles");
    return { success: true };
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "Cannot delete system roles") {
      return { error: "Cannot delete system roles" };
    }
    return { error: "Failed to delete role. Please try again." };
  }
}
