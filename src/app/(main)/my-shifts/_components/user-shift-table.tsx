import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/utils";
import { DayRange, UserShift } from "@/types";
import { addDays, format } from "date-fns";

export function UserShiftTable({
  dateRange,
  userShifts,
}: {
  dateRange: DayRange;
  userShifts: UserShift[];
}) {
  const startDay = dateRange.start.getDate();
  const endDay = dateRange.end.getDate();

  const hours = Array.from({ length: endDay - startDay + 1 }).map((_, index) => {
    return userShifts.find((shift) => shift.date.getDate() === startDay + index)?.hours || 0;
  });
  const tips = Array.from({ length: endDay - startDay + 1 }).map((_, index) => {
    return userShifts.find((shift) => shift.date.getDate() === startDay + index)?.tips || 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-18">Date</TableHead>
          {Array.from({ length: endDay - startDay + 1 }).map((_, index) => (
            <TableHead className="h-18 text-center" key={index}>
              <div className="flex flex-col gap-1">
                <span>{format(addDays(dateRange.start, index), "EEE")}</span>
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
              {tip > 0 ? formatMoney(tip / 100) : "-"}
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
