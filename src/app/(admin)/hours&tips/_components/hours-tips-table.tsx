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
import { TotalHoursTips } from "@/types";
import Link from "next/link";

type HoursTipsTableProps = {
  data: TotalHoursTips[];
};

export async function HoursTipsTable({ data }: HoursTipsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-sm">Name</TableHead>
          <TableHead className="text-center">Hours</TableHead>
          <TableHead className="text-center">Tips</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((employee) => (
          <TableRow key={employee.identityId}>
            <TableCell className="flex items-center gap-2">
              <Link
                href={`/profile/${employee.username}`}
                className="group flex w-max items-center gap-2"
              >
                <ProfilePicture image={employee.image} size={32} name={employee.name} />
                <span className="underline-offset-2 group-hover:underline">{employee.name}</span>
              </Link>
            </TableCell>
            <TableCell className="text-center">{employee.totalHours}</TableCell>
            <TableCell className="text-center">{formatMoney(employee.totalTips)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
