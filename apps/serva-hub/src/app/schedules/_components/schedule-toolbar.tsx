"use client";

import { LoadingButton } from "@serva/serva-ui";
import { ConfirmDialog, SIcon } from "@serva/serva-ui";
import { Button } from "@serva/serva-ui";
import { useState } from "react";

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

export function ScheduleToolbar(props: Props) {
  const { isDirty, isSaving, canUndo, canRedo, onUndo, onRedo, onSave, onReset } = props;
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" disabled={!canUndo} onClick={onUndo}>
        <SIcon icon="ARROW_TURN_BACKWARD" />
        <span>Undo</span>
      </Button>

      <Button variant="ghost" size="sm" disabled={!canRedo} onClick={onRedo}>
        <SIcon icon="ARROW_TURN_FORWARD" />
        <span>Redo</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!isDirty}
        onClick={() => setResetConfirmOpen(true)}
      >
        <SIcon icon="CIRCLE_ARROW_RELOAD" />
        <span>Reset</span>
      </Button>

      <LoadingButton size="sm" disabled={!isDirty} loading={isSaving} onClick={onSave}>
        Save
      </LoadingButton>

      <ConfirmDialog
        open={resetConfirmOpen}
        onConfirm={() => {
          onReset();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
        title="Reset schedule?"
        description={`This will reset the schedule to the original state.\nAny changes you've made will be lost.`}
        confirmLabel="Reset"
        cancelLabel="Keep changes"
      />
    </div>
  );
}
