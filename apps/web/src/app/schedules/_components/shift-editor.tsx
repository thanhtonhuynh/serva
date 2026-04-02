"use client";

import { Button } from "@serva/serva-ui";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@serva/serva-ui";
import { Input } from "@serva/serva-ui";
import { Label } from "@serva/serva-ui";
import { Textarea } from "@serva/serva-ui";
import type { WorkShiftInput } from "@/lib/validations";
import { useState } from "react";
import { toast } from "sonner";
import { minutesToTimeInput, timeToMinutes } from "../_lib";

type ShiftEditorProps = {
  initial?: WorkShiftInput;
  onSave: (shift: WorkShiftInput) => void;
  trigger: React.ReactElement;
};

export function ShiftEditor({ initial, onSave, trigger }: ShiftEditorProps) {
  const defaultShift = initial ?? { startMinutes: 9 * 60, endMinutes: 17 * 60 };
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState(minutesToTimeInput(defaultShift.startMinutes));
  const [endTime, setEndTime] = useState(minutesToTimeInput(defaultShift.endMinutes));
  const [note, setNote] = useState(initial?.note ?? "");

  function resetFields() {
    const shift = initial ?? { startMinutes: 9 * 60, endMinutes: 17 * 60 };
    setStartTime(minutesToTimeInput(shift.startMinutes));
    setEndTime(minutesToTimeInput(shift.endMinutes));
    setNote(initial?.note ?? "");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) resetFields();
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start >= end) {
      toast.error("End time must be after start time.");
      return;
    }
    onSave({ startMinutes: start, endMinutes: end, note: note || undefined });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger id="shift-editor-trigger" render={trigger} />

      <DialogContent>
        <DialogHeader showBorder>
          <DialogTitle>{initial ? "Edit shift" : "Add shift"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogBody className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label>Start time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-fit"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>End time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-fit"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Host stand"
                className="resize-none"
              />
            </div>
          </DialogBody>

          <DialogFooter showCloseButton closeText="Cancel">
            <Button type="submit" size="sm">
              {initial ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
