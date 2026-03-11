"use client";

import { LoadingButton } from "@/components/buttons/LoadingButton";
import { Icon } from "@/components/shared";
import { Button } from "@/components/ui/button";

type Props = {
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
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" disabled={!canUndo} onClick={onUndo}>
        <Icon icon="ARROW_TURN_BACKWARD" />
        <span>Undo</span>
      </Button>

      <Button variant="ghost" size="sm" disabled={!canRedo} onClick={onRedo}>
        <Icon icon="ARROW_TURN_FORWARD" />
        <span>Redo</span>
      </Button>

      <Button variant="ghost" size="sm" disabled={!isDirty} onClick={onReset}>
        <Icon icon="CIRCLE_ARROW_RELOAD" />
        <span>Reset</span>
      </Button>

      <LoadingButton size="sm" disabled={!isDirty} loading={isSaving} onClick={onSave}>
        Save
      </LoadingButton>
    </div>
  );
}
