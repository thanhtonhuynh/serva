"use server";

import { PERMISSIONS } from "@serva/shared";
import { deleteReportById, reportExists } from "@serva/database";
import { authorizeAction, hasSessionPermission } from "@serva/auth/authorize";
import { revalidatePath } from "next/cache";

export async function deleteReportAction(reportId: string): Promise<{ error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;
    if (!(await hasSessionPermission(PERMISSIONS.REPORTS_DELETE))) return { error: "Unauthorized" };

    // Check if report exists
    const isReportExisted = await reportExists(reportId);
    if (!isReportExisted) {
      return { error: "Report not found" };
    }

    // Delete the report
    await deleteReportById(reportId);

    revalidatePath("/sales-reports/(view)", "page");
    return {};
  } catch (error) {
    return { error: "Failed to delete report" };
  }
}
