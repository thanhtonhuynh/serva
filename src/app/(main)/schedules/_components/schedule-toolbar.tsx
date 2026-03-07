"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  CircleArrowReload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type ScheduleToolbarProps = {
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function ScheduleToolbar({
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  onSave,
  onReset,
  onUndo,
  onRedo,
}: ScheduleToolbarProps) {
  return (
    <div className="flex items-center gap-2 self-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" disabled={!canUndo} onClick={onUndo} />}
          >
            <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" disabled={!canRedo} onClick={onRedo} />}
          >
            <HugeiconsIcon icon={ArrowTurnForwardIcon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={<Button variant="ghost" size="icon-sm" disabled={!isDirty} onClick={onReset} />}
          >
            <HugeiconsIcon icon={CircleArrowReload01Icon} className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Reset</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <LoadingButton size="sm" disabled={!isDirty} loading={isSaving} onClick={onSave}>
        Save
      </LoadingButton>
    </div>
  );
}
