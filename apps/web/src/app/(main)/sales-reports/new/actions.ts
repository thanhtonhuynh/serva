"use server";

import { PERMISSIONS } from "@/constants/permissions";
import { upsertReport } from "@/data-access/report";
import { authorizeAction, hasSessionPermission } from "@/lib/auth/authorize";
import { SaleReportInputs, SaleReportSchema } from "@/lib/validations/report";

export async function saveReportAction(
  data: SaleReportInputs,
  mode: "create" | "edit",
): Promise<{ reportDate?: Date; error?: string }> {
  try {
    const authResult = await authorizeAction();
    if ("error" in authResult) return authResult;

    if (mode === "edit" && !(await hasSessionPermission(PERMISSIONS.REPORTS_UPDATE))) {
      return { error: "Unauthorized." };
    }
    if (mode === "create" && !(await hasSessionPermission(PERMISSIONS.REPORTS_CREATE))) {
      return { error: "Unauthorized." };
    }

    const parsedData = SaleReportSchema.parse(data);
    const { companyCtx } = authResult;

    const result = await upsertReport(parsedData, authResult.identity.id, companyCtx.companyId);

    return {
      reportDate: result.report.date,
    };
  } catch (error) {
    return { error: "Save report failed. Please try again." };
  }
}
