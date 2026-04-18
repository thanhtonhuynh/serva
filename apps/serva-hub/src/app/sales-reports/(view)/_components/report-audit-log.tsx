"use client";

import { DecoIcon, ICONS, ProfilePicture, Typography } from "@serva/serva-ui";
import type { ReportAuditLog } from "@serva/shared/types";
import { format } from "date-fns";

type Props = {
  auditLogs: ReportAuditLog[] | undefined;
};

export function ReportAuditLog({ auditLogs }: Props) {
  if (auditLogs === undefined || auditLogs.length === 0) return null;

  const sortedAuditLogs = auditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="bg-accent/30 space-y-3 rounded-xl border p-3">
      <Typography variant="h3">Audit Log</Typography>

      <div className="space-y-2 text-sm">
        {sortedAuditLogs.map((log) => (
          <div
            key={`${log.identityId}-${log.timestamp.toISOString()}`}
            className="flex flex-col gap-1 border-b py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
          >
            <div className="flex items-center gap-1">
              <DecoIcon icon={ICONS.DOT} fill="currentColor" size={2} />
              <Typography variant="p-sm">Edited by</Typography>

              <div
                // href={`/profile/${log.username}`}
                className="group flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <ProfilePicture image={log.image} size={24} name={log.name} />
                <span className="group-hover:underline">{log.name}</span>
              </div>
            </div>

            <Typography variant="p-xs" className="text-muted-foreground self-end sm:self-center">
              {format(log.timestamp, "MMM d, yyyy hh:mm a")}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
