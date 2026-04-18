import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@serva/serva-ui";
import { formatInUTC, formatMoney } from "@serva/shared";
import type { DateRange, UserShift } from "@serva/shared/types";
import { addDays } from "date-fns";

export function UserShiftTable({
  dateRange,
  userShifts,
}: {
  dateRange: DateRange;
  userShifts: UserShift[];
}) {
  const startDay = dateRange.start.getUTCDate();
  const endDay = dateRange.end.getUTCDate();

  const hours = Array.from({ length: endDay - startDay + 1 }).map((_, index) => {
    return userShifts.find((shift) => shift.date.getUTCDate() === startDay + index)?.hours || 0;
  });
  const tips = Array.from({ length: endDay - startDay + 1 }).map((_, index) => {
    return userShifts.find((shift) => shift.date.getUTCDate() === startDay + index)?.tips || 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-18">Date</TableHead>
          {Array.from({ length: endDay - startDay + 1 }).map((_, index) => (
            <TableHead className="h-18 text-center" key={index}>
              <div className="flex flex-col gap-1">
                <span>{formatInUTC(addDays(dateRange.start, index), "EEE")}</span>
                {startDay + index}
              </div>
            </TableHead>
          ))}
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Hours</TableCell>
          {hours.map((hour, index) => (
            <TableCell key={index} className="text-center">
              {hour > 0 ? hour : "-"}
            </TableCell>
          ))}
          <TableCell className="text-right">
            {userShifts.reduce((acc, shift) => acc + shift.hours, 0)}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell className="font-medium">Tips</TableCell>
          {tips.map((tip, index) => (
            <TableCell key={index} className="text-center">
              {tip > 0 ? formatMoney(tip) : "-"}
            </TableCell>
          ))}
          <TableCell className="text-right">
            {formatMoney(userShifts.reduce((acc, shift) => acc + shift.tips, 0))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
