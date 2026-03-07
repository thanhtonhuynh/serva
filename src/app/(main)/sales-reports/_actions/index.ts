"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { deleteReportById, reportExists } from "@/data-access/report";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit } from "@/utils/rate-limiter";
import { revalidatePath } from "next/cache";

export async function deleteReportAction(reportId: string) {
  try {
    const { user } = await getCurrentSession();
    if (
      !user ||
      user.accountStatus !== "active" ||
      !hasPermission(user.role, PERMISSIONS.REPORTS_DELETE)
    ) {
      return "Unauthorized.";
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return "Too many requests. Please try again later.";
    }

    // Check if report exists
    const isReportExisted = await reportExists(reportId);
    if (!isReportExisted) {
      return "Report not found.";
    }

    // Delete the report
    await deleteReportById(reportId);

    revalidatePath("/sales-reports/(view)", "page");
  } catch (error) {
    console.error(error);
    return "Failed to delete report";
  }
}
