import { ProfilePicture } from "@/components/shared/profile-picture";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/utils";
import { BreakdownData, DateRange, formatInUTC } from "@serva/shared";
import { addDays } from "date-fns";

type DataTableProps = {
  dateRange: DateRange;
  data: BreakdownData[];
  isMoney?: boolean;
};

export async function DataTable({ dateRange, data, isMoney = false }: DataTableProps) {
  const startDay = dateRange.start.getUTCDate();
  const endDay = dateRange.end.getUTCDate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-18 border-r">Name</TableHead>

          {Array.from({ length: endDay - startDay + 1 }).map((_, index) => (
            <TableHead className="text-center" key={index}>
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
        {data.map((employee) => (
          <TableRow key={employee.employeeId}>
            <TableCell className="flex items-center gap-2 border-r">
              {/* <Link
                href={`/profile/${employee.username}`}
                className="group flex w-max items-center gap-2"
              > */}
              <ProfilePicture image={employee.image} size={32} name={employee.name} />
              <span className="underline-offset-2 group-hover:underline">{employee.name}</span>
              {/* </Link> */}
            </TableCell>

            {employee.keyData.map((key, index) => (
              <TableCell className="text-center" key={index}>
                {key > 0 ? (isMoney ? formatMoney(key) : key) : "-"}
              </TableCell>
            ))}

            <TableCell className="text-right">
              {isMoney ? formatMoney(employee.total) : employee.total}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
