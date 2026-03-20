"use client";

import { Typography } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ICONS } from "@/constants/icons";
import { formatInUTC } from "@/utils/datetime";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteReportAction } from "../../_actions";

type Props = {
  reportId: string;
  date: Date;
};

export function DeleteReportModal({ reportId, date }: Props) {
  const [isPending, startTransition] = useTransition();

  async function handleDeleteReport() {
    startTransition(async () => {
      const { error } = await deleteReportAction(reportId);
      if (error) toast.error(error);
      else {
        toast(`Report has been deleted.`);
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size={"sm"} variant={"destructive"}>
            <HugeiconsIcon icon={ICONS.DELETE} />
            Delete
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>Delete report on {formatInUTC(date)}?</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Typography>
            <div className="font-semibold">Are you sure you want to delete this report?</div>
            <div>This action cannot be undone.</div>
            <div>
              It will also remove all employees' hours and tips associated with this report.
            </div>
          </Typography>
        </DialogBody>

        <DialogFooter showCloseButton closeText="Cancel">
          <Button variant="destructive" onClick={handleDeleteReport} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
