"use server";

import {
  UpdateActivePlatformsInput,
  UpdateActivePlatformsSchema,
  UpdateStartCashInput,
  UpdateStartCashSchema,
} from "@/libs/validations/store";
import { authorizeAction, hasSessionPermission } from "@serva/auth/authorize";
import { updateCompanySettings } from "@serva/database/dal";
import { PERMISSIONS, toCents } from "@serva/shared";
import { revalidatePath } from "next/cache";

export async function updateStartCash(data: UpdateStartCashInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.STORE_SETTINGS_MANAGE)))
      return { error: "Unauthorized." };

    const { startCash } = UpdateStartCashSchema.parse(data);
    const { companyCtx } = authResult;

    await updateCompanySettings(companyCtx.companyId, { startCash: toCents(startCash) });

    revalidatePath("/store-settings");
    return {};
  } catch (error) {
    return { error: "Update start cash failed. Please try again." };
  }
}

export async function updateActivePlatforms(
  data: UpdateActivePlatformsInput,
): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.STORE_SETTINGS_MANAGE)))
      return { error: "Unauthorized." };

    const { activePlatforms } = UpdateActivePlatformsSchema.parse(data);
    const { companyCtx } = authResult;

    await updateCompanySettings(companyCtx.companyId, { activePlatforms });

    revalidatePath("/store-settings");
    return {};
  } catch (error) {
    return { error: "Update platforms failed. Please try again." };
  }
}
