"use server";

import { authorizeAction, hasSessionPermission } from "@serva/auth/authorize";
import {
  CreateRoleInput,
  CreateRoleSchema,
  UpdateRoleInput,
  UpdateRoleSchema,
} from "@/lib/validations/roles";
import { createRole, deleteRole, roleNameExists, updateRole } from "@serva/database";
import { PERMISSIONS } from "@serva/shared";
import { revalidatePath } from "next/cache";

export async function createRoleAction(data: CreateRoleInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.ROLES_MANAGE))) return { error: "Unauthorized" };

    const parsedData = CreateRoleSchema.parse(data);
    const { companyCtx } = authResult;

    if (await roleNameExists(parsedData.name, companyCtx.companyId)) {
      return { error: "A role with this name already exists" };
    }

    await createRole(companyCtx.companyId, parsedData);

    revalidatePath("/roles");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Failed to create role. Please try again." };
  }
}

export async function updateRoleAction(data: UpdateRoleInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.ROLES_MANAGE))) return { error: "Unauthorized" };

    const parsedData = UpdateRoleSchema.parse(data);
    const { companyCtx } = authResult;

    if (await roleNameExists(parsedData.name, companyCtx.companyId, parsedData.id)) {
      return { error: "A role with this name already exists" };
    }

    await updateRole(parsedData.id, {
      name: parsedData.name,
      description: parsedData.description,
      permissionIds: parsedData.permissionIds,
    });

    revalidatePath("/roles");
    return {};
  } catch (error) {
    console.error(error);
    return { error: "Failed to update role. Please try again." };
  }
}

export async function deleteRoleAction(id: string): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.ROLES_MANAGE))) return { error: "Unauthorized" };

    await deleteRole(id);

    revalidatePath("/roles");
    return {};
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "Cannot delete system roles") {
      return { error: "Cannot delete system roles" };
    }
    return { error: "Failed to delete role. Please try again." };
  }
}
