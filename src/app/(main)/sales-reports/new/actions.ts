"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { upsertReport } from "@/data-access/report";
import { getCurrentSession } from "@/lib/auth/session";
import { SaleReportInputs, SaleReportSchema } from "@/lib/validations/report";
import { hasPermission } from "@/utils/access-control";
import { getTodayUTCMidnight } from "@/utils/datetime";
import { authenticatedRateLimit, rateLimitByKey } from "@/utils/rate-limiter";

export async function saveReportAction(data: SaleReportInputs, mode: "create" | "edit") {
  try {
    const { user } = await getCurrentSession();
    if (!user || user.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    console.log(user.role);
    console.log(hasPermission(user.role, PERMISSIONS.REPORTS_UPDATE));
    console.log(hasPermission(user.role, PERMISSIONS.REPORTS_CREATE));

    if (mode === "edit" && !hasPermission(user.role, PERMISSIONS.REPORTS_UPDATE)) {
      return { error: "Unauthorized." };
    } else {
      if (mode === "create" && !hasPermission(user.role, PERMISSIONS.REPORTS_CREATE)) {
        return { error: "Unauthorized." };
      }

      // If creating a report for a date other than today, return an error
      const today = getTodayUTCMidnight();
      if (
        mode === "create" &&
        (data.date.getUTCFullYear() !== today.getUTCFullYear() ||
          data.date.getUTCMonth() !== today.getUTCMonth() ||
          data.date.getUTCDate() !== today.getUTCDate())
      ) {
        return { error: "An error occurred. Please try again." };
      }
    }

    if (!(await authenticatedRateLimit(user.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    if (
      !(await rateLimitByKey({
        key: `${user.id}-create-report`,
        limit: 3,
        interval: 30000,
      }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const parsedData = SaleReportSchema.parse(data);

    const result = await upsertReport(parsedData, user.id);

    return {
      reportDate: result.report.date,
      error: null,
      noWorkDayRecordsWarning: result.noWorkDayRecordsWarning,
    };
  } catch (error) {
    console.error(error);
    return { error: "Save report failed. Please try again." };
  }
}
