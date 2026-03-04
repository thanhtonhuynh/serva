"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { upsertReport } from "@/data-access/report";
import { getCurrentSession } from "@/lib/auth/session";
import { SaleReportInputs, SaleReportSchema } from "@/lib/validations/report";
import { hasPermission } from "@/utils/access-control";
import { getTodayStartOfDay } from "@/utils/datetime";
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

      const today = getTodayStartOfDay();
      if (mode === "create" && data.date.getTime() !== today.getTime()) {
        return { error: "Unauthorized." };
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

    const report = await upsertReport(parsedData, user.id);

    return { reportDate: report.date, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Save report failed. Please try again." };
  }
}
