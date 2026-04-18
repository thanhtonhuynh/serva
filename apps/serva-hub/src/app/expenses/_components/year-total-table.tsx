import { SHORT_MONTHS } from "@/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@serva/serva-ui";
import { formatMoney } from "@serva/shared";
import type { MonthlyExpense } from "@serva/shared/types";

type Props = {
  monthlyExpenses: MonthlyExpense[];
};

export function YearTotalTable({ monthlyExpenses }: Props) {
  const yearTotal = monthlyExpenses.reduce((acc, month) => acc + month.totalExpenses, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {SHORT_MONTHS.map((month, index) => (
            <TableHead key={index} className="text-center">
              {month}
            </TableHead>
          ))}
          <TableHead className="text-center font-bold">Year total</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          {monthlyExpenses.map((monthData) => (
            <TableCell key={monthData.month} className="text-center">
              {monthData.totalExpenses ? formatMoney(monthData.totalExpenses) : "-"}
            </TableCell>
          ))}

          <TableCell className="text-center font-bold">{formatMoney(yearTotal)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
