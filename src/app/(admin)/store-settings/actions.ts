"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { updateStoreSettings } from "@/data-access/store";
import { getCurrentSession } from "@/lib/auth/session";
import { toCents } from "@/lib/utils";
import {
  UpdateActivePlatformsInput,
  UpdateActivePlatformsSchema,
  UpdateStartCashInput,
  UpdateStartCashSchema,
} from "@/lib/validations/store";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { revalidatePath } from "next/cache";

export async function updateStartCash(data: UpdateStartCashInput) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.STORE_SETTINGS_MANAGE)
    ) {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { startCash } = UpdateStartCashSchema.parse(data);

    await updateStoreSettings({ startCash: toCents(startCash) });

    revalidatePath("/store-settings");
    return {};
  } catch (error) {
    console.log(error);
    return { error: "Update start cash failed. Please try again." };
  }
}

export async function updateActivePlatforms(data: UpdateActivePlatformsInput) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.STORE_SETTINGS_MANAGE)
    ) {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    const { activePlatforms } = UpdateActivePlatformsSchema.parse(data);

    await updateStoreSettings({ activePlatforms });

    revalidatePath("/store-settings");
    return {};
  } catch (error) {
    console.log(error);
    return { error: "Update platforms failed. Please try again." };
  }
}
