"use server";

import { authorizeAction, hasSessionPermission } from "@/libs/auth";
import { SaleReportInputs, SaleReportSchema } from "@/libs/validations/report";
import { upsertReport } from "@serva/database/dal";
import { PERMISSIONS } from "@serva/shared";

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
