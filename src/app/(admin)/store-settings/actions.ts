"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { updateStoreSettings } from "@/data-access/store";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { toCents } from "@/lib/utils";
import {
  UpdateActivePlatformsInput,
  UpdateActivePlatformsSchema,
  UpdateStartCashInput,
  UpdateStartCashSchema,
} from "@/lib/validations/store";
import { revalidatePath } from "next/cache";

export async function updateStartCash(data: UpdateStartCashInput): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.STORE_SETTINGS_MANAGE)))
      return { error: "Unauthorized." };

    const { startCash } = UpdateStartCashSchema.parse(data);

    await updateStoreSettings({ startCash: toCents(startCash) });

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

    await updateStoreSettings({ activePlatforms });

    revalidatePath("/store-settings");
    return {};
  } catch (error) {
    return { error: "Update platforms failed. Please try again." };
  }
}
