import { getCurrentMonth, getCurrentYear } from "@/utils/datetime";
import { redirect } from "next/navigation";

export default function CashflowPage() {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth() + 1; // 1-indexed

  redirect(`/cashflow/monthly?year=${currentYear}&month=${currentMonth}`);
}
