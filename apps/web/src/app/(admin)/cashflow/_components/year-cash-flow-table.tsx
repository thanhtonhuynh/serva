import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Platform, type YearCashFlowData } from "@serva/shared";
import { formatMoney } from "@/lib/utils";

type Props = {
  data: YearCashFlowData[];
  platforms: Platform[];
};

export function YearCashFlowTable({ data, platforms }: Props) {
  const yearTotal = data.reduce(
    (acc, monthData) => {
      acc.totalSales += monthData.totalSales;
      acc.totalInStoreSales += monthData.totalInStoreSales;
      acc.totalInstoreExpenses += monthData.totalInstoreExpenses;
      acc.totalMonthMainExpenses += monthData.totalMonthMainExpenses;
      acc.totalExpenses += monthData.totalExpenses;
      acc.netIncome += monthData.netIncome;

      // Accumulate platform totals
      for (const [platformId, amount] of Object.entries(monthData.platformTotals)) {
        acc.platformTotals[platformId] = (acc.platformTotals[platformId] ?? 0) + amount;
      }

      return acc;
    },
    {
      totalSales: 0,
      totalInStoreSales: 0,
      totalInstoreExpenses: 0,
      totalMonthMainExpenses: 0,
      totalExpenses: 0,
      netIncome: 0,
      platformTotals: {} as Record<string, number>,
    },
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="">Month</TableHead>
          <TableHead className="text-center">In-store sales</TableHead>
          {platforms.map((p) => (
            <TableHead key={p.id} className="text-center">
              {p.label}
            </TableHead>
          ))}
          <TableHead className="text-center">Total sales</TableHead>
          <TableHead className="text-center">In-store expenses</TableHead>
          <TableHead className="text-center">Main expenses</TableHead>
          <TableHead className="text-center">Total expenses</TableHead>
          <TableHead className="text-right">Net income</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((monthData) => (
          <TableRow key={monthData.month}>
            <TableCell className="">{monthData.month}</TableCell>
            <TableCell className="text-center">
              {formatMoney(monthData.totalInStoreSales)}
            </TableCell>
            {platforms.map((p) => (
              <TableCell key={p.id} className="text-center">
                {formatMoney(monthData.platformTotals[p.id] ?? 0)}
              </TableCell>
            ))}
            <TableCell className="text-center">{formatMoney(monthData.totalSales)}</TableCell>
            <TableCell className="text-center">
              {formatMoney(monthData.totalInstoreExpenses)}
            </TableCell>
            <TableCell className="text-center">
              {formatMoney(monthData.totalMonthMainExpenses)}
            </TableCell>
            <TableCell className="text-center">{formatMoney(monthData.totalExpenses)}</TableCell>
            <TableCell className="text-right">{formatMoney(monthData.netIncome)}</TableCell>
          </TableRow>
        ))}

        <TableRow>
          <TableCell className="font-bold">Totals</TableCell>
          <TableCell className="text-center font-bold">
            {formatMoney(yearTotal.totalInStoreSales)}
          </TableCell>
          {platforms.map((p) => (
            <TableCell key={p.id} className="text-center font-bold">
              {formatMoney(yearTotal.platformTotals[p.id] ?? 0)}
            </TableCell>
          ))}
          <TableCell className="text-center font-bold">
            {formatMoney(yearTotal.totalSales)}
          </TableCell>
          <TableCell className="text-center font-bold">
            {formatMoney(yearTotal.totalInstoreExpenses)}
          </TableCell>
          <TableCell className="text-center font-bold">
            {formatMoney(yearTotal.totalMonthMainExpenses)}
          </TableCell>
          <TableCell className="text-center font-bold">
            {formatMoney(yearTotal.totalExpenses)}
          </TableCell>
          <TableCell className="text-right font-bold">{formatMoney(yearTotal.netIncome)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
