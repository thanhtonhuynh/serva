"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { upsertReport } from "@/data-access/report";
import { getCurrentSession } from "@/lib/auth/session";
import { SaleReportInputs, SaleReportSchema } from "@/lib/validations/report";
import { hasPermission } from "@/utils/access-control";
import { authenticatedRateLimit, rateLimitByKey } from "@/utils/rate-limiter";

export async function saveReportAction(data: SaleReportInputs, mode: "create" | "edit") {
  try {
    const { identity } = await getCurrentSession();
    if (!identity || identity.accountStatus !== "active") {
      return { error: "Unauthorized." };
    }

    if (mode === "edit" && !hasPermission(identity.role, PERMISSIONS.REPORTS_UPDATE)) {
      return { error: "Unauthorized." };
    }
    if (mode === "create" && !hasPermission(identity.role, PERMISSIONS.REPORTS_CREATE)) {
      return { error: "Unauthorized." };
    }

    if (!(await authenticatedRateLimit(identity.id))) {
      return { error: "Too many requests. Please try again later." };
    }

    if (
      !(await rateLimitByKey({
        key: `${identity.id}-create-report`,
        limit: 3,
        interval: 30000,
      }))
    ) {
      return { error: "Too many requests. Please try again later." };
    }

    const parsedData = SaleReportSchema.parse(data);

    const result = await upsertReport(parsedData, identity.id);

    return {
      reportDate: result.report.date,
      error: null,
    };
  } catch (error) {
    return { error: "Save report failed. Please try again." };
  }
}
