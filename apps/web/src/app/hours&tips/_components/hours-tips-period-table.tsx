import { ProfilePicture } from "@serva/serva-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@serva/serva-ui";
import { BreakdownData, formatInUTC, formatMoney, type DateRange } from "@serva/shared";
import { addDays } from "date-fns";

type HoursTipsPeriodTableProps = {
  dateRange: DateRange;
  hoursData: BreakdownData[];
  tipsData: BreakdownData[];
};

type EmployeePeriodRow = {
  employeeId: string;
  name: string;
  image: string;
  hoursByDay: number[];
  tipsByDay: number[];
  hoursTotal: number;
  tipsTotal: number;
};

export function HoursTipsPeriodTable({
  dateRange,
  hoursData,
  tipsData,
}: HoursTipsPeriodTableProps) {
  const startDay = dateRange.start.getUTCDate();
  const endDay = dateRange.end.getUTCDate();
  const totalDays = endDay - startDay + 1;

  const rowsMap = new Map<string, EmployeePeriodRow>();

  for (const employee of hoursData) {
    rowsMap.set(employee.employeeId, {
      employeeId: employee.employeeId,
      name: employee.name,
      image: employee.image,
      hoursByDay: employee.keyData,
      tipsByDay: Array(totalDays).fill(0),
      hoursTotal: employee.total,
      tipsTotal: 0,
    });
  }

  for (const employee of tipsData) {
    const existing = rowsMap.get(employee.employeeId);
    if (existing) {
      existing.tipsByDay = employee.keyData;
      existing.tipsTotal = employee.total;
      continue;
    }

    rowsMap.set(employee.employeeId, {
      employeeId: employee.employeeId,
      name: employee.name,
      image: employee.image,
      hoursByDay: Array(totalDays).fill(0),
      tipsByDay: employee.keyData,
      hoursTotal: 0,
      tipsTotal: employee.total,
    });
  }

  const rows = Array.from(rowsMap.values());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-18 border-r">Name</TableHead>

          {Array.from({ length: totalDays }).map((_, index) => (
            <TableHead className="text-center" key={index}>
              <div className="flex flex-col gap-1">
                <span>{formatInUTC(addDays(dateRange.start, index), "EEE")}</span>
                {startDay + index}
              </div>
            </TableHead>
          ))}

          <TableHead className="text-primary text-right font-medium">Total</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((employee) => (
          <TableRow key={employee.employeeId}>
            <TableCell className="border-r">
              <div className="flex items-center gap-2">
                <ProfilePicture image={employee.image} size={32} name={employee.name} />
                <span className="underline-offset-2 group-hover:underline">{employee.name}</span>
              </div>
            </TableCell>

            {Array.from({ length: totalDays }).map((_, index) => {
              const hours = employee.hoursByDay[index] ?? 0;
              const tips = employee.tipsByDay[index] ?? 0;

              return (
                <TableCell className="text-center" key={index}>
                  <div className="space-y-1">
                    <div>{hours > 0 ? hours : "-"}</div>
                    <div className="text-muted-foreground text-xs">
                      {tips > 0 ? formatMoney(tips) : "-"}
                    </div>
                  </div>
                </TableCell>
              );
            })}

            <TableCell className="text-right">
              <div className="text-primary space-y-1 font-medium">
                <div>{employee.hoursTotal}</div>
                <div className="text-xs">{formatMoney(employee.tipsTotal)}</div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
