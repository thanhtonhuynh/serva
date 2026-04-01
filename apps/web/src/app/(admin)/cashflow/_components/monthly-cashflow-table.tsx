import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui/components/table";
import { CashFlowData, formatMoney, getPlatformAmount, type Platform } from "@serva/shared";

type Props = {
  reports: CashFlowData[];
  platforms: Platform[];
};

export function MonthlyCashFlowTable({ reports, platforms }: Props) {
  // Calculate totals dynamically
  const totals = reports.reduce(
    (acc, report) => {
      acc.totalSales += report.totalSales;
      acc.cardSales += report.cardSales;
      acc.actualCash += report.actualCash;
      acc.expenses += report.expenses;
      acc.totalRevenue += report.totalRevenue;

      // Accumulate platform totals
      for (const ps of report.platformSales) {
        acc.platformTotals[ps.platformId] = (acc.platformTotals[ps.platformId] ?? 0) + ps.amount;
      }

      return acc;
    },
    {
      totalSales: 0,
      cardSales: 0,
      actualCash: 0,
      expenses: 0,
      totalRevenue: 0,
      platformTotals: {} as Record<string, number>,
    },
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="">Date</TableHead>
          <TableHead className="text-center">Reported total</TableHead>
          <TableHead className="text-center">Card sales</TableHead>
          <TableHead className="text-center">Actual cash</TableHead>
          {platforms.map((p) => (
            <TableHead key={p.id} className="text-center">
              {p.label}
            </TableHead>
          ))}
          <TableHead className="text-center">Expenses</TableHead>
          <TableHead className="text-right">Total revenue</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {reports.map((report) => {
          return (
            <TableRow key={report.id}>
              <TableCell className="">{report.date.getUTCDate()}</TableCell>
              <TableCell className="text-center">{formatMoney(report.totalSales)}</TableCell>
              <TableCell className="text-center">{formatMoney(report.cardSales)}</TableCell>
              <TableCell className="text-center">{formatMoney(report.actualCash)}</TableCell>
              {platforms.map((p) => (
                <TableCell key={p.id} className="text-center">
                  {formatMoney(getPlatformAmount(report.platformSales, p.id))}
                </TableCell>
              ))}
              <TableCell className="text-center">{formatMoney(report.expenses)}</TableCell>
              <TableCell className="text-right">{formatMoney(report.totalRevenue)}</TableCell>
            </TableRow>
          );
        })}

        <TableRow>
          <TableCell className="font-bold">Totals</TableCell>
          <TableCell className="text-center font-bold">{formatMoney(totals.totalSales)}</TableCell>
          <TableCell className="text-center font-bold">{formatMoney(totals.cardSales)}</TableCell>
          <TableCell className="text-center font-bold">{formatMoney(totals.actualCash)}</TableCell>
          {platforms.map((p) => (
            <TableCell key={p.id} className="text-center font-bold">
              {formatMoney(totals.platformTotals[p.id] ?? 0)}
            </TableCell>
          ))}
          <TableCell className="text-center font-bold">{formatMoney(totals.expenses)}</TableCell>
          <TableCell className="text-right font-bold">{formatMoney(totals.totalRevenue)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
